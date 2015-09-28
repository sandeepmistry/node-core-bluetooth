var events        = require('events');
var util          = require('util');

var $             = require('NodObjC');
var debug         = require('debug')('central-manager-delegate');

var Peripheral    = require('./peripheral');
var $util         = require('./util');

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
  var identifier        = $util.identifierFor$Peripheral($peripheral);

  var $localName        = $util.objectForKey($advertisementData, 'kCBAdvDataLocalName');
  var $manufacturerData = $util.objectForKey($advertisementData, 'kCBAdvDataManufacturerData');
  var $serviceData      = $util.objectForKey($advertisementData, 'kCBAdvDataServiceData');
  var $serviceUuids     = $util.objectForKey($advertisementData, 'kCBAdvDataServiceUUIDs');
  var $txPowerLevel     = $util.objectForKey($advertisementData, 'kCBAdvDataTxPowerLevel');
  var $connectable      = $util.objectForKey($advertisementData, 'kCBAdvDataIsConnectable');

  var advertisementData = {};

  if ($localName !== null) {
    advertisementData.localName = $util.toString($localName);
  }

  if ($manufacturerData !== null) {
    advertisementData.manufacturerData = $util.toBuffer($manufacturerData);
  }

  if ($serviceData !== null) {
    advertisementData.serviceData = {};

    $util.$dictionaryForEach($serviceData, function($key, $object) {
      advertisementData.serviceData[$util.toUuidString($key)] = $util.toBuffer($object);
    });
  }

  if ($serviceUuids !== null) {
    advertisementData.serviceUuids = [];

    $util.$arrayForEach($serviceUuids, function($object) {
      advertisementData.serviceUuids.push($util.toUuidString($object));
    });
  }

  if ($txPowerLevel) {
    advertisementData.txPowerLevel = $util.toInt($txPowerLevel);
  }

  if ($connectable !== null) {
    advertisementData.connectable =  $util.toBool($connectable);
  }

  var rssi = $util.toInt($RSSI);

  if (advertisementData.connectable !== undefined && Object.keys(advertisementData).length === 1) {
    return;
  }

  debug('centralManagerDidDiscoverPeripheral:%s advertisement:%j RSSI:%d', identifier, advertisementData, rssi);

  if (peripherals[identifier] === undefined) {
    peripherals[identifier] = new Peripheral($peripheral);
  }

  process.nextTick(function(peripheral, advertisementData, rssi) {
    this.emit('peripheralDiscover', peripheral, advertisementData, rssi);
  }.bind(mapDelegate($self), mapPeripheral(identifier), advertisementData, rssi));
});

CBCentralManagerDelegate.addMethod('centralManager:didConnectPeripheral:',
                                    'v@:@@', function ($self, $_cmd, $centralManager, $peripheral) {
  var identifier = $util.identifierFor$Peripheral($peripheral);

  debug('centralManagerDidConnectPeripheral:%s', identifier);

  process.nextTick(function(peripheral) {
    this.emit('peripheralConnect', peripheral);

    peripheral.emit('connect');
  }.bind(mapDelegate($self), mapPeripheral(identifier)));
});

CBCentralManagerDelegate.addMethod('centralManager:didDisconnectPeripheral:error:',
                                    'v@:@@@', function ($self, $_cmd, $centralManager, $peripheral, $error) {
  var identifier = $util.identifierFor$Peripheral($peripheral);
  var error      = $util.toError($error);

  debug('centralManagerDidDisconnectPeripheral:%s %s', identifier, error);

  process.nextTick(function(peripheral, error) {
    this.emit('peripheralDisconnect', peripheral, error);

    peripheral.emit('disconnect', error);
  }.bind(mapDelegate($self), mapPeripheral(identifier), error));
});

CBCentralManagerDelegate.addMethod('centralManager:didFailToConnectPeripheral:error:',
                                    'v@:@@@', function ($self, $_cmd, $centralManager, $peripheral, $error) {
  var identifier = $util.identifierFor$Peripheral($peripheral);
  var error      = $util.toError($error);

  debug('centralManagerDidFailToConnectPeripheral:%s %s', identifier, error);

  process.nextTick(function(peripheral, error) {
    this.emit('peripheralConnectFail', peripheral, error);

    peripheral.emit('connectFail', error);
  }.bind(mapDelegate(self), mapPeripheral(identifier), error));
});
