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

  debug('peripheralDidUpdateRSSI:%s %s', identifier, error);

  process.nextTick(function(error) {
    this.emit('rssiUpdate', error);
  }.bind(mapDelegate($self), error));
});


CBPeripheralDelegate.addMethod('peripheral:didDiscoverServices:',
                                'v@:@@', function ($self, $_cmd, $peripheral, $error) {
  var identifier = $util.identifierForPeripheral($peripheral);
  var error      = $util.toError($error);

  debug('peripheralDidDiscoverServices:%s %s', identifier, error);

  process.nextTick(function(error) {
    this.emit('servicesDiscover', error);
  }.bind(mapDelegate($self), error));
});

CBPeripheralDelegate.addMethod('peripheral:didDiscoverIncludedServicesForService:error:',
                                'v@:@@@', function ($self, $_cmd, $peripheral, $service, $error) {
  var identifier        = $util.identifierForPeripheral($peripheral);
  var serviceIdentifier = $util.identifierFor$Service($service);
  var error             = $util.toError($error);

  debug('peripheralDidDiscoverIncludedServicesForService:%s %s %s', identifier, serviceIdentifier, error);

  process.nextTick(function(serviceIdentifier, error) {
    this.emit('serviceIncludedServicesDiscover', serviceIdentifier, error);
  }.bind(mapDelegate($self), serviceIdentifier, error));
});

CBPeripheralDelegate.addMethod('peripheral:didDiscoverCharacteristicsForService:error:',
                                'v@:@@@', function ($self, $_cmd, $peripheral, $service, $error) {
  var identifier        = $util.identifierForPeripheral($peripheral);
  var serviceIdentifier = $util.identifierFor$Service($service);
  var error             = $util.toError($error);

  debug('peripheralDidDiscoverCharacteristicsForService:%s %s %s', identifier, serviceIdentifier, error);

  process.nextTick(function(serviceIdentifier, error) {
    this.emit('serviceCharacteristicsDiscover', serviceIdentifier, error);
  }.bind(mapDelegate($self), serviceIdentifier, error));
});

CBPeripheralDelegate.addMethod('peripheral:didDiscoverDescriptorsForCharacteristic:error:',
                                'v@:@@@', function ($self, $_cmd, $peripheral, $characteristic, $error) {
  var identifier               = $util.identifierForPeripheral($peripheral);
  var characteristicIdentifier = $util.identifierFor$Characteristic($characteristic);
  var error                    = $util.toError($error);

  debug('peripheralDidDiscoverDescriptorsForCharacteristic:%s %s %s', identifier, characteristicIdentifier, error);

  process.nextTick(function(characteristicIdentifier, error) {
    this.emit('characteristicsDescriptorDiscover', characteristicIdentifier, error);
  }.bind(mapDelegate($self), characteristicIdentifier, error));
});
