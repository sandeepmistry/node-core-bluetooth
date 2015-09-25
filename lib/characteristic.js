var events             = require('events');
var util               = require('util');

var $                  = require('NodObjC');

var Descriptor         = require('./descriptor');
var $util              = require('./util');

function Characteristic($characteristic) {
  this.$               = $characteristic('retain');

  this.identifier      = $util.identifierFor$Characteristic(this.$);
  this.uuid            = $util.toUuidString(this.$('UUID'));

  var properties       = this.$('properties');

  this.properties      = [];

  var PROPERTIES_MAPPER = ['broadcast', 'read', 'writeWithoutResponse', 'write',
                            'notify', 'indicate', 'authenticatedSignedWrites',
                            'extendedProperties'];

  for (var i = 0; i < PROPERTIES_MAPPER.length; i++) {
    if (properties & (1 << i)) {
      this.properties.push(PROPERTIES_MAPPER[i]);
    }
  }
}

util.inherits(Characteristic, events.EventEmitter);

Characteristic.prototype.toString = function() {
  return JSON.stringify({
    uuid: this.uuid,
    properties: this.properties,
    descriptors: this.descriptors
  });
};

Characteristic.prototype.discoverDescriptors = function() {
  this.peripheral.discoverDescriptorsForCharacteristic(this);
};

Characteristic.prototype.onDescriptorsDiscover = function(error) {
  this.descriptors = undefined;

  if (error === undefined) {
    var $descriptors = this.$('descriptors');

    this.descriptors = [];

    $util.$arrayForEach($descriptors, function($descriptor) {
      var descriptor = new Descriptor($descriptor);

      descriptor.characteristic = this;
      descriptor.peripheral     = this.peripheral;

      this.descriptors.push(descriptor);
    }.bind(this));
  }

  this.emit('descriptorsDiscover', this.descriptors, error);
};

module.exports = Characteristic;
