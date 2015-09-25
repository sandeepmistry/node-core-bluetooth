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

module.exports = Descriptor;
