/*
 * SnapLabsDevicesApp.js
 * Contains the functions and logic for NERLD Gen 2 app for both the teacher and student functionality
 * This file includes the functions relating to connection to the sensortags themselves
 */

snaplabs.devices = {} // functions for connected devices
snaplabs.devices.connected = {} // An array of all the connected devices 
snaplabs.devices.found = {} // An array of all the found sensortag devices from scan
 
// UUIDs for services, characteristics, and descriptors.
snaplabs.devices.NOTIFICATION_DESCRIPTOR = '00002902-0000-1000-8000-00805f9b34fb'

snaplabs.devices.DEVICEINFO_SERVICE = '0000180a-0000-1000-8000-00805f9b34fb'
snaplabs.devices.FIRMWARE_DATA = '00002a26-0000-1000-8000-00805f9b34fb'
snaplabs.devices.MODELNUMBER_DATA = '00002a24-0000-1000-8000-00805f9b34fb'
snaplabs.devices.SYSTEM_ID = '00002a23-0000-1000-8000-00805f9b34fb'

snaplabs.devices.TEMPERATURE = {
	SERVICE: 'f000aa00-0451-4000-b000-000000000000',
	DATA: 'f000aa01-0451-4000-b000-000000000000',
	CONFIG: 'f000aa02-0451-4000-b000-000000000000',
	// Missing in HW rev. 1.2 (FW rev. 1.5)
	PERIOD: 'f000aa03-0451-4000-b000-000000000000',
}

snaplabs.devices.HUMIDITY = {
	SERVICE: 'f000aa20-0451-4000-b000-000000000000',
	DATA: 'f000aa21-0451-4000-b000-000000000000',
	CONFIG: 'f000aa22-0451-4000-b000-000000000000',
	PERIOD: 'f000aa23-0451-4000-b000-000000000000',
}

snaplabs.devices.BAROMETER = {
	SERVICE: 'f000aa40-0451-4000-b000-000000000000',
	DATA: 'f000aa41-0451-4000-b000-000000000000',
	CONFIG: 'f000aa42-0451-4000-b000-000000000000',
	CALIBRATION: 'f000aa43-0451-4000-b000-000000000000',
	PERIOD: 'f000aa44-0451-4000-b000-000000000000',
}

// Only in SensorTag CC2650.
snaplabs.devices.LUXOMETER = {
	SERVICE: 'f000aa70-0451-4000-b000-000000000000',
	DATA: 'f000aa71-0451-4000-b000-000000000000',
	CONFIG: 'f000aa72-0451-4000-b000-000000000000',
	PERIOD: 'f000aa73-0451-4000-b000-000000000000',
}

// Only in SensorTag CC2650.
snaplabs.devices.MOVEMENT = {
	SERVICE: 'f000aa80-0451-4000-b000-000000000000',
	DATA: 'f000aa81-0451-4000-b000-000000000000',
	CONFIG: 'f000aa82-0451-4000-b000-000000000000',
	PERIOD: 'f000aa83-0451-4000-b000-000000000000',
}

snaplabs.devices.KEYPRESS = {
	SERVICE: '0000ffe0-0000-1000-8000-00805f9b34fb',
	DATA: '0000ffe1-0000-1000-8000-00805f9b34fb',
}


var scanTimer 
snaplabs.devices.notifyGyroscope = false;
snaplabs.devices.notifyMagnetometer = false;
snaplabs.devices.notifyAccelerometer = false;



 /*
 * closeAllConnections
 * close connections from all opened devices
 */
 
snaplabs.devices.closeAllConnections = function(){
	console.log("DEBUG - evothings.easyble.closeConnectedDevices disconnecting devices")
	snaplabs.ui.displayStatus('Connect');
	snaplabs.ui.hideElementView('footerDisconnectButton')
	snaplabs.ui.showElementViewInline('footerConnectionButton')

	for(i=0; i<2;i++)
	{
		snaplabs.ui.displayValue('StatusData'+i, "NOT CONNECTED")
	}
	for (var key in snaplabs.devices.connected)
	{
		var device = snaplabs.devices.connected[key];
		device &&  evothings.ble.close(device);
		delete snaplabs.devices.connected[key];
	}
	
	// Stop saving data if it is
	if(snaplabs.data.isStoring)
	{
		snaplabs.data.isStoring = false;
		snaplabs.data.stopInitDataStorage();
	}
}

