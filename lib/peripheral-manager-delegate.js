var events        = require('events');
var util          = require('util');

var $             = require('NodObjC');
var debug         = require('debug')('peripheral-manager-delegate');

var $util         = require('./util');

function PeripheralManagerDelegate() {
  this.$ = CBPeripheralManagerDelegate('alloc')('init');

  delegates[this.$] = this;

  this._peripheral = {};
}

util.inherits(PeripheralManagerDelegate, events.EventEmitter);

module.exports = PeripheralManagerDelegate;

var delegates = {};

function mapDelegate(self) {
  return delegates[self];
}

var CBPeripheralManagerDelegate = $.NSObject.extend('CBPeripheralManagerDelegate');

CBPeripheralManagerDelegate.addMethod('peripheralManagerDidUpdateState:', 'v@:@', function ($self, $_cmd, $peripheralManager) {
  var state = $peripheralManager('state');
  debug('peripheralManagerDidUpdateState:%d', state);

  process.nextTick(function(state) {
    var STATE_MAPPER = ['unknown', 'resetting', 'unsupported', 'unauthorized', 'poweredOff', 'poweredOn'];

    this.emit('stateUpdate', STATE_MAPPER[state]);
  }.bind(mapDelegate($self), state));
});

CBPeripheralManagerDelegate.addMethod('peripheralManagerDidStartAdvertising:error:',
                                    'v@:@@', function ($self, $_cmd, $peripheralManager, $error) {
  var error = $util.toError($error);

  debug('peripheralManagerDidStartAdvertising:%s', error);

  process.nextTick(function(error) {
    this.emit('advertisingStart', error);
  }.bind(mapDelegate($self), error));
});

CBPeripheralManagerDelegate.addMethod('peripheralManager:didAddService:error:',
                                    'v@:@@@', function ($self, $_cmd, $peripheralManager, $service, $error) {
  var error             = $util.toError($error);
  var serviceIdentifier = $util.identifierFor$MutableAttribute($service);

  debug('peripheralManagerDidAddService:%s %s', error, serviceIdentifier);

  process.nextTick(function(serviceIdentifier, error) {
    this.emit('serviceAdded', serviceIdentifier, error);
  }.bind(mapDelegate($self), serviceIdentifier, error));
});


CBPeripheralManagerDelegate.addMethod('peripheralManager:central:didSubscribeToCharacteristic:',
                                    'v@:@@@', function ($self, $_cmd, $peripheralManager, $central, $characteristic) {
  var centralIdentifier        = $util.identifierFor$Central($central);
  var characteristicIdentifier = $util.identifierFor$MutableAttribute($characteristic);

  debug('peripheralManagerCentralDidSubscribeToCharacteristic:%s %s', centralIdentifier, characteristicIdentifier);

  process.nextTick(function(centralIdentifier, characteristicIdentifier) {
    this.emit('subscribe', centralIdentifier, characteristicIdentifier);
  }.bind(mapDelegate($self), centralIdentifier, characteristicIdentifier));
});

CBPeripheralManagerDelegate.addMethod('peripheralManager:central:didUnsubscribeFromCharacteristic:',
                                    'v@:@@@', function ($self, $_cmd, $peripheralManager, $central, $characteristic) {
  var centralIdentifier        = $util.identifierFor$Central($central);
  var characteristicIdentifier = $util.identifierFor$MutableAttribute($characteristic);

  debug('peripheralManagerCentralDidUnsubscribeFromCharacteristic:%s %s', centralIdentifier, characteristicIdentifier);

  process.nextTick(function(centralIdentifier, characteristicIdentifier) {
    this.emit('unsubscribe', centralIdentifier, characteristicIdentifier);
  }.bind(mapDelegate($self), centralIdentifier, characteristicIdentifier));
});

// - (void)peripheralManagerIsReadyToUpdateSubscribers:(CBPeripheralManager *)peripheral

CBPeripheralManagerDelegate.addMethod('peripheralManager:didReceiveReadRequest:',
                                    'v@:@@', function ($self, $_cmd, $peripheralManager, $request) {
  debug('peripheralManagerDidReceiveReadRequest:%s', $request);

  $request('retain');

  process.nextTick(function($request) {
    this.emit('readRequest', $request);
  }.bind(mapDelegate($self), $request));
});

CBPeripheralManagerDelegate.addMethod('peripheralManager:didReceiveWriteRequests:',
                                    'v@:@@', function ($self, $_cmd, $peripheralManager, $requests) {
  debug('peripheralManagerDidReceiveWriteRequests:%s', $requests);

  $requests('retain');

  $util.$arrayForEach($requests, function($request) {
    $request('retain');
  });

  process.nextTick(function($requests) {
    this.emit('writeRequests', $requests);
  }.bind(mapDelegate($self), $requests));
});
