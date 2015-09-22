var events             = require('events');
var util               = require('util');

var $                  = require('NodObjC');
var reemit             = require('re-emitter');

var PeripheralDelegate = require('./peripheral-delegate');
var $util              = require('./util');

function Peripheral($peripheral) {
  this.$ = $peripheral('retain');

  this.identifier = $util.identifierForPeripheral(this.$);
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

Peripheral.prototype.connect = function() {
  this.centralManager.connect(this);
};

Peripheral.prototype.cancelConnection = function() {
  this.centralManager.cancelConnection(this);
};

Peripheral.prototype.readRSSI = function() {
  console.log('readRSSI');
  this.$('readRSSI');
};

module.exports = Peripheral;