/*
* connectToDevice
* Connect to a specified device 
* NOTE - Currently implemented for scanning and NEW files only
*/
 
snaplabs.devices.addDeviceToConfig = function(deviceKey)
{
	snaplabs.ui.displayStatus('Connecting ... ');
	evothings.ble.stopScan();
	clearInterval(updateTimer);
	console.log("DEBUG - connecting to device with key " + deviceKey + " referring to device" + JSON.stringify(snaplabs.devices.found[deviceKey]))
	device = snaplabs.devices.found[deviceKey]
	//evothings.ble.connectToDevice(device, callback(device), snaplabs.devices.disconnect(device), snaplabs.devices.onConnectError)
	evothings.ble.connectToDevice(
		device,
		onConnectedAddToConfig,
		onDisconnectedAddToConfig,
		snaplabs.devices.onConnectError
	);
	 
	 
	function onConnectedAddToConfig(device)
    {
		snaplabs.ui.displayStatus('Connected');
		snaplabs.ui.showElementViewInline('footerDisconnectButton')
		snaplabs.ui.hideElementView('footerConnectionButton')

		snaplabs.devices.connected[device.address] = device;
        snaplabs.devices.enableKeyPressNotificationsForAdd(device)
		var service = evothings.ble.getService(device, snaplabs.devices.DEVICEINFO_SERVICE)
		var characteristic = evothings.ble.getCharacteristic(service, snaplabs.devices.SYSTEM_ID)

		var sID = ""
		var output = '';
		
		evothings.ble.readCharacteristic(
			device,
			characteristic,
			function(data)
			{
				sID = new Uint8Array(data)
				//Read first 3 bytes backward and convert to Hex
				for (var i=0; i<sID.length; i++){
					output += sID[i].toString(16);
				}
				snaplabs.sensortagconfig.addToConfig(output)
			},
			function(errorCode)
			{
				console.log('readCharacteristic error: ' + errorCode);
			}
		);		
    }
	
	function onDisconnectedAddToConfig(device)
    {
		snaplabs.ui.displayStatus('Disconnected');
		delete snaplabs.devices.connected[device.address];
        console.log('Disconnected from device: ' + device.name);
    }
	 
}

/*
* snaplabs.devices.connectToAllDevicesExperiment
* Look for each of the devices configured and make a connection
*
*/

snaplabs.devices.connectToAllDevicesExperiment = function()
{
	console.log("DEBUG - connecting to devices")
	snaplabs.devices.closeAllConnections 
	snaplabs.ui.displayValue('footerConnectionButton', "Connecting ...")
	var connectionCounter = 0;
	
	//for(var id in snaplabs.experimentconfig.experimentSensortags)
	function scanForDevice(id)
	{
		console.log("DEBUG - scan for device " + id)
		snaplabs.ui.displayValue('StatusData'+id, "SEARCHING ...")

		scanTimer = setTimeout(snaplabs.devices.scanTimeOut,
			20000,
			function() { console.log("Scan complete"); },
			function() { console.log("stopScan failed"); }
		);
		 
		// Start scanning. 
		evothings.ble.startScan(
			function(device){
				if (device.name == 'CC2650 SensorTag') 
				{
					console.log('Found device: ID: ' + connectionCounter + " and details " + JSON.stringify(device))
					onDeviceFoundExperiment(device,connectionCounter)
					connectionCounter++;
				}
			},
			snaplabs.devices.onScanError)
	}

	// This function is called when a device is detected, here
	// we check if we found the device we are looking for.
	function onDeviceFoundExperiment(device,idFound)
	{
		if (device.name == 'CC2650 SensorTag') 
		{
			console.log('Found the TI SensorTag! Clearing Timer')

			// Connect.
			snaplabs.devices.connectToDeviceExperiment(device, idFound)
			
			console.log("DEBUG - stop scan if last found, otherwise scan again " + connectionCounter + " of " + snaplabs.experimentconfig.experimentSensortags.length)
			if(connectionCounter == snaplabs.experimentconfig.experimentSensortags.length-1)
			{				
				clearTimeout(scanTimer);
				evothings.ble.stopScan();   
			}				
		} 
	}
	
	scanForDevice(connectionCounter);
}

