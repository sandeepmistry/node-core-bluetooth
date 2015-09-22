var CentralManager = require('./lib/central-manager');
var centralManager = new CentralManager();

centralManager.on('stateUpdate', function(state) {
  console.log('\tstateUpdate => ', state);

  console.log('scanForPeripherals');
  centralManager.scanForPeripherals();
});

centralManager.on('peripheralDiscover', function(peripheral, advertisementData, rssi) {
  console.log('\tperipheralDiscover => ', peripheral.identifier, JSON.stringify(advertisementData), rssi);

  if (advertisementData.localName == 'CC2650 SensorTag') {
    console.log('stopScan');
    centralManager.stopScan();

    console.log('peripheral connect');
    peripheral.connect();

    peripheral.once('connect', function() {
      console.log('\tperipheral connect =>', peripheral.identifier);

      console.log('peripheral readRSSI');
      peripheral.readRSSI();
    });

    peripheral.once('disconnect', function(error) {
      console.log('\tperipheral disconnect =>', peripheral.identifier, error);

      process.exit(0);
    });

    peripheral.once('connectFail', function(error) {
      console.log('\tperipheral connectFail =>', peripheral.identifier, error);

      process.exit(0);
    });

    peripheral.once('rssiUpdate', function(rssi, error) {
      console.log('\tperipheral rssiUpdate =>', rssi, error);

      console.log('cancelConnection');
      peripheral.cancelConnection();
    });
  }
});
