var events             = require('events');
var util               = require('util');

var $                  = require('NodObjC');

var $util              = require('./util');

function Descriptor($descriptor) {
  this.$               = $descriptor('retain');

  this.identifier      = $util.identifierFor$Descriptor(this.$);
  this.uuid            = $util.toUuidString(this.$('UUID'));
}

util.inherits(Descriptor, events.EventEmitter);

Descriptor.prototype.toString = function() {
  return JSON.stringify({
    uuid: this.uuid
  });
};

Descriptor.prototype.readValue = function() {
  this.peripheral.readValueForDescriptor(this);
};

Descriptor.prototype.writeValue = function(value) {
  this.peripheral.writeValueForDescriptor(value, this);
};

Descriptor.prototype.onValueUpdate = function(error) {
  var value;

  if (error === undefined) {
    var $data = this.$('value');

    value = $util.toBuffer($data);
  }

  this.emit('valueUpdate', value, error);
};

Descriptor.prototype.onValueWrite = function(error) {
  this.emit('valueWrite', error);
};

module.exports = Descriptor;