/*
* snaplabs.devices.connectToDeviceExperiment
* Make a connection to the specified device and store this
*
*/

snaplabs.devices.connectToDeviceExperiment = function(device, id)
{
	snaplabs.ui.displayValue('StatusData'+id, "CONNECTING ...")

    evothings.ble.connectToDevice(
        device,
		function(device){
			onConnectedExperiment(device, id)
		},
        function(error){
			onDisconnectedExperiment(error, id, device)
		},
        snaplabs.devices.onConnectError)

    function onConnectedExperiment(device,id)
    {
        console.log('DEBUG - Connected to device. Setting up device ' + id )
		snaplabs.experimentconfig.experimentSensortags[id].device = device
		snaplabs.devices.connected[device.address] = device;
		snaplabs.ui.displayValue('StatusData'+id, "CONNECTED")
		
		// Read Devce Info for Name
		var service = evothings.ble.getService(device, snaplabs.devices.DEVICEINFO_SERVICE)
		var characteristic = evothings.ble.getCharacteristic(service, snaplabs.devices.SYSTEM_ID)
		var sysID = ""
		evothings.ble.readCharacteristic(
			device,
			characteristic,
			function(data)
			{
				var sID = new Uint8Array(data)
				//Read first 3 bytes backward and convert to Hex
				for (var i=0; i<sID.length; i++){
					sysID += sID[i].toString(16);
				}
				var tagName =  snaplabs.sensortagconfig.lookUpSensortagMapping(sysID)
				snaplabs.ui.displayValue('SystemID'+id, tagName)
			},
			function(errorCode)
			{
				console.log('readCharacteristic error: ' + errorCode);
			}
		);		
		
		snaplabs.ui.displayValue('StatusData'+id, "READING SENSORS ...")
		snaplabs.ui.displayValue('footerConnectionButton', "CONNECT")
		snaplabs.ui.showElementViewInline('footerDisconnectButton')
		snaplabs.ui.hideElementView('footerConnectionButton')

		//for(sensor in snaplabs.experimentconfig.experimentSensortags[id].sensors)
		var enableSensors = snaplabs.experimentconfig.experimentSensortags[id].sensors
		var movementBits = 0; 
		// Use for each to ensure asych call in loop is done before next iteration
		enableSensors.forEach(function(sensor, index)
		{
			console.log("Debug - value in loop is " + sensor)
			sensorType = sensor.toUpperCase()
			
			switch(sensor){
				case "Temperature":
					snaplabs.devices.enableTemperatureSensor(device, id)
					break;
				case "Barometer":
					snaplabs.devices.enableBarometerSensor(device, id)
					break;
				case "Humidity":
					snaplabs.devices.enableHumiditySensor(device, id)
					break;
				case "Luxometer":
					snaplabs.devices.enableLuxometerSensor(device, id)
					break;
				case "Gyroscope":
					movementBits += 7
					snaplabs.devices.notifyGyroscope = true;
					//snaplabs.devices.enableMovementSensor(device,movementBits, id, sensor )
					break;
				case "Accelerometer":
					movementBits += 56
					snaplabs.devices.notifyAccelerometer = true;
					//snaplabs.devices.enableMovementSensor(device,movementBits, id, sensor)
					break;
				case "Magnetometer":
					movementBits += 64
					snaplabs.devices.notifyMagnetometer = true;
					//snaplabs.devices.enableMovementSensor(device,movementBits, id, sensor)
					break;
				default:
					console.log("DEBUG - enabling " + sensorType + " " + snaplabs.devices[sensorType].SERVICE)
					var service = evothings.ble.getService(device, snaplabs.devices[sensorType].SERVICE)
					var configCharacteristic = evothings.ble.getCharacteristic(service, snaplabs.devices[sensorType].CONFIG)
					var dataCharacteristic = evothings.ble.getCharacteristic(service, snaplabs.devices[sensorType].DATA)

					evothings.ble.writeCharacteristic(
						device,
						configCharacteristic,
						new Uint8Array([1]),
						function(){
							snaplabs.devices.onSensorActivated(device,dataCharacteristic,sensorType, id)
						},
						function(err){
							snaplabs.devices.onSensorActivatedError(err)
						})
						
			}
		});
		
		// Enable movement sensors if any set 
		if(snaplabs.devices.notifyGyroscope || snaplabs.devices.notifyAccelerometer || snaplabs.devices.notifyMagnetometer )
			snaplabs.devices.enableMovementSensor(device,movementBits, id)
    }

    // Function called if the device disconnects.
    function onDisconnectedExperiment(error,id)
    {
		delete snaplabs.devices.connected[device.address];

		snaplabs.ui.displayValue('StatusData'+id, "DISCONNECTED")

		snaplabs.ui.displayValue('footerConnectionButton', "CONNECT")
		snaplabs.ui.showElementViewInline('footerConnectionButton')
		snaplabs.ui.hideElementView('footerDisconnectButton')

        console.log('Device disconnected from experiment')
    }
}

