var events             = require('events');
var util               = require('util');

var $                  = require('NodObjC');

var PeripheralDelegate = require('./peripheral-delegate');
var Service            = require('./service');
var $util              = require('./util');

function Peripheral($peripheral) {
  this.$           = $peripheral('retain');

  this.identifier  = $util.identifierFor$Peripheral(this.$);
  this.delegate    = new PeripheralDelegate();

  this._attributes = {};

  this.delegate.on('rssiUpdate', this._onRssiUpdate.bind(this));
  this.delegate.on('servicesDiscover', this._onServicesDiscover.bind(this));
  this.delegate.on('serviceIncludedServicesDiscover', this._onServiceIncludedServicesDiscover.bind(this));
  this.delegate.on('serviceCharacteristicsDiscover', this._onServiceCharacteristicsDiscover.bind(this));
  this.delegate.on('characteristicDescriptorsDiscover', this._onCharacteristicDescriptorsDiscover.bind(this));
  this.delegate.on('characteristicValueUpdate', this._onCharacteristicValueUpdate.bind(this));
  this.delegate.on('characteristicNotificationStateUpdate', this._onCharacteristicNotificationStateUpdate.bind(this));
  this.delegate.on('characteristicValueWrite', this._onCharacteristicValueWrite.bind(this));
  this.delegate.on('descriptorValueUpdate', this._onDescriptorValueUpdate.bind(this));
  this.delegate.on('descriptorValueWrite', this._onDescriptorValueWrite.bind(this));

  this.$('setDelegate', this.delegate.$);
}

util.inherits(Peripheral, events.EventEmitter);

Peripheral.prototype.toString = function() {
  return JSON.stringify({
    identifier: this.identifier,
    services: this.services
  });
};

Peripheral.prototype.connect = function() {
  this.centralManager.connect(this);
};

Peripheral.prototype.cancelConnection = function() {
  this.centralManager.cancelConnection(this);
};

Peripheral.prototype.readRSSI = function() {
  this.$('readRSSI');
};

Peripheral.prototype.discoverServices = function(serviceUUIDs) {
  this.$('discoverServices', $util.to$Uuids(serviceUUIDs));
};

Peripheral.prototype.discoverIncludedServicesForService = function(includedServiceUUIDs, service) {
  this.$('discoverIncludedServices', $util.to$Uuids(includedServiceUUIDs), 'forService', service.$);
};

Peripheral.prototype.discoverCharacteristicsForService = function(characteristicUUIDs, service) {
  this.$('discoverCharacteristics', $util.to$Uuids(characteristicUUIDs), 'forService', service.$);
};

Peripheral.prototype.discoverDescriptorsForCharacteristic = function(characteristic) {
  this.$('discoverDescriptorsForCharacteristic', characteristic.$);
};

Peripheral.prototype.readValueForCharacteristic = function(characteristic) {
  this.$('readValueForCharacteristic', characteristic.$);
};

Peripheral.prototype.setBroadcastValueForCharacteristic = function(value, characteristic) {
  this.$('setBroadcastValue', value, 'forCharacteristic', characteristic.$);
};

Peripheral.prototype.setNotifyValueForCharacteristic = function(value, characteristic) {
  this.$('setNotifyValue', value, 'forCharacteristic', characteristic.$);
};

Peripheral.prototype.writeValueForCharacteristic = function(value, characteristic, type) {
  this.$('writeValue', $util.bufferTo$Data(value), 'forCharacteristic', characteristic.$, 'type', type);
};

Peripheral.prototype.readValueForDescriptor = function(descriptor) {
  this.$('readValueForDescriptor', descriptor.$);
};

Peripheral.prototype.writeValueForDescriptor = function(value, descriptor) {
  console.log('writeValueForDescriptor ', $util.bufferTo$Data(value), descriptor.$);
  this.$('writeValue', $util.bufferTo$Data(value), 'forDescriptor', descriptor.$);
};

Peripheral.prototype._onRssiUpdate = function(error) {
  var rssi;

  if (error === undefined) {
    rssi = $util.toInt(this.$('RSSI'));
  }

  this.emit('rssiUpdate', rssi, error);
};

Peripheral.prototype._onServicesDiscover = function(error) {
  this.services = undefined;

  if (error === undefined) {
    var $services = this.$('services');

    this.services = [];

    $util.$arrayForEach($services, function($service) {
      var service = new Service($service);

      service.peripheral = this;

      this.services.push(service);
    }.bind(this));
  }

  this.emit('servicesDiscover', this.services, error);
};

Peripheral.prototype._onServiceIncludedServicesDiscover = function(serviceIdentifier, error) {
  this.services.forEach(function(service) {
    if (service.identifier === serviceIdentifier) {
      service.onIncludedServicesDiscover(error);
    }
  });
};

Peripheral.prototype._onServiceCharacteristicsDiscover = function(serviceIdentifier, error) {
  this.services.forEach(function(service) {
    if (service.identifier === serviceIdentifier) {
      service.onCharacteristicsDiscover(error);
    }
  });
};

Peripheral.prototype._onCharacteristicDescriptorsDiscover = function(characteristicIdentifier, error) {
  this._forCharacteristicIdentifier(characteristicIdentifier, function(characteristic) {
    characteristic.onDescriptorsDiscover(error);
  });
};

Peripheral.prototype._onCharacteristicValueUpdate = function(characteristicIdentifier, error) {
  this._forCharacteristicIdentifier(characteristicIdentifier, function(characteristic) {
    characteristic.onValueUpdate(error);
  });
};

Peripheral.prototype._onCharacteristicValueWrite = function(characteristicIdentifier, error) {
  this._forCharacteristicIdentifier(characteristicIdentifier, function(characteristic) {
    characteristic.onValueWrite(error);
  });
};

Peripheral.prototype._onCharacteristicNotificationStateUpdate = function(characteristicIdentifier, error) {
  this._forCharacteristicIdentifier(characteristicIdentifier, function(characteristic) {
    characteristic.onNotificationStateUpdate(error);
  });
};

Peripheral.prototype._onDescriptorValueUpdate = function(descriptorIdentifier, error) {
  this._forDescriptorIdentifier(descriptorIdentifier, function(descriptor) {
    descriptor.onValueUpdate(error);
  });
};

Peripheral.prototype._onDescriptorValueWrite = function(descriptorIdentifier, error) {
  this._forDescriptorIdentifier(descriptorIdentifier, function(descriptor) {
    descriptor.onValueWrite(error);
  });
};

Peripheral.prototype._forCharacteristicIdentifier = function(characteristicIdentifier, callback) {
  this.services.forEach(function(service) {
    if (service.characteristics) {
      service.characteristics.forEach(function(characteristic) {
        if (characteristic.identifier === characteristicIdentifier) {
          callback(characteristic);
        }
      });
    }
  });
};

Peripheral.prototype._forDescriptorIdentifier = function(descriptorIdentifier, callback) {
  this.services.forEach(function(service) {
    if (service.characteristics) {
      service.characteristics.forEach(function(characteristic) {
        if (characteristic.descriptors) {
          characteristic.descriptors.forEach(function(descriptor) {
            if (descriptor.identifier === descriptorIdentifier) {
              callback(descriptor);
            }
          });
        }
      });
    }
  });
};

module.exports = Peripheral;
