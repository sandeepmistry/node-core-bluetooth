var events                 = require('events');
var util                   = require('util');

var ffi                    = require('ffi');
var $                      = require('NodObjC');
var reemit                 = require('re-emitter');

var CentralManagerDelegate = require('./central-manager-delegate');
var $util                  = require('./util');

$.import('Foundation');
$.import('CoreBluetooth');

var libdispatch = ffi.Library('/usr/lib/system/libdispatch', {
  'dispatch_queue_create': ['pointer', ['string', 'int']]
});

function CentralManager() {
  this.delegate = new CentralManagerDelegate();

  this.delegate.on('peripheralDiscover', this._onPeripheralDiscover.bind(this));

  reemit(this.delegate, this, [
    'stateUpdate',
    'peripheralDiscover',
    'peripheralConnect',
    'peripheralDisconnect',
    'peripheralConnectFail'
  ]);

  this._dispatchQueue = libdispatch.dispatch_queue_create('node-core-bluetooth', 0);
  this.$ = $.CBCentralManager('alloc')('initWithDelegate', this.delegate.$, 'queue', this._dispatchQueue);

  setInterval(function() { }, 2147483647);
}

util.inherits(CentralManager, events.EventEmitter);

CentralManager.prototype.scanForPeripherals = function(services, allowDuplicates) {
  var $services        = $util.to$Uuids(services);
  var $allowDuplicates = $util.boolTo$Number(allowDuplicates ? true : false);
  var $options         = $.NSMutableDictionary('alloc')('init');

  $util.$setObjectForKey($options, $allowDuplicates, 'kCBScanOptionAllowDuplicates');

  this.$('scanForPeripheralsWithServices', $services, 'options', $options);
};

CentralManager.prototype.stopScan = function() {
  this.$('stopScan');
};

CentralManager.prototype.connect = function(peripheral) {
  this.$('connectPeripheral', peripheral.$, 'options', null);
};

CentralManager.prototype.cancelConnection = function(peripheral) {
  this.$('cancelPeripheralConnection', peripheral.$);
};

CentralManager.prototype._onPeripheralDiscover = function(peripheral, advertisementData, rssi) {
  peripheral.centralManager = this;
};

module.exports = CentralManager;