/*
 * snaplabs.devices.enableTemperatureSensor(devices)
 * Write to Temperature Sensor to Activate
 *
 */
snaplabs.devices.enableTemperatureSensor = function(device, id)
{
	console.log("DEBUG - activating Temperature Sensor " + id)
	var service = evothings.ble.getService(device, snaplabs.devices.TEMPERATURE.SERVICE)
	var configCharacteristic = evothings.ble.getCharacteristic(service, snaplabs.devices.TEMPERATURE.CONFIG)
	var dataCharacteristic = evothings.ble.getCharacteristic(service, snaplabs.devices.TEMPERATURE.DATA)
	var periodCharacteristic = evothings.ble.getCharacteristic(service, snaplabs.devices.TEMPERATURE.PERIOD)
	
	evothings.ble.writeCharacteristic(
		device,
		configCharacteristic,
		new Uint8Array([1]),
		function(){
			snaplabs.devices.setPeriod(device,periodCharacteristic, dataCharacteristic, "Temperature", id)
		},
		function(err){
			snaplabs.devices.onSetPeriodError(err,id)
		})
}


 /*
 * snaplab.devices.calulateTemperature
 * Extract Temperature Data from values
 *
 */
snaplabs.devices.calculateTemperature = function(data,id)
{

	// Calculate target temperature (Celsius).
	var tc = new DataView(data).getUint16(0, true)
	tc = (tc >> 2) * 0.03125
	// Calculate ambient temp
	var ac = new DataView(data).getUint16(2, true) / 128.0

	var af = celsiusToFahrenheit(ac)
	var tf = celsiusToFahrenheit(tc)

	//console.log("DEBUG - Temp calculator for id " + id + " got data " + ac+ "," + tc + "," + af + "," + tf)

	// Handle Data in common function for both temoerature handlers
	snaplabs.display.temperatureDisplay(id, ac, af,tc,tf)
}

/*
 * snaplabs.devices.enableHumiditySensor(devices)
 * Write to Humidity Sensor to Activate
 *
 */
snaplabs.devices.enableHumiditySensor = function(device, id)
{
	console.log("DEBUG - activating Humidity Sensor")
	var service = evothings.ble.getService(device, snaplabs.devices.HUMIDITY.SERVICE)
	var configCharacteristic = evothings.ble.getCharacteristic(service, snaplabs.devices.HUMIDITY.CONFIG)
	var dataCharacteristic = evothings.ble.getCharacteristic(service, snaplabs.devices.HUMIDITY.DATA)
	var periodCharacteristic = evothings.ble.getCharacteristic(service, snaplabs.devices.HUMIDITY.PERIOD)

	evothings.ble.writeCharacteristic(
		device,
		configCharacteristic,
		new Uint8Array([1]),
		function(){
			snaplabs.devices.setPeriod(device,periodCharacteristic, dataCharacteristic, "Humidity", id)
		},
		function(err){
			snaplabs.devices.onSetPeriodError(err,id)
		})
}

 /*
 * snaplab.devices.calulateHumidity
 * Extract Humidity Data from values
 *
 */
