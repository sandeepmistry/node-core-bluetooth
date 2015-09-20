var events        = require('events');
var util          = require('util');

var debug         = require('debug')('central-manager-delegate');

var $             = require('NodObjC');

var Peripheral    = require('./peripheral');

function CentralManagerDelegate() {
  this.$ = CBCentralManagerDelegate('alloc')('init');

  delegates[this.$] = this;

  this._peripheral = {};
}

util.inherits(CentralManagerDelegate, events.EventEmitter);

module.exports = CentralManagerDelegate;

var delegates = {};
var peripherals = {};

function mapDelegate(self) {
  return delegates[self];
}

function mapPeripheral(identifier) {
  return peripherals[identifier];
}

var CBCentralManagerDelegate = $.NSObject.extend('CBCentralManagerDelegate');

CBCentralManagerDelegate.addMethod('centralManagerDidUpdateState:', 'v@:@', function ($self, $_cmd, $centralManager) {
  var state = $centralManager('state');
  debug('centralManagerDidUpdateState:%d', state);

  process.nextTick(function(state) {
    var STATE_MAPPER = ['unknown', 'resetting', 'unsupported', 'unauthorized', 'poweredOff', 'poweredOn'];

    this.emit('stateUpdate', STATE_MAPPER[state]);
  }.bind(mapDelegate($self), state));
});

CBCentralManagerDelegate.addMethod('centralManager:didDiscoverPeripheral:advertisementData:RSSI:',
                                    'v@:@@@@', function ($self, $_cmd, $centralManager, $peripheral, $advertisementData, $RSSI) {
  var identifier = $peripheral('identifier')('UUIDString').toString();

  var $localName = $advertisementData('objectForKey', $('kCBAdvDataLocalName'));
  // TODO
// var CBAdvertisementDataManufacturerDataKey      = $('kCBAdvDataManufacturerData');
// var CBAdvertisementDataServiceDataKey           = $('kCBAdvDataServiceData');
// var CBAdvertisementDataServiceUUIDsKey          = $('kCBAdvDataServiceUUIDs');
// var CBAdvertisementDataOverflowServiceUUIDsKey  = $('');
// var CBAdvertisementDataTxPowerLevelKey          = $('kCBAdvDataTxPowerLevel');
// var CBAdvertisementDataIsConnectable            = ;
// var CBAdvertisementDataSolicitedServiceUUIDsKey = $('kCBAdvDataSolicitedServiceUUIDs');
  var $connectable = $advertisementData('objectForKey', $('kCBAdvDataIsConnectable'));

  var advertisementData = {};

  if ($localName !== null) {
    advertisementData.localName = $localName.toString();
  }

  if ($connectable !== null) {
    advertisementData.connectable = $connectable('boolValue');
  }

  var rssi = $RSSI('intValue');

  debug('centralManagerDidDiscoverPeripheral:%s advertisement:%j RSSI:%d', identifier, advertisementData, rssi);

  if (peripherals[identifier] === undefined) {
    peripherals[identifier] = new Peripheral($peripheral, identifier);
  }

  process.nextTick(function(peripheral, advertisementData, rssi) {
    this.emit('peripheralDiscover', peripheral, advertisementData, rssi);
  }.bind(mapDelegate($self), mapPeripheral(identifier), advertisementData, rssi));
});

CBCentralManagerDelegate.addMethod('centralManager:didConnectPeripheral:',
                                    'v@:@@', function ($self, $_cmd, $centralManager, $peripheral) {
  var identifier = $peripheral('identifier')('UUIDString').toString();

  debug('centralManagerDidConnectPeripheral:%s', identifier);

  process.nextTick(function(peripheral) {
    this.emit('peripheralConnect', peripheral);
  }.bind(mapDelegate($self), mapPeripheral(identifier)));
});

CBCentralManagerDelegate.addMethod('centralManager:didDisconnectPeripheral:error:',
                                    'v@:@@@', function ($self, $_cmd, $centralManager, $peripheral, $error) {
  var identifier = $peripheral('identifier')('UUIDString').toString();
  var error = undefined;

  if ($error) {
    error = new Error($error('localizedDescription').toString());
  }

  debug('centralManagerDidDisconnectPeripheral:%s %s', identifier, error);

  process.nextTick(function(peripheral, error) {
    this.emit('peripheralDisconnect', peripheral, error);
  }.bind(mapDelegate($self), mapPeripheral(identifier), error));
});

CBCentralManagerDelegate.addMethod('centralManager:didFailToConnectPeripheral:error:',
                                    'v@:@@@', function ($self, $_cmd, $centralManager, $peripheral, $error) {
  var identifier = peripheral('identifier')('UUIDString').toString();
  var error = undefined;

  if ($error) {
    error = new Error($error('localizedDescription').toString());
  }

  debug('centralManagerDidFailToConnectPeripheral:%s %s', identifier, error);

  process.nextTick(function(peripheral, error) {
    this.emit('peripheralConnectFail', peripheral, error);
  }.bind(mapDelegate(self), mapPeripheral(identifier), error));
});
