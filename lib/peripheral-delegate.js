var events        = require('events');
var util          = require('util');

var debug         = require('debug')('peripheral-delegate');

var $             = require('NodObjC');

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
  var identifier = $peripheral('identifier')('UUIDString').toString();
  var rssi = undefined;
  var error = undefined;

  if ($error) {
    error = new Error(error('localizedDescription').toString());
  } else {
    rssi = $peripheral('RSSI')('intValue');
  }

  debug('peripheralDidUpdateRSSI:%s %d %s', identifier, rssi, error);

  process.nextTick(function(identifier, rssi, error) {
    this.emit('rssiUpdate', identifier, rssi, error);
  }.bind(mapDelegate($self), identifier, rssi, error));
});