snaplabs.devices.calculateHumidity = function(data,id)
{
	var tData = new DataView(data).getUint16(0, true)
	var tc = -46.85 + 175.72 / 65536.0 * tData

	// Calculate the relative humidity.
	var temp = new DataView(data).getUint16(0, true)
	var hData = (temp & ~0x03)
	var h = -6.0 + 125.00 / 65536.0 * hData

	var tf = celsiusToFahrenheit(tc)

	snaplabs.display.humidityDisplay(id, tc, tf, h)
}

/*
 * snaplabs.devices.enableBarometerSensor(devices)
 * Write to Barometer Sensor to Activate
 *
 */
snaplabs.devices.enableBarometerSensor = function(device, id)
{
	console.log("DEBUG - activating Barometer Sensor")
	var service = evothings.ble.getService(device, snaplabs.devices.BAROMETER.SERVICE)
	var configCharacteristic = evothings.ble.getCharacteristic(service, snaplabs.devices.BAROMETER.CONFIG)
	var dataCharacteristic = evothings.ble.getCharacteristic(service, snaplabs.devices.BAROMETER.DATA)
	var periodCharacteristic = evothings.ble.getCharacteristic(service, snaplabs.devices.BAROMETER.PERIOD)

	evothings.ble.writeCharacteristic(
		device,
		configCharacteristic,
		new Uint8Array([1]),
		function(){
			snaplabs.devices.setPeriod(device,periodCharacteristic, dataCharacteristic, "Barometer", id)
		},
		function(err){
			snaplabs.devices.onSetPeriodError(err,id)
		})
}

 /*
 * snaplab.devices.calulateBarometer
 * Extract Pressure Data from values
 *
 */
snaplabs.devices.calculateBarometer = function(data,id)
{
	var flTempData =  new DataView(data).getUint32(0, true);
	var flPressureData = new DataView(data).getUint32(2, true);

	
	flTempBMP = (flTempData & 0x00ffffff)/ 100.0;
	flPressure = ((flPressureData >> 8) & 0x00ffffff) / 100.0;

	//console.log("DEBUG - Barometer calculator for id " + id + " got data " + flTempBMP+ "," + flPressure)
	
	snaplabs.display.barometerDisplay(id, flTempBMP, flPressure)
}
/*
 * snaplabs.devices.enableMovementSensor(devices)
 * Write to Movement Sensor to Activate
 *
 */
snaplabs.devices.enableMovementSensor = function(device, bits, id)
{
	// Write seconf Byte at 0 to set accelerometer range to 4G (0=2G, 1=4G, 2=8G, 3=16G)
	// http://processors.wiki.ti.com/index.php/CC2650_SensorTag_User's_Guide#Movement_Sensor
	var val = [bits,0];
	console.log("DEBUG - activating Movement Sensor with bits " + bits  + " and val " + val.toString())
	
	var service = evothings.ble.getService(device, snaplabs.devices.MOVEMENT.SERVICE)
	var configCharacteristic = evothings.ble.getCharacteristic(service, snaplabs.devices.MOVEMENT.CONFIG)
	var dataCharacteristic = evothings.ble.getCharacteristic(service, snaplabs.devices.MOVEMENT.DATA)
	var periodCharacteristic = evothings.ble.getCharacteristic(service, snaplabs.devices.MOVEMENT.PERIOD)

	console.log("Are values ok: " + configCharacteristic + dataCharacteristic + periodCharacteristic)
	evothings.ble.writeCharacteristic(
		device,
		configCharacteristic,
		new Uint8Array(val),
		function(){
			snaplabs.devices.setPeriod(device,periodCharacteristic, dataCharacteristic, "Movement", id)
		},
		function(err){
			snaplabs.devices.onSetPeriodError(err)
		})
		
	// Just for testing
	/*evothings.ble.readCharacteristic(
		device,
		configCharacteristic,
		function(data)
		{
			console.log('Movement characteristic data for ' + sensorType + ' is: ' + new DataView(data).getUint16(0, true));
		},
		function(errorCode)
		{
			console.log('Move readCharacteristic error: ' + errorCode);
		}
		);*/

} 

