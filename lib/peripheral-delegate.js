var events        = require('events');
var util          = require('util');

var $             = require('NodObjC');
var debug         = require('debug')('peripheral-delegate');

var $util         = require('./util');

$.import('Foundation');

function PeripheralDelegate() {
  this.$ = CBPeripheralDelegate('alloc')('init');

  delegates[this.$] = this;
}

util.inherits(PeripheralDelegate, events.EventEmitter);

module.exports = PeripheralDelegate;

var delegates = {};

function mapDelegate(self) {
  return delegates[self];
}

var CBPeripheralDelegate = $.NSObject.extend('CBPeripheralDelegate');

CBPeripheralDelegate.addMethod('peripheralDidUpdateRSSI:error:',
                                    'v@:@@', function ($self, $_cmd, $peripheral, $error) {
  var identifier = $util.identifierForPeripheral($peripheral);
  var error      = $util.toError($error);
  var rssi       = undefined;

  if (error === undefined) {
    rssi = $util.toInt($peripheral('RSSI'));
  }

  debug('peripheralDidUpdateRSSI:%s %d %s', identifier, rssi, error);

  process.nextTick(function(identifier, rssi, error) {
    this.emit('rssiUpdate', identifier, rssi, error);
  }.bind(mapDelegate($self), identifier, rssi, error));
});
