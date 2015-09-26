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

Characteristic.prototype.readValue = function() {
  this.peripheral.readValueForCharacteristic(this);
};

Characteristic.prototype.setBroadcastValue = function(value) {
  this.peripheral.setBroadcastValueForCharacteristic(value, this);
};

Characteristic.prototype.setNotifyValue = function(value) {
  this.peripheral.setNotifyValueForCharacteristic(value, this);
};

Characteristic.prototype.writeValue = function(value, type) {
  this.peripheral.writeValueForCharacteristic(value, this, type ? 1 : 0);
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

Characteristic.prototype.onValueUpdate = function(error) {
  var value;

  if (error === undefined) {
    var $data = this.$('value');

    value = $util.toBuffer($data);
  }

  this.emit('valueUpdate', value, error);
};

Characteristic.prototype.onValueWrite = function(error) {
  this.emit('valueWrite', error);
};

Characteristic.prototype.onNotificationStateUpdate = function(error) {
  var isNotifying;

  if (error === undefined) {
    isNotifying = this.$('isNotifying') ? true : false;
  }

  this.emit('notificationStateUpdate', isNotifying, error);
};

module.exports = Characteristic;