snaplabs.devices.calculateMovement = function(data, id)
{
	if(snaplabs.devices.notifyAccelerometer)
		snaplabs.devices.calculateAccelerometer(data, id) 
	if(snaplabs.devices.notifyMagnetometer)
		snaplabs.devices.calculateMagnetometer(data, id) 
	if(snaplabs.devices.notifyGyroscope)
		snaplabs.devices.calculateGyroscope(data, id) 
}

 /*
 * snaplab.devices.calulateAccelerometer
 * Extract Acceleration Data from values
 *
 */
snaplabs.devices.calculateAccelerometer = function(data,id)
{
	// val depends on range: 2G = (32768/2), 4G = (32768/4), 8G = (32768/8) = 4096, 16G (32768/16)
	// To correspond with bit set in snaplabs.devices.enableMovementSensor
	// NOTE - MUST BE SIGNED INT (Not getUint16)
	var val = 32768/2;
	var divisors = {x: -1*val, y: val, z: -1*val}
	var ax_temp = new DataView(data).getInt16(6, true);
	var ay_temp = new DataView(data).getInt16(8, true);
	var az_temp = new DataView(data).getInt16(10, true);
	//console.log("DEBUG - accelerometer values read are :" + ax_temp + ", " + ay_temp + ", " +az_temp  )
	// Calculate accelerometer values.
	// Leave as 6,8,10  http://processors.wiki.ti.com/index.php/CC2650_SensorTag_User's_Guide#Movement_Sensor
	var ax = ax_temp / divisors.x
	var ay = ay_temp / divisors.y
	var az = az_temp / divisors.z
	var comb = Math.sqrt(ax*ax+ay*ay+az*az)

	snaplabs.display.accelerometerDisplay(id, ax,ay,az, comb)
}


 /*
 * snaplab.devices.calulateGyroscope
 * Extract Gyroscope Data from values
 *
 */
snaplabs.devices.calculateGyroscope = function(data,id)
{
	//-- calculate rotation, unit deg/s, range -250, +250
	// Leave as 6,8,10  http://processors.wiki.ti.com/index.php/CC2650_SensorTag_User's_Guide#Movement_Sensor
	var val = 500 / 65536.0;
	var gx = new DataView(data).getInt16(0, true) * val;
	var gy = new DataView(data).getInt16(2, true) * val;
	var gz = new DataView(data).getInt16(4, true) * val;

	snaplabs.display.gyroscopeDisplay(id, gx,gy,gz)
}

 /*
 * snaplab.devices.calculateMagnetometer
 * Extract Gyroscope Data from values
 *
 */
snaplabs.devices.calculateMagnetometer = function(data,id)
{
	var mx = new DataView(data).getInt16(12, true);
	var my = new DataView(data).getInt16(14, true);
	var mz = new DataView(data).getInt16(16, true);
	var comb = Math.sqrt(mx*mx+my*my+mz*mz)
	
	//console.log("DEBUG - calling mag display for id " + id + " with values " + mx + "," + my + "," + mz)
	snaplabs.display.magnetometerDisplay(id, mx,my,mz, comb)
}

/*
 * snaplabs.devices.enableLuxometerSensor(devices)
 * Write to Luxometer Sensor to Activate
 *
 */
snaplabs.devices.enableLuxometerSensor = function(device, id)
{
	console.log("DEBUG - activating Luxometer Sensor")
	var service = evothings.ble.getService(device, snaplabs.devices.LUXOMETER.SERVICE)
	var configCharacteristic = evothings.ble.getCharacteristic(service, snaplabs.devices.LUXOMETER.CONFIG)
	var dataCharacteristic = evothings.ble.getCharacteristic(service, snaplabs.devices.LUXOMETER.DATA)
	var periodCharacteristic = evothings.ble.getCharacteristic(service, snaplabs.devices.LUXOMETER.PERIOD)

	evothings.ble.writeCharacteristic(
		device,
		configCharacteristic,
		new Uint8Array([1]),
		function(){
			snaplabs.devices.setPeriod(device,periodCharacteristic, dataCharacteristic, "Luxometer", id)
		},
		function(err){
			snaplabs.devices.onSetPeriodError(err,id)
		})
} 

