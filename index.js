var CentralManager = require('./lib/central-manager');
var CentralManagerDelegate = require('./lib/central-manager-delegate');

var centralManagerDelegate = new CentralManagerDelegate();
var centralManager = new CentralManager(centralManagerDelegate);

centralManagerDelegate.on('stateUpdate', function(state) {
  console.log(state);

  centralManager.scanForPeripherals();
});
