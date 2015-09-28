var events        = require('events');
var util          = require('util');

var $             = require('NodObjC');
var debug         = require('debug')('mutable-descriptor');

var $util         = require('./util');

$.import('Foundation');

function MutableDescriptor(uuid, value) {
  this.uuid  = uuid;
  this.value = value;

  var $uuid  = $util.to$Uuid(uuid);
  var $value = (uuid === '2901') ? $(value) : $util.bufferTo$Data(value);

  this.$ = $.CBMutableDescriptor('alloc')('initWithType', $uuid, 'value', $value);
}

util.inherits(MutableDescriptor, events.EventEmitter);

MutableDescriptor.prototype.toString = function() {
  return JSON.stringify({
    uuid: this.uuid,
    value: this.value
  });
};

MutableDescriptor.prototype.onAdded = function() {
  this.identifier = $util.identifierFor$MutableAttribute(this.$);

  this.emit('added');
};

module.exports = MutableDescriptor;
