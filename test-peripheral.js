var CoreBluetooth         = require('./index');

var PeripheralManager     = CoreBluetooth.PeripheralManager;
var MutableService        = CoreBluetooth.MutableService;
var MutableCharacteristic = CoreBluetooth.MutableCharacteristic;
var MutableDescriptor     = CoreBluetooth.MutableDescriptor;

var peripheralManager = new PeripheralManager();

peripheralManager.on('address', function(address) {
  console.log('\taddress => ', address);
});

peripheralManager.on('stateUpdate', function(state) {
  console.log('\tstateUpdate => ', state);

  console.log('startAdvertising');
  peripheralManager.startAdvertising({
    localName: 'test',
    serviceUuids: ['FFFFFFFF-FFFF-FFFF-FFFF-FFFFFFFFFFF0']
  });
});

peripheralManager.on('advertisingStart', function(error) {
  console.log('\tadvertisingStart => ', error);

  var service = new MutableService(
    'FFFFFFFF-FFFF-FFFF-FFFF-FFFFFFFFFFF0',
    true,
    [],
    [
      new MutableCharacteristic(
        'FFFFFFFF-FFFF-FFFF-FFFF-FFFFFFFFFFF1',
        0x02,
        new Buffer('static value'),
        0x01,
        [
          new MutableDescriptor('2901', 'static read')
        ]
      ),
      new MutableCharacteristic(
        'FFFFFFFF-FFFF-FFFF-FFFF-FFFFFFFFFFF2',
        0x02,
        null,
        0x01,
        []
      ),
      new MutableCharacteristic(
        'FFFFFFFF-FFFF-FFFF-FFFF-FFFFFFFFFFF3',
        0x08,
        null,
        0x02,
        []
      ),
      new MutableCharacteristic(
        'FFFFFFFF-FFFF-FFFF-FFFF-FFFFFFFFFFF4',
        0x04,
        null,
        0x02,
        []
      ),
      new MutableCharacteristic(
        'FFFFFFFF-FFFF-FFFF-FFFF-FFFFFFFFFFF4',
        0x10,
        null,
        0x01,
        []
      )
    ]
  );

  console.log('addService');
  peripheralManager.addService(service);
});

peripheralManager.on('serviceAdded', function(service, error) {
  console.log('\tserviceAdded =>', JSON.stringify(service, null, 2), error);
});

peripheralManager.on('accept', function(centralIdentifier, address) {
  console.log('\taccept => ', centralIdentifier, address);
});

peripheralManager.on('mtuChange', function(mtu) {
  console.log('\tmtuChange => ', mtu);
});
