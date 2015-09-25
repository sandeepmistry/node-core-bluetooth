var events             = require('events');
var util               = require('util');

var $                  = require('NodObjC');

var Characteristic     = require('./characteristic');
var $util              = require('./util');

function Serivce($service) {
  this.$               = $service('retain');

  this.identifier      = $util.identifierFor$Service(this.$);
  this.uuid            = $util.toUuidString(this.$('UUID'));
  this.isPrimary       = $util.toBool(this.$('isPrimary'));
}

util.inherits(Serivce, events.EventEmitter);

Serivce.prototype.toString = function() {
  return JSON.stringify({
    uuid: this.uuid,
    includedServices: this.includedServices,
    characteristics: this.characteristics
  });
};

Serivce.prototype.discoverIncludedServices = function(includedServiceUUIDs) {
  this.peripheral.discoverIncludedServicesForService(includedServiceUUIDs, this);
};

Serivce.prototype.discoverCharacteristics = function(characteristicUUIDs) {
  this.peripheral.discoverCharacteristicsForService(characteristicUUIDs, this);
};

Serivce.prototype.onIncludedServicesDiscover = function(error) {
  this.includedServices = undefined;

  if (error === undefined) {
    var $includedServices = this.$('includedServices');

    this.includedServices = [];

    $util.$arrayForEach($includedServices, function($includedService) {
      var includedService        = new Serivce($includedService);

      includedService.service    = this;
      includedService.peripheral = this.peripheral;

      this.includedServices.push(includedService);
    }.bind(this));
  }

  this.emit('includedServicesDiscover', this.includedServices, error);
};

Serivce.prototype.onCharacteristicsDiscover = function(error) {
  this.characteristics = undefined;

  if (error === undefined) {
    var $characteristics = this.$('characteristics');

    this.characteristics = [];

    $util.$arrayForEach($characteristics, function($characteristic) {
      var characteristic = new Characteristic($characteristic);

      characteristic.service    = this;
      characteristic.peripheral = this.peripheral;

      this.characteristics.push(characteristic);
    }.bind(this));
  }

  this.emit('characteristicsDiscover', this.characteristics, error);
};

module.exports = Serivce;
