var events        = require('events');
var util          = require('util');

var $ = require('NodObjC');

var CBCentralManagerDelegate = $.NSObject.extend('CBCentralManagerDelegate');

var delegates = {};

CBCentralManagerDelegate.addMethod('centralManagerDidUpdateState:', 'v@:@', function (self, _cmd, centralManager) {
  console.log('centralManagerDidUpdateState: ' + centralManager('state'));

  delegates[self].emit('stateUpdate', centralManager('state'));
});

CBCentralManagerDelegate.addMethod('centralManager:didDiscoverPeripheral:advertisementData:RSSI:',
                                    'v@:@@@@', function (self, _cmd, centralManager, peripheral, advertisementData, RSSI) {
  console.log('centralManager: ' + centralManager);
  console.log('didDiscoverPeripheral: ' + peripheral);
  console.log('advertisementData: ' + advertisementData);
  console.log('RSSI: ' + RSSI);
});

function CentralManagerDelegate() {
  this._$ = CBCentralManagerDelegate('alloc')('init');

  delegates[this._$] = this;
}

util.inherits(CentralManagerDelegate, events.EventEmitter);

module.exports = CentralManagerDelegate;
