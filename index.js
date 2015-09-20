var CentralManager = require('./lib/central-manager');
var centralManager = new CentralManager();

centralManager.on('stateUpdate', function(state) {
  console.log('stateUpdate => ', state);

  console.log('scanForPeripherals');
  centralManager.scanForPeripherals();
});

centralManager.on('peripheralDiscover', function(peripheral, advertisementData, rssi) {
  console.log('peripheralDiscover => ', peripheral.identifier, advertisementData, rssi);

  if (advertisementData.localName == 'CC2650 SensorTag') {
    console.log('stopScan');
    centralManager.stopScan();

    console.log('connect');
    centralManager.connect(peripheral);
  }
});

centralManager.on('peripheralConnect', function(peripheral) {
  console.log('peripheralConnect =>', peripheral.identifier);

  peripheral.once('rssiUpdate', function(rssi, error) {
    console.log('peripheral rssiUpdate =>', rssi, error);

    console.log('cancelConnection');
    centralManager.cancelConnection(peripheral);
  });

  peripheral.readRSSI();
});

centralManager.on('peripheralDisconnect', function(peripheral, error) {
  console.log('peripheralDisconnect =>', peripheral.identifier, error);

  process.exit(0);
});

centralManager.on('peripheralConnectFail', function(peripheral, error) {
  console.log('peripheralConnectFail =>', peripheral.identifier, error);

  process.exit(0);
});
