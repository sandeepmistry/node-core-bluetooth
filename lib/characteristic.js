var events             = require('events');
var util               = require('util');

var $                  = require('NodObjC');

var $util              = require('./util');

function Characteristic($characteristic) {
  this.$               = $characteristic('retain');

  this.identifier      = $util.identifierFor$Characteristic(this.$);
  this.uuid            = $util.toUuidString(this.$('UUID'));
}

util.inherits(Characteristic, events.EventEmitter);

Characteristic.prototype.toString = function() {
  return JSON.stringify({
    uuid: this.uuid,
    descriptors: this.descriptors
  });
};

module.exports = Characteristic;