// Calculate the light level from raw sensor data.
// Return light level in lux.
snaplabs.devices.calculateLuxometer = function(data, id)
{
    // Get 16 bit value from data buffer in little endian format.
    var value = new DataView(data).getUint16(0, true)

    // Extraction of luxometer value, based on sfloatExp2ToDouble
    // from BLEUtility.m in Texas Instruments TI BLE SensorTag
    // iOS app source code.
    var mantissa = value & 0x0FFF
    var exponent = value >> 12

    var magnitude = Math.pow(2, exponent)
    var output = (mantissa * magnitude)

	var lux = output / 100.0
	
	var string =
		lux.toPrecision(5) + ' lux<br/>'
		
	snaplabs.display.singleValDisplay(id, "Luxometer",  string, lux , "lux")

}

/*
 * snaplab.devices.calulateTemperature
 * Extract Temperature Data from values
 *
 */
 
snaplabs.devices.setPeriod = function(device, periodCharacteristic, dataCharacteristic, sensorType, id){
	console.log("DEBUG - setting period for sensor " + sensorType+id )
	
	var period = snaplabs.experimentconfig.configuredSampleInterval/10
	if (sensorType == "Temperature" && period <= 10)
			period = 30;
	console.log("DEBUG - setting period to " + period)
	console.log("DEBUG - device and char are " + device.address + " " + periodCharacteristic)
	
	evothings.ble.writeCharacteristic(
		device,
		periodCharacteristic,
		new Uint8Array([period]),
		function(){
			snaplabs.devices.onSensorActivated(device,dataCharacteristic,sensorType, id)
		},
		function(err){
			snaplabs.devices.onSetPeriodError(err, sensorType)
		})	
}

snaplabs.devices.onSetPeriodError = function(error, type)
{
	console.log('Set Period error for ' + type + ': ' + error)
}
 /*
 * snaplabs.devices.onSensorActivated(devices,sensorType)
 * Enable notifications once Sensor has been turned on
 *
 */
snaplabs.devices.onSensorActivated = function(device, characteristic,sensorType, id){
	console.log("DEBUG - characteristic written for " + sensorType)
	evothings.ble.enableNotification(
		device,
		characteristic,
		function(data)
		{   
		    var value = new DataView(data).getUint16(0, true)
			switch(sensorType){
				case "Temperature":
					snaplabs.devices.calculateTemperature(data, id)
					break;
				case "Barometer":
					snaplabs.devices.calculateBarometer(data, id)
					break;
				case "Humidity":
					snaplabs.devices.calculateHumidity(data, id)
					break;
				case "Luxometer":
					snaplabs.devices.calculateLuxometer(data, id)
					break;
				case "Movement":
					snaplabs.devices.calculateMovement(data, id)
					break;
				default:
					console.log('characteristic data ' + sensorType + ': ' + value);
			}

		},
		function(errorCode)
		{
			console.log('readCharacteristic error: ' + errorCode);
		});
}

snaplabs.devices.onSensorActivatedError = function(error, type)
{
	console.log('Sensor activate error for ' + type + ': ' + error)
}

/*
* snaplabs.devices.scanTimeOut
* Function if no connection made in 10 seconds
*/
snaplabs.devices.scanTimeOut = function(){
	console.log("DEBUG - scan times out - stopping scan")
	
	for(var id in snaplabs.experimentconfig.experimentSensortags)
	{
		snaplabs.ui.displayValue('StatusData'+id, "NOT CONNECTED")
		clearTimeout(scanTimer);
		//evothings.ble.close(snaplabs.experimentconfig.experimentSensortags[id].device);
	}
	snaplabs.ui.displayValue('footerConnectionButton', "Connect")

	snaplabs.devices.closeAllConnections();
	evothings.ble.stopScan();
	alert("Could not connect to SensorTags, please check that you have a sufficient number of SensorTags powered up and in range.") 
}

/*
* disconnect
* Connect to a specified device 
* NOTE - Currently implemented for scanning!
*/
 
