var fs = require('fs');

var bplist = require('bplist-parser');

var PLIST_FILE = '/Library/Preferences/com.apple.Bluetooth.plist';

var coreBluetoothCache = {};

fs.watch(PLIST_FILE, function(event, filename) {
  bplist.parseFile(PLIST_FILE, function (err, obj) {
    if (err) {
      return;
    }

    coreBluetoothCache = obj[0].CoreBluetoothCache || {};
  });
});

function uuidToAddress(uuid) {
  var coreBluetoothCacheEntry = coreBluetoothCache[uuid];
  var address = coreBluetoothCacheEntry ? coreBluetoothCacheEntry.DeviceAddress.replace(/-/g, ':') : undefined;

  return address;
}

module.exports = uuidToAddress;
