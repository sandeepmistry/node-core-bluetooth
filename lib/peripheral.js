var events             = require('events');
var util               = require('util');

var $                  = require('NodObjC');

var PeripheralDelegate = require('./peripheral-delegate');
var Service            = require('./service');
var $util              = require('./util');

function Peripheral($peripheral) {
  this.$          = $peripheral('retain');

  this.identifier = $util.identifierForPeripheral(this.$);
  this.delegate   = new PeripheralDelegate();

  this.delegate.on('rssiUpdate', this._onRssiUpdate.bind(this));
  this.delegate.on('servicesDiscover', this._onServicesDiscover.bind(this));
  this.delegate.on('serviceIncludedServicesDiscover', this._onServiceIncludedServicesDiscover.bind(this));
  this.delegate.on('serviceCharacteristicsDiscover', this._onServiceCharacteristicsDiscover.bind(this));
  this.delegate.on('characteristicsDescriptorDiscover', this._onCharacteristicsDescriptorDiscover.bind(this));

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

Peripheral.prototype._onRssiUpdate = function(error) {
  var rssi = undefined;

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

Peripheral.prototype._onCharacteristicsDescriptorDiscover = function(characteristicIdentifier, error) {
  this.services.forEach(function(service) {
    if (service.characteristics) {
      service.characteristics.forEach(function(characteristic) {
        if (characteristic.identifier === characteristicIdentifier) {
          characteristic.onDescriptorsDiscover(error);
        }
      });
    }
  });
};

module.exports = Peripheral;
