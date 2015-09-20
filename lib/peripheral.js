var events             = require('events');
var util               = require('util');

var $                  = require('NodObjC');
var reemit             = require('re-emitter');

var PeripheralDelegate = require('./peripheral-delegate');

function Peripheral($peripheral, identifier) {
  this.$ = $peripheral('retain');
  this.identifier = identifier;
  this.delegate = new PeripheralDelegate();

  reemit(this.delegate, this, [
    'rssiUpdate'
  ]);

  this.$('setDelegate', this.delegate.$);
}

util.inherits(Peripheral, events.EventEmitter);

Peripheral.prototype.toString = function() {
  return JSON.stringify({
    identifier: this.identifier
  });
};

Peripheral.prototype.readRSSI = function() {
  console.log('readRSSI');
  this.$('readRSSI');
};

module.exports = Peripheral;
