var events        = require('events');
var util          = require('util');

var $             = require('NodObjC');
var debug         = require('debug')('mutable-service');

var $util         = require('./util');

$.import('Foundation');

function MutableService(uuid, primary, includedServices, characteristics) {
  this.uuid             = uuid;
  this.primary          = primary;
  this.includedServices = includedServices;
  this.characteristics  = characteristics;

  var $uuid             = $util.to$Uuid(uuid);

  this.$                = $.CBMutableService('alloc')('initWithType', $uuid, 'primary', primary ? true : false);

  if (includedServices) {
    var $includedServices = $.NSMutableArray('alloc')('init');

    includedServices.forEach(function(includedService) {
      $includedServices('addObject', includedService.$);
    });

    this.$('setIncludedServices', $includedServices);
  }

  if (characteristics) {
    var $characteristics = $.NSMutableArray('alloc')('init');

    characteristics.forEach(function(characteristic) {
      $characteristics('addObject', characteristic.$);
    });

    this.$('setCharacteristics', $characteristics);
  }
}

util.inherits(MutableService, events.EventEmitter);

MutableService.prototype.toString = function() {
  return JSON.stringify({
    uuid: this.uuid,
    includedServices: this.includedServices,
    characteristics: this.characteristics
  });
};

MutableService.prototype.onAdded = function(error) {
  if (error === undefined) {
    this.identifier = $util.identifierFor$MutableAttribute(this.$);

    if (this.includedServices) {
      this.includedServices.forEach(function(includedService) {
        includedService.onAdded();
      });
    }

    if (this.characteristics) {
      this.characteristics.forEach(function(characteristic) {
        characteristic.onAdded();
      });
    }
  }

  this.emit('added', error);
};

module.exports = MutableService;