snaplabs.devices.disconnect = function(deviceKey)
{
	device = snaplabs.devices.connected[deviceKey]

	console.log("DEBUG - found device to disconnect as: " + JSON.stringify(device))
	snaplabs.ui.displayStatus('Disconnected');
	snaplabs.ui.displayValue(device.address+'Connect', "Added to configuration: " + device.address)
	snaplabs.ui.hideElementView(device.address+'Disconnect')

	evothings.ble.stopScan();
	clearInterval(updateTimer);
	device &&  evothings.ble.close(device);
	delete snaplabs.devices.connected[deviceKey];
}

/*
* deviceFound
* Called when a device is found. Device added to register and its timestamp is updated
*
*/ 
snaplabs.devices.deviceFound = function(device)
{
	//console.log("DEBUG - Device found. Device is " + JSON.stringify(device))
	if (device.name)
	{
		// Set timestamp for device (this is used to remove inactive devices).
		device.timeStamp = Date.now();
		// Insert the device into table of found devices.
		// Do this only id it is a sensortag device
		var devName = device.name.toLowerCase()
		if(devName.includes("sensortag") != null){
			snaplabs.devices.found[device.address] = device;
		}
	}
	else 
	{
		//console.log("DEBUG - Non sensortag  in device found. Device is " + JSON.stringify(device))
	}
};

snaplabs.devices.getSystemID = function(device)
{
	var service = evothings.ble.getService(device, snaplabs.devices.DEVICEINFO_SERVICE)
	//console.log("DEBUG - got service " + JSON.stringify(service))
	var characteristic = evothings.ble.getCharacteristic(service, snaplabs.devices.SYSTEM_ID)
	//console.log("DEBUG - got systemID Data" + JSON.stringify(characteristic))

	var sID = ""
	var output = '';
	
	evothings.ble.readCharacteristic(
		device,
		characteristic,
		function(data)
		{
			sID = new Uint8Array(data)
			console.log('readCharacteristic sID: ' + sID);
			//Read first 3 bytes backward and convert to Hex
			for (var i=0; i<sID.length; i++){
				output += sID[i].toString(16);
			}
			return output;
		},
		function(errorCode)
		{
			console.log('readCharacteristic error: ' + errorCode);
			output = "NONE"
		}
	);
}

snaplabs.devices.enableKeyPressNotificationsForAdd = function(device){
	var service = evothings.ble.getService(device, snaplabs.devices.KEYPRESS.SERVICE)
    var dataCharacteristic = evothings.ble.getCharacteristic(service, snaplabs.devices.KEYPRESS.DATA)
	console.log("DEBUG - keypress service for adding " + JSON.stringify(service) )
	console.log("DEBUG - keypress data for adding " + JSON.stringify(dataCharacteristic) )
	device.pressed = 0
	
	evothings.ble.enableNotification(
		device,
		dataCharacteristic,
		function(data)
		{
			console.log("DEBUG - Key Pressed with info " + evothings.ble.fromUtf8(data))
			// Enter the details only once key press complete
			if(device.pressed=='0')
			{
				device.pressed = 1
				navigator.notification.prompt(
					'Please enter the name you would like for this Sensor',  // message
			        function(results){
						snaplabs.sensortagconfig.addSensor(results, device);
					},     // callback to invoke
					'SensorTag Name', // title
					['Ok','Exit'],             // buttonLabels
					'SensorTag'                 // defaultText
				);
			}
		},
		snaplabs.devices.onEnableError);
	
}

snaplabs.devices.onScanError = function(errorCode){
	snaplabs.ui.displayStatus('Scan Error: ' + errorCode);
}

snaplabs.devices.onConnectError = function(errorCode){
	console.log("DEBUG - Connection Error: " + errorCode); 
	snaplabs.ui.displayStatus('Connection Error: ' + errorCode);
}

snaplabs.devices.onEnableError = function(errorCode){
	console.log("DEBUG - Enable Error: " + errorCode); 
	snaplabs.ui.displayStatus('Enable Error: ' + errorCode);
}

function dec2bin(dec){
    return (dec >>> 0).toString(2);
}

celsiusToFahrenheit = function(celsius)
{
	return (celsius * 9 / 5) + 32
}