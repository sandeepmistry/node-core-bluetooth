var $             = require('NodObjC');

$.import('Foundation');
$.import('CoreBluetooth');

module.exports = {
  identifierForPeripheral: function($peripheral) {
    return $peripheral('identifier')('UUIDString').toString();
  },

  objectForKey: function($dictionary, key) {
    return $dictionary('objectForKey', $(key));
  },

  toBool: function($number) {
    return $number ? $number('boolValue') : undefined;
  },

  toInt: function($number) {
    return $number ? $number('intValue') : undefined;
  },

  toString: function($string) {
    return $string ? $string.toString() : undefined;
  },

  toBuffer: function($data) {
    var base64Data = $data('base64EncodedStringWithOptions', 0).toString();

    return new Buffer(base64Data, 'base64');
  },

  toError: function($error) {
    return $error ? new Error($error('localizedDescription').toString()) : undefined;
  },

  toUuidString: function($uuid) {
    return $uuid('UUIDString').toString();
  },

  boolTo$Number: function(bool) {
    return $.NSNumber('alloc')('initWithBool', bool);
  },

  bufferTo$Data: function(buffer) {
    var base64String  = buffer.toString('base64');
    var $base64String = $(base64String);

    return $.NSData('alloc')('initWithBase64EncodedString', $base64String, 'options', 0);
  },

  $arrayForEach: function($array, callback) {
    var $objectEnumerator = $array('objectEnumerator');
    var $object;

    while (($object = $objectEnumerator('nextObject'))) {
      callback($object);
    }
  },

  $dictionaryForEach: function($dictionary, callback) {
    var $keyEnumerator = $dictionary('keyEnumerator');
    var $key;

    while(($key = $keyEnumerator('nextObject'))) {
      var $object = $dictionary('objectForKey', $key);

      callback($key, $object);
    }
  },

  to$Uuids: function(uuids) {
    var $uuids = $.NSMutableArray('alloc')('init');

    uuids = uuids || [];
    uuids.forEach(function(uuid) {
      $uuid = $.CBUUID('alloc')('initWithString', $(uuid)); // private API

      $uuids('addObject', $uuid);
    });

    return $uuids;
  },

  $setObjectForKey: function($dictionary, $object, key) {
    $dictionary('setObject', $object, 'forKey', $(key));
  },

  identifierFor$Service: function($service) {
    var startHandle = this.toInt($service('startHandle')); // private API
    var endHandle   = this.toInt($service('endHandle')); // private API

    return (startHandle + '-' + endHandle);
  },

  identifierFor$Characteristic: function($characteristic) {
    var handle      = this.toInt($characteristic('handle')); // private API
    var valueHandle = this.toInt($characteristic('valueHandle')); // private API

    return (handle + '-' + valueHandle);
  },

  identifierFor$Descriptor: function($descriptor) {
    var handle = this.toInt($descriptor('handle')); // private API

    return (handle + '');
  }
};
