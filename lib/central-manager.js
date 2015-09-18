var ffi = require('ffi');
var $ = require('NodObjC');

$.import('Foundation');
$.import('CoreBluetooth');

var libdispatch = ffi.Library('/usr/lib/system/libdispatch', {
  'dispatch_queue_create': ['pointer', ['string', 'int']]
});

var CBCentralManagerScanOptionAllowDuplicatesKey = $('kCBScanOptionAllowDuplicates');

function CentralManager(centralManagerDelegate) {
  this._delegate = centralManagerDelegate;

  this._dispatchQueue = libdispatch.dispatch_queue_create('node-core-bluetooth', 0);
  this._$ = $.CBCentralManager('alloc')('initWithDelegate', centralManagerDelegate._$, 'queue', this._dispatchQueue);

  setInterval(function() { }, 2147483647);
}

CentralManager.prototype.scanForPeripherals = function(services, allowDuplicates) {
  var serviceUUIDs = null;
  var options      = $.NSMutableDictionary('alloc')('init');

  var duplicates = $.NSNumber('alloc')('initWithBool', allowDuplicates ? true : false);
  options('setObject', duplicates, 'forKey', CBCentralManagerScanOptionAllowDuplicatesKey);

  this._$('scanForPeripheralsWithServices', serviceUUIDs, 'options', options);
};

module.exports = CentralManager;
