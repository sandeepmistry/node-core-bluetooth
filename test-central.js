var CentralManager = require('./index').CentralManager;
var centralManager = new CentralManager();

centralManager.on('stateUpdate', function(state) {
  console.log('\tstateUpdate => ', state);

  console.log('scanForPeripherals');
  centralManager.scanForPeripherals();
});

centralManager.on('peripheralDiscover', function(peripheral, advertisementData, rssi) {
  console.log('\tperipheralDiscover => ', peripheral.identifier, JSON.stringify(advertisementData), rssi);

  if (advertisementData.localName == 'test') {
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

      console.log('discoverServices');
      peripheral.discoverServices();
    });

    peripheral.on('servicesDiscover', function(services, error) {
      console.log('\tperipheral servicesDiscover =>', services.toString(), error);

      var service = services[0];

      console.log('discoverIncludedServices');
      service.discoverIncludedServices();

      service.on('includedServicesDiscover', function(includedServices, error) {
        console.log('\tservice includedServicesDiscover =>', includedServices.toString(), error);

        console.log('discoverCharacteristics');
        service.discoverCharacteristics();
      });

      service.on('characteristicsDiscover', function(characteristics, error) {
        console.log('\tservice characteristicsDiscover =>', characteristics.toString(), error);

        var characteristic = characteristics[0];

        console.log('discoverDescriptors');
        characteristic.discoverDescriptors();
        characteristic.on('descriptorsDiscover', function(descriptors, error) {
          console.log('\tcharacteristic descriptorsDiscover =>', descriptors.toString(), error);

          if (descriptors && descriptors.length) {
            var descriptor = descriptors[0];

            console.log('descriptor - readValue');
            descriptor.readValue();

            descriptor.on('valueUpdate', function(value, error) {
              console.log('\tdescriptor valueUpdate =>', value.toString('hex'), error);
            });

            // console.log('descriptor - writeValue');
            // descriptor.writeValue(new Buffer('0000', 'hex'));

            // descriptor.on('valueWrite', function(error) {
            //   console.log('\tdescriptor valueWrite =>', error);
            // });
          }

          if (characteristic.properties.indexOf('read') !== -1) {
            console.log('characteristic - readValue');
            characteristic.readValue();
          } else if (characteristic.properties.indexOf('write') !== -1) {
            console.log('characteristic - writeValue');
            characteristic.writeValue(new Buffer('hello'));
          } else if (characteristic.properties.indexOf('writeWithoutResponse') !== -1) {
            console.log('characteristic - writeValue');
            characteristic.writeValue(new Buffer('hello'), true);
          } else if (characteristic.properties.indexOf('broadcast') !== -1) {
            console.log('characteristic - setBroadcastValue');
            characteristic.setBroadcastValue(true);
          } else if (characteristic.properties.indexOf('notify') !== -1 || characteristic.properties.indexOf('indicate') !== -1) {
            console.log('characteristic - setNotifyValue');
            characteristic.setNotifyValue(true);
          }
        });

        characteristic.on('valueUpdate', function(value, error) {
          console.log('\tcharacteristic valueUpdate =>', value.toString('hex'), error);

          console.log('cancelConnection');
          peripheral.cancelConnection();
        });

        characteristic.on('valueWrite', function(error) {
          console.log('\tcharacteristic valueWrite =>', error);

          console.log('cancelConnection');
          peripheral.cancelConnection();
        });

        characteristic.on('notificationStateUpdate', function(state, error) {
          console.log('\tcharacteristic notificationStateUpdate =>', state, error);
        });
      });
    });
  }
});
