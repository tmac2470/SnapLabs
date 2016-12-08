var sensortag0
var sensortag1
var g = 9.81;
var sensorStartTime = -1;
var graphDisplay = new Array()  // variable storing whether graph is currently displaying ot not

function initialiseSensorTag()
{
	// Create First SensorTag CC2650 instance.
	sensortag0 = evothings.tisensortag.createInstance(
		evothings.tisensortag.CC2650_BLUETOOTH_SMART)
	sensortag0.connected = false;

	sensortag1 = evothings.tisensortag.createInstance(
		evothings.tisensortag.CC2650_BLUETOOTH_SMART)
	sensortag1.connected = false;
	
	//
	// Here sensors are set up.
	//
	// If you wish to use only one or a few sensors, just set up
	// the ones you wish to use.
	//
	// First parameter to sensor function is the callback function.
	// Several of the sensors take a millisecond update interval
	// as the second parameter.
	//
	sensortag0
		.statusCallback(statusHandler)
		.errorCallback(sensorErrorHandler)
		.keypressCallback(keypressHandler)
		/*.temperatureCallback(temperatureHandler, 1000)
		.humidityCallback(humidityHandler, 1000)
		.barometerCallback(barometerHandler, 1000)
		.accelerometerCallback(accelerometerHandler, 1000)
		.magnetometerCallback(magnetometerHandler, 1000)
		.gyroscopeCallback(gyroscopeHandler, 1000)
		.luxometerCallback(luxometerHandler, 1000)*/

	sensortag1
		.statusCallback(statusHandler1)
		.errorCallback(sensorErrorHandler1)
		.keypressCallback(keypressHandler1)
		/*.temperatureCallback(temperatureHandler1, 1000)
		.humidityCallback(humidityHandler1, 1000)
		.barometerCallback(barometerHandler1, 1000)
		.accelerometerCallback(accelerometerHandler1, 1000)
		.magnetometerCallback(magnetometerHandler1, 1000)
		.gyroscopeCallback(gyroscopeHandler1, 1000)
		.luxometerCallback(luxometerHandler, 1000)*/
} 


function initialiseHandler(id, sensor, period)
{
	//console.log("DEBUG - Initialising handler for: " + id + " and " + sensor)
	var interval = 1000;
	if(period !== null)
	{
		interval = period
		console.log("DEBUG - Sampling interval set to " + interval)
	}
		

	if(id==0)
	{
		switch(sensor){
			case "Keypress":
				sensortag0.keypressCallback(keypressHandler);
			case "Temperature":
				sensortag0.temperatureCallback(temperatureHandler, interval);
			case "Humidity":
				sensortag0.humidityCallback(humidityHandler, interval);
			case "Barometer":
				sensortag0.barometerCallback(barometerHandler, interval);
			case "Accelerometer":
				sensortag0.accelerometerCallback(accelerometerHandler, interval);
			case "Magnetometer":
				sensortag0.magnetometerCallback(magnetometerHandler, interval);
			case "Gyroscope":
				sensortag0.gyroscopeCallback(gyroscopeHandler, interval);
			case "Luxometer":
				sensortag0.luxometerCallback(luxometerHandler, interval);
		}
	} 
	
	if(id==1)
	{
		switch(sensor){
			case "Keypress":
				sensortag1.keypressCallback(keypressHandler1);
			case "Temperature":
				sensortag1.temperatureCallback(temperatureHandler1, interval)
			case "Humidity":
				sensortag1.humidityCallback(humidityHandler1, interval)
			case "Barometer":
				sensortag1.barometerCallback(barometerHandler1, interval)
			case "Accelerometer":
				sensortag1.accelerometerCallback(accelerometerHandler1, interval)
			case "Magnetometer":
				sensortag1.magnetometerCallback(magnetometerHandler1, interval)
			case "Gyroscope":
				sensortag1.gyroscopeCallback(gyroscopeHandler1, interval)
			case "Luxometer":
				sensortag1.luxometerCallback(luxometerHandler1, interval)
		}
	}
}

function connection(id)
{
	//console.log("DEBUG - setting connection for id " + id + " and connection is " + sensortag0.connected)
	if(id==0){
		if (!sensortag0.connected)
		{
			sensortag0.connectToNearestDevice();
			sensortag0.connected = true;
		}
		else
		{
			disconnect0();
			sensortag0.connected = false;
			displayValue("connectionButton0","Reconnect")
			changeButtonColour("connectionButton0","asellbrightgreen")
		}
	}
	else if(id==1)
	{
		if (!sensortag1.connected)
		{
			sensortag1.connectToNearestDevice();
			sensortag1.connected = true;
		}
		else
		{
			disconnect1();
			sensortag1.connected = false;
			displayValue("connectionButton1","Reconnect")
			changeButtonColour("connectionButton1","asellbrightgreen")
		}
		
	}
}

function connect0()
{
	sensortag0.connectToNearestDevice()
}

function connect1()
{
	sensortag1.connectToNearestDevice()
}

function disconnect()
{
	sensortag0.disconnectDevice()
	sensortag1.disconnectDevice()
	resetSensorDisplayValues(1)
	resetSensorDisplayValues(0)
}

function disconnect0()
{
	sensortag0.disconnectDevice()
	//resetSensorDisplayValues(0)
}

function disconnect1()
{
	sensortag1.disconnectDevice()
	//resetSensorDisplayValues(1)
}
var sensorsOn = true

function toggleSensors()
{
	if(sensorsOn)
	{
		sensortag0.keypressOff()
		sensortag0.temperatureOff()
		sensortag0.humidityOff()
		sensortag0.barometerOff()
		sensortag0.accelerometerOff()
		sensortag0.magnetometerOff()
		sensortag0.gyroscopeOff()
		sensortag0.luxometerOff()

		sensortag1.keypressOff()
		sensortag1.temperatureOff()
		sensortag1.humidityOff()
		sensortag1.barometerOff()
		sensortag1.accelerometerOff()
		sensortag1.magnetometerOff()
		sensortag1.gyroscopeOff()
		sensortag1.luxometerOff()
		sensorsOn = false
	}
	else
	{
		sensortag0.keypressOn(
		sensortag0.keypressOn()
		sensortag0.temperatureOn()
		sensortag0.humidityOn()
		sensortag0.barometerOn()
		sensortag0.accelerometerOn()
		sensortag0.magnetometerOn()
		sensortag0.gyroscopeOn()
		sensortag0.luxometerOn()

		sensortag1.keypressOn()
		sensortag1.temperatureOn()
		sensortag1.humidityOn()
		sensortag1.barometerOn()
		sensortag1.accelerometerOn()
		sensortag1.magnetometerOn()
		sensortag1.gyroscopeOn()
		sensortag1.luxometerOn()
		sensorsOn = true
	}
}

function statusHandler(status)
{
	switch(status) {
		case 'DEVICE_INFO_AVAILABLE':
			var systemID = sensortag0.getSystemID()
			console.log("DEBUG - SystemID is: " + systemID)
			displayValue('SystemID0', lookUpSensortagMapping(systemID))
			break;
		case 'SCANNING':
			displayValue("connectionButton0","Connecting")
			changeButtonColour("connectionButton0","asellorange")
			sensortag0.connected = false;
			break;
		case 'SENSORTAG_NOT_FOUND':
			displayValue("connectionButton0","Connect")
			changeButtonColour("connectionButton0","asellbrightgreen")
			sensortag0.connected = false;
			break;
		case 'SENSORTAG_ONLINE':
			displayValue("connectionButton0","Disconnect")
			changeButtonColour("connectionButton0","asellred")
			sensortag0.connected = true;
			break;	}
	displayValue('StatusData0', status)
}


function statusHandler1(status)
{
	switch(status) {
		case 'DEVICE_INFO_AVAILABLE':
			var systemID = sensortag1.getSystemID()
			console.log("DEBUG - SystemID is: " + systemID)
			displayValue('SystemID1', lookUpSensortagMapping(systemID))
			break;
		case 'SCANNING':
			displayValue("connectionButton1","Connecting")
			changeButtonColour("connectionButton1","asellorange")
			sensortag1.connected = false;
			break;
		case 'SENSORTAG_NOT_FOUND':
			displayValue("connectionButton1","Connect")
			changeButtonColour("connectionButton1","asellbrightgreen")
			sensortag1.connected = false;
			break;
		case 'SENSORTAG_ONLINE':
			displayValue("connectionButton1","Disconnect")
			changeButtonColour("connectionButton1","asellred")
			sensortag1.connected = true;
			break;	}
	displayValue('StatusData1', status)
}

function sensorErrorHandler(error)
{
	console.log('Error: ' + error)

	if (evothings.easyble.error.DISCONNECTED == error)
	{
		resetSensorDisplayValues(0)
		displayValue("connectionButton0","Retry")
		changeButtonColour("connectionButton0","asellbrightgreen")
		sensortag0.connected = false;
	}
	else
	{
		displayValue('StatusData1', 'Error: ' + error)
	}
}

function sensorErrorHandler1(error)
{
	console.log('Error: ' + error)

	if (evothings.easyble.error.DISCONNECTED == error)
	{
		resetSensorDisplayValues(1)
		displayValue("connectionButton1","Retry") 
		changeButtonColour("connectionButton1","asellbrightgreen")
		sensortag1.connected = false;
	}
	else
	{
		displayValue('StatusData1', 'Error: ' + error)
	}
}

/* 
* TCM For loooking up SensorTag Name from config file
*
*/
function lookUpSensortagMapping(systemID)
{
	//console.log("DEBUG - Looking up " + systemID + " in " + JSON.stringify(sensortagMappingData))
	if(sensortagMappingData && sensortagMappingData[systemID])
	{
		return sensortagMappingData[systemID]
	}
	else
	{
		return "Unnamed Tag"
	}
	
}

function resetSensorDisplayValues0()
{
	// Clear current values.
	var blank = '[Waiting for value]'
	displayValue('StatusData0', 'NOT CONNECTED')

	var sensors = ['Temperature','Humidity','Barometer','Accelerometer','Gyroscope','Magnetometer','Luxometer','Keypress'];
	for(var i=0 ;i<sensors.length;i++){ 
	    var sType = sensors[i]
		// Check if element exists and reset if neccessary
		var displayElement = document.getElementById(sType+"Data0")
		if(displayElement !== null)
			displayValue(sType+'Data0', blank)
	}
}

function resetSensorDisplayValues(id)
{
	var blank = '[Waiting for value]'
	displayValue('StatusData'+id, 'NOT CONNECTED')

	var sensors = ['Temperature','Humidity','Barometer','Accelerometer','Gyroscope','Magnetometer','Luxometer','Keypress'];
	for(var i=0 ;i<sensors.length;i++){ 
	    var sType = sensors[i]
		// Check if element exists and reset if neccessary
		var displayElement = document.getElementById(sType+"Data"+id)
		if(displayElement !== null)
			displayValue(sType+"Data"+id, blank)
	}
}

function keypressHandler(data)
{
	// Update background color.
	switch (data[0])
	{
		case 0:
			setBackgroundColor('white')
			break;
		case 1:
			setBackgroundColor('red')
			break;
		case 2:
			setBackgroundColor('blue')
			break;
		case 3:
			setBackgroundColor('magenta')
			break;
	}
	
	keypressDisplay(0, data[0])
}


function keypressHandler1(data)
{
	// Update background color.
	switch (data[0])
	{
		case 0:
			setBackgroundColor('white')
			break;
		case 1:
			setBackgroundColor('red')
			break;
		case 2:
			setBackgroundColor('blue')
			break;
		case 3:
			setBackgroundColor('magenta')
			break;
	}

	keypressDisplay(1, data[0])
}

function keypressDisplay(id, data)
{
	var sensors = ['Temperature','Humidity','Barometer','Accelerometer','Gyroscope','Magnetometer','Luxometer'];
	for(var i=0 ;i<sensors.length;i++){ 
	    var sType = sensors[i]
		//console.log("DEBUG - checking capture on click value for " + sType + id + " with keypress data " + data  + " and config values " + expConfigData.sensorTags[id].sensors[sType].captureOnClick + expConfigData.sensorTags[id].sensors[sType].grid.griddisplay)
		if(expConfigData.sensorTags[id].sensors[sType].captureOnClick == "on" || expConfigData.sensorTags[id].sensors[sType].grid.griddisplay == "on") 
		{
			captureOnClickValue[sType+id].flag = true;
			// If it is a grid, increment grid position by 1 only on key press or release (but not for frst cell)
			var gridElement = document.getElementById(sType+"Grid"+captureOnClickValue[sType+id].gridPosition)
			//console.log("DEBUG - CoC Keypress checking values are  " + gridElement +  ", " + data + ", " + captureOnClickValue[sType+id].firstcell)
			if(gridElement !== null && !data)
			{	
				console.log("DEBUG - CoC Keypress for " + sType + id + " with key value " + data + ". Values are " + JSON.stringify(captureOnClickValue[sType+id]))
				// For grid position 0 dont increment
				if (!captureOnClickValue[sType+id].firstcell)
				{
					captureOnClickValue[sType+id].gridPosition++;
					console.log("DEBUG - CoC Keypress incremented grid position to " + captureOnClickValue[sType+id].gridPosition)
				} 
				else
				{
					captureOnClickValue[sType+id].firstcell = false;
					console.log("DEBUG - CoC Keypress set flag to false, position is " + captureOnClickValue[sType+id].gridPosition)
				}
			}
		}
	}
}


function temperatureHandler(data)
{
	//console.log("Temp Handler 1 This: " + this.getDeviceModel())

	// Calculate temperature from raw sensor data.
	var values = sensortag0.getTemperatureValues(data)
	var ac = values.ambientTemperature
	var af = sensortag0.celsiusToFahrenheit(ac)
	var tc = values.targetTemperature
	var tf = sensortag0.celsiusToFahrenheit(tc)

	// Handle Data in common function for both temoerature handlers
	temperatureDisplay(0, values, ac, af,tc,tf)
}

function temperatureHandler1(data)
{
	// Calculate temperature from raw sensor data.
	var values = sensortag1.getTemperatureValues(data)
	var ac = values.ambientTemperature
	var af = sensortag1.celsiusToFahrenheit(ac)
	var tc = values.targetTemperature
	var tf = sensortag1.celsiusToFahrenheit(tc)

	temperatureDisplay(1, values, ac, af, tc, tf)
}

var temperatureDisplay = function(id,  values, ac, af,tc,tf)
{ 
	var sensorType = "Temperature"
	// Prepare the information to display.
	var IR = true; // Display IR and ambient by default
	var ambient = true;

	// Set display and storage values to false if not required
	if(expConfigData.sensorTags[id].sensors[sensorType].parameters.IR != "on")
		IR = false;
	if(expConfigData.sensorTags[id].sensors[sensorType].parameters.ambient != "on")
		ambient = false;

	/* 
	 * Display values only by default 
	 * Do not display if sensor has not been initialised (experimentSensorDisplay contains initialised senors)
	 * Do not display if captureOnClick is true or gridDisplay is true and the captureOnClick flag is not set
	 *
	 */	

	var displayValuesFlag = true;
	if(experimentSensorDisplay.indexOf(sensorType+id) == -1)
		displayValuesFlag = false;
	if ((expConfigData.sensorTags[id].sensors[sensorType].captureOnClick == "on" ||
		expConfigData.sensorTags[id].sensors[sensorType].grid.griddisplay == "on")
		&& !captureOnClickValue[sensorType+id].flag)
		displayValuesFlag = false;
		
	if(displayValuesFlag)
	{
		captureOnClickValue[sensorType+id].flag=false;

		// Update the value displayed depending on whether either or both temperatures are required
		var string = ""
		if(IR){
			string += (tc >= 0 ? '+' : '') + tc.toFixed(2) + '&deg; C ' +
			//	'(' + (tf >= 0 ? '+' : '') + tf.toFixed(2) + '&deg; F)' + '<br/>' 
				'[IR] <br/>'
		}
		if(ambient){
			string += (ac >= 0 ? '+' : '') + ac.toFixed(2) + '&deg; C ' +
			//	'(' + (af >= 0 ? '+' : '') + af.toFixed(2) + '&deg; F) [amb]' +  '<br/>'
				'[amb] <br/>'
		}

		displayValue(sensorType+'Data'+id, string)
		// Look if Grid element exists and write to it if it does
		var gridElement = document.getElementById(sensorType+"Grid"+captureOnClickValue[sensorType+id].gridPosition)
		//console.log("DEBUG - grid element is " +  gridElement)
		if(gridElement !== null)
		{
			displayValue(sensorType+"Grid"+captureOnClickValue[sensorType+id].gridPosition, string)
			equalHeight($(".widgetblock"));
		}
		
		
		// Prepare values to add to CSV file and graph
		// NOTE - based on implementation from web, can also inlcude check boxes etc to determine format etc
		//if(experimentSensorDisplay.indexOf(sensorType+id) != -1)
		//{
		currentSensorString = csvSensorData(sensorType+"_"+id, ac, tc);
		saveCSV(currentSensorString);
		//}

		// Prepare values for graphing if it is requires
		if(expConfigData.sensorTags[id].sensors[sensorType].graph.graphdisplay == "on" && graphDisplay[sensorType+id])
		{
			//console.log("DEBUG - setting up values for graphing if required for " + sensorType )
			var ctime = getTimeInMs();
			if (datapoints[sensorType].sensorStartTime[id] == -1)
					datapoints[sensorType].sensorStartTime[id] = ctime;
			var dt = (ctime - datapoints[sensorType].sensorStartTime[id])/1000;
			//console.log("DEBUG - Sensor Time for sensor " + sensorType + " and id " + id + " is " + dt)
		
			counter = datapoints[sensorType].counter[id]-1
			// Set x - value to time difference
			var xVal = dt.toFixed(2)
			//Overwrite x value with counter if captureOnClick
			if(expConfigData.sensorTags[id].sensors[sensorType].captureOnClick == "on")
			{
				xVal = datapoints[sensorType].counter[id]
			}
			datapoints[sensorType].x[id][counter] = { label: xVal, y: ac }
			datapoints[sensorType].y[id][counter] = { label: xVal, y: tc } 
			datapoints[sensorType].counter[id]++;
			
			//datapoints[sensorType].counter[id]++;datapoints.temperature.x[id][iNumTempCounter[id]-1] = { label: dt, y: ac }
			//datapoints.temperature.y[id][iNumTempCounter[id]-1] = { label: dt, y: tc } 
			//iNumTempCounter[id]++;
		
			var graphTitle = expConfigData.sensorTags[id].sensors[sensorType].graphTitle
			var graphType = expConfigData.sensorTags[id].sensors[sensorType].graphType
				if (graphType == null) graphType = "spline"
			var xAxisTitle = expConfigData.sensorTags[id].sensors[sensorType].graphXAxis
			var yAxisTitle = expConfigData.sensorTags[id].sensors[sensorType].graphYAxis
			
			//Check whether the Temperature is set to Ambient, IR or both
			
			if(IR&&ambient){
				showGraphicData(sensorType+id+"GraphCanvas", graphType, graphTitle, xAxisTitle, yAxisTitle, datapoints[sensorType].xmin, datapoints[sensorType].ymin, datapoints[sensorType].x[id], "Ambient Temperature (C)", datapoints[sensorType].y[id], "Target (IR) Temerature (C)");
			}else if (IR){
				showGraphicData(sensorType+id+"GraphCanvas", graphType, graphTitle, xAxisTitle, yAxisTitle, datapoints[sensorType].xmin, datapoints[sensorType].ymin,  datapoints[sensorType].y[id], "Target (IR) Temerature (C)");
			}else if (ambient){
				showGraphicData(sensorType+id+"GraphCanvas", graphType, graphTitle, xAxisTitle, yAxisTitle, datapoints[sensorType].xmin, datapoints[sensorType].ymin,  datapoints[sensorType].x[id], "Ambient Temperature (C)");
			}
		}
	}
}
 


function accelerometerHandler(data)
{
	// Calculate the x,y,z accelerometer values from raw data.
	var values = sensortag0.getAccelerometerValues(data)
	var x = values.x
	var y = values.y
	var z = values.z
	var comb = Math.sqrt(x*x+y*y+z*z)

	//var model = sensortag.getDeviceModel()
	//var dataOffset = (model == 2 ? 6 : 0)

	// Check whether all values, xyz or scalar values should be sent
	// Display all by default
	var xyz = true; 
	var scalar = true;


	//console.log("DEBUG - display for Accelerometer - will only process in sensor initialised: " + experimentSensorDisplay.indexOf("Accelerometer0"))
	if(experimentSensorDisplay.indexOf("Accelerometer0") != -1)
	{
		//console.log("DEBUG - Accelerometer parameters for id " + id + " are: " + JSON.stringify(expConfigData.sensorTags[id].sensors["Accelerometer"].parameters))
		// Set display and storage values to false if not required
		if(expConfigData.sensorTags[id].sensors.Accelerometer.parameters.xyz != "on")
			xyz = false;
		if(expConfigData.sensorTags[id].sensors.Accelerometer.parameters.scalar != "on")
			scalar = false;

		var stringXyz =
			'x: ' + (x >= 0 ? '+' : '') + x.toFixed(3) + 'G<br/>' +
			'y: ' + (y >= 0 ? '+' : '') + y.toFixed(3) + 'G<br/>' +
			'z: ' + (z >= 0 ? '+' : '') + z.toFixed(3) + 'G<br/>'
		var stringScalar =
		'a: ' + (comb >= 0 ? '+' : '') + comb.toFixed(3) + 'G<br/>'
		
		if(xyz && scalar)
		{
			xyzaDisplay(0,"Accelerometer",values, stringXyz+stringScalar, x,y,z, comb, x*g,y*g,z*g)
		}
		else if(xyz)
		{
			xyzDisplay(0,"Accelerometer",values, stringXyz, x,y,z, comb, x*g,y*g,z*g)
		}
		else if(scalar)
		{
			singleValDisplay(0,"Accelerometer", values, stringScalar, comb, "G")
		}
	}	
		
}

function accelerometerHandler1(data)
{
	// Calculate the x,y,z accelerometer values from raw data.
	var values = sensortag1.getAccelerometerValues(data)
	var x = values.x
	var y = values.y
	var z = values.z
	var comb = Math.sqrt(x*x+y*y+z*z)

	// Check whether all values, xyz or scalar values should be sent
	// Display all by default
	var xyz = true; 
	var scalar = true;

	//console.log("DEBUG - display for Accelerometer - will only process in sensor initialised: " + experimentSensorDisplay.indexOf("Accelerometer0"))
	if(experimentSensorDisplay.indexOf("Accelerometer1") != -1)
	{
		// Set display and storage values to false if not required
		if(expConfigData.sensorTags[id].sensors.Accelerometer.parameters.xyz != "on")
			xyz = false;
		if(expConfigData.sensorTags[id].sensors.Accelerometer.parameters.scalar != "on")
			scalar = false;

		var stringXyz =
			'x: ' + (x >= 0 ? '+' : '') + x.toFixed(3) + 'G<br/>' +
			'y: ' + (y >= 0 ? '+' : '') + y.toFixed(3) + 'G<br/>' +
			'z: ' + (z >= 0 ? '+' : '') + z.toFixed(3) + 'G<br/>'
		var stringScalar =
		'a: ' + (comb >= 0 ? '+' : '') + comb.toFixed(3) + 'G<br/>'
		
		if(xyz && scalar)
		{
			xyzaDisplay(1,"Accelerometer",values, stringXyz+stringScalar, x,y,z, comb, x*g,y*g,z*g)
		}
		else if(xyz)
		{
			xyzDisplay(1,"Accelerometer",values, stringXyz, x,y,z, comb, x*g,y*g,z*g)
		}
		else if(scalar)
		{
			singleValDisplay(1,"Accelerometer", values, stringScalar, comb, "G")
		}
	}
}




function humidityHandler(data)
{
	//console.log("DEBUG - Humisity Handler 0 with data " + JSON.stringify(data))
	// Calculate the humidity values from raw data.
	var values = sensortag0.getHumidityValues(data)

	// Calculate the humidity temperature (C and F).
	var tc = values.humidityTemperature
	var tf = sensortag0.celsiusToFahrenheit(tc)

	// Calculate the relative humidity.
	var h = values.relativeHumidity

	humidityDisplay(0,values, tc, tf, h)
}
 
function humidityHandler1(data)
{
	//console.log("DEBUG - Humidity Handler 1 with data " + JSON.stringify(data))
	// Calculate the humidity values from raw data.
	var values = sensortag1.getHumidityValues(data)

	// Calculate the humidity temperature (C and F).
	var tc = values.humidityTemperature
	var tf = sensortag0.celsiusToFahrenheit(tc)

	// Calculate the relative humidity.
	var h = values.relativeHumidity

	humidityDisplay(1,values, tc, tf, h)

}

var humidityDisplay = function(id,  values, tc, tf, h)
{ 
	var sensorType = "Humidity"
	// Prepare the information to display.
	string =
		//'raw: <span style="font-family: monospace;">0x' +
		//	bufferToHexStr(data, 0, 4) + '</span><br/>'
		(h >= 0 ? '+' : '') + h.toFixed(2) + '% RH' + '<br/>' + "(at " +
		(tc >= 0 ? '+' : '') +  tc.toFixed(2) + '&deg; C )<br/>'
	//console.log("DEBUG - Data to display for Humidity is " + string)
	
	/* 
	 * Display values only by default 
	 * Do not display if sensor has not been initialised (experimentSensorDisplay contains initialised senors)
	 * Do not display if captureOnClick is true or gridDisplay is true and the captureOnClick flag is not set
	 *
	 */	

	var displayValuesFlag = true;
	if(experimentSensorDisplay.indexOf(sensorType+id) == -1)
		displayValuesFlag = false;
	if ((expConfigData.sensorTags[id].sensors[sensorType].captureOnClick == "on" ||
		expConfigData.sensorTags[id].sensors[sensorType].grid.griddisplay == "on")
		&& !captureOnClickValue[sensorType+id].flag)
		displayValuesFlag = false;
		
	if(displayValuesFlag)
	{
		captureOnClickValue[sensorType+id].flag=false;
		// Update the value displayed.
		displayValue(sensorType+'Data'+id, string)
		var gridElement = document.getElementById(sensorType+"Grid"+captureOnClickValue[sensorType+id].gridPosition)
		//console.log("DEBUG - Looking for element " + sensorType+"Grid"+captureOnClickValue[sensorType+id].gridPosition + ". Grid element is " +  gridElement)
		if(gridElement !== null)
		{
			displayValue(sensorType+"Grid"+captureOnClickValue[sensorType+id].gridPosition, string)
			equalHeight($(".widgetblock"));
		}
		// Prepare values to add to CSV file
		// NOTE - based on implementation from web, can also inlcude check boxes etc to determine format etc
		//if(experimentSensorDisplay.indexOf(sensorType+id) != -1)
		//{
			currentSensorString = csvSensorData(sensorType+"_"+id, values, h, tc);
			saveCSV(currentSensorString);
		//}

		// Prepare values for graphing if it is requires
		if(expConfigData.sensorTags[id].sensors[sensorType].graph.graphdisplay == "on" && graphDisplay[sensorType+id])
		{
			var ctime = getTimeInMs();
			if (datapoints[sensorType].sensorStartTime[id] == -1)
					datapoints[sensorType].sensorStartTime[id] = ctime;
			var dt = (ctime - datapoints[sensorType].sensorStartTime[id])/1000;
			//console.log("DEBUG - Sensor Time for sensor " + sensorType + " and id " + id + " is " + dt)
		
			counter = datapoints[sensorType].counter[id]-1
			// Set x - value to time difference
			var xVal = dt.toFixed(2)
			//Overwrite x value with counter if captureOnClick
			if(expConfigData.sensorTags[id].sensors[sensorType].captureOnClick == "on")
			{
				xVal = datapoints[sensorType].counter[id]
			}
			datapoints[sensorType].x[id][counter] = { label: xVal, y: h }
			datapoints[sensorType].counter[id]++;
			
			//datapoints[sensorType].counter[id]++;datapoints.temperature.x[id][iNumTempCounter[id]-1] = { label: dt, y: ac }
			//datapoints.temperature.y[id][iNumTempCounter[id]-1] = { label: dt, y: tc } 
			//iNumTempCounter[id]++;
		
			var graphTitle = expConfigData.sensorTags[id].sensors[sensorType].graphTitle
			var graphType = expConfigData.sensorTags[id].sensors[sensorType].graphType
				if (graphType == null) graphType = "spline"
			var xAxisTitle = expConfigData.sensorTags[id].sensors[sensorType].graphXAxis
			var yAxisTitle = expConfigData.sensorTags[id].sensors[sensorType].graphYAxis
			showGraphicData(sensorType+id+"GraphCanvas", graphType, graphTitle, xAxisTitle, yAxisTitle, datapoints[sensorType].xmin, datapoints[sensorType].ymin,  datapoints[sensorType].x[id], "Relative Humidity");
		}
	}
}

function magnetometerHandler(data)
{
	// Calculate the magnetometer values from raw sensor data.
	var values = sensortag0.getMagnetometerValues(data)
	var x = values.x
	var y = values.y
	var z = values.z
	var comb = Math.sqrt(x*x+y*y+z*z)

	// Check whether all values, xyz or scalar values should be sent
	// Display all by default
	var xyz = true; 
	var scalar = true;

	//console.log("DEBUG - display for magnetometer - will only process in sensor initialised: " + experimentSensorDisplay.indexOf("Magnetometer0"))
	if(experimentSensorDisplay.indexOf("Magnetometer0") != -1)
	{
		// Set display and storage values to false if not required
		//console.log("DEBUG - Mag parameters are: " + JSON.stringify(expConfigData.sensorTags[id].sensors.Magnetometer.parameters))
		if(expConfigData.sensorTags[id].sensors.Magnetometer.parameters.xyz != "on")
			xyz = false;
		if(expConfigData.sensorTags[id].sensors.Magnetometer.parameters.scalar != "on")
			scalar = false;

		var stringXyz =
			'x: ' + (x >= 0 ? '+' : '') + x.toFixed(3) + ' &micro;T <br/>' +
			'y: ' + (y >= 0 ? '+' : '') + y.toFixed(3) + ' &micro;T <br/>' +
			'z: ' + (z >= 0 ? '+' : '') + z.toFixed(3) + ' &micro;T <br/>' 
		var stringScalar =
			'm: ' + (comb >= 0 ? '+' : '') + comb.toFixed(3) + ' &micro;T <br/>' 
		
		if(xyz && scalar)
		{
			xyzaDisplay(0,"Magnetometer",values, stringXyz+stringScalar, x,y,z, comb)
		}
		else if(xyz)
		{
			xyzDisplay(0,"Magnetometer",values, stringXyz, x,y,z, comb)
		}
		else if(scalar)
		{
			singleValDisplay(0,"Magnetometer", values, stringScalar, comb, "&micro;T")
		}
	}	
		
	//var model = sensortag0.getDeviceModel()
	//var dataOffset = (model == 2 ? 12 : 0)

	
	//xyzaDisplay(0,"Magnetometer",values, stringMag, x,y,z, comb)
}

function magnetometerHandler1(data)
{
	// Calculate the magnetometer values from raw sensor data.
	var values = sensortag1.getMagnetometerValues(data)
	var x = values.x
	var y = values.y
	var z = values.z
	var comb = Math.sqrt(x*x+y*y+z*z)

	// Check whether all values, xyz or scalar values should be sent
	// Display all by default
	var xyz = true; 
	var scalar = true;

	//console.log("DEBUG - display for magnetometer - will only process in sensor initialised: " + experimentSensorDisplay.indexOf("Magnetometer0"))
	if(experimentSensorDisplay.indexOf("Magnetometer1") != -1)
	{
		// Set display and storage values to false if not required
		if(expConfigData.sensorTags[id].sensors["Magnetometer"].parameters.xyz != "on")
			xyz = false;
		if(expConfigData.sensorTags[id].sensors.Magnetometer.parameters.scalar != "on")
			scalar = false;

		var stringXyz =
			'x: ' + (x >= 0 ? '+' : '') + x.toFixed(3) + ' &micro;T <br/>' +
			'y: ' + (y >= 0 ? '+' : '') + y.toFixed(3) + ' &micro;T <br/>' +
			'z: ' + (z >= 0 ? '+' : '') + z.toFixed(3) + ' &micro;T <br/>' 
		var stringScalar =
			'm: ' + (comb >= 0 ? '+' : '') + comb.toFixed(3) + ' &micro;T <br/>' 
		
		if(xyz && scalar)
		{
			xyzaDisplay(1,"Magnetometer",values, stringXyz+stringScalar, x,y,z, comb)
		}
		else if(xyz)
		{
			xyzDisplay(1,"Magnetometer",values, stringXyz, x,y,z, comb)
		}
		else if(scalar)
		{
			singleValDisplay(1,"Magnetometer", values, stringScalar, comb, "&micro;T")
		}
	}	

}

function barometerHandler(data)
{
	// Calculate pressure from raw sensor data.
	var values = sensortag0.getBarometerValues(data)
	var pressure = values.pressure

	barometerDisplay(0,values, pressure)

}

function barometerHandler1(data)
{
	// Calculate pressure from raw sensor data.
	var values = sensortag1.getBarometerValues(data)
	var pressure = values.pressure

	barometerDisplay(1, values, pressure)
}

var barometerDisplay = function(id,  values, pressure)
{ 
	var sensorType = "Barometer"
	// Prepare the information to display.
	string =
		//'raw: <span style="font-family: monospace;">0x' +
		//	bufferToHexStr(data, 0, 4) + '</span><br/>' +
		//'Pressure: ' + 
		pressure.toPrecision(6) + ' hPa<br/>'

	/* 
	 * Display values only by default 
	 * Do not display if sensor has not been initialised (experimentSensorDisplay contains initialised senors)
	 * Do not display if captureOnClick is true or gridDisplay is true and the captureOnClick flag is not set
	 *
	 */	

	var displayValuesFlag = true;
	if(experimentSensorDisplay.indexOf(sensorType+id) == -1)
		displayValuesFlag = false;
	if ((expConfigData.sensorTags[id].sensors[sensorType].captureOnClick == "on" ||
		expConfigData.sensorTags[id].sensors[sensorType].grid.griddisplay == "on")
		&& !captureOnClickValue[sensorType+id].flag)
		displayValuesFlag = false;
		
	if(displayValuesFlag)
	{
		captureOnClickValue[sensorType+id].flag=false;
		displayValue(sensorType+'Data'+id, string)
		var gridElement = document.getElementById(sensorType+"Grid"+captureOnClickValue[sensorType+id].gridPosition)
		//console.log("DEBUG - Looking for element " + sensorType+"Grid"+captureOnClickValue[sensorType+id].gridPosition + ". Grid element is " +  gridElement)
		if(gridElement !== null)
		{
			displayValue(sensorType+"Grid"+captureOnClickValue[sensorType+id].gridPosition, string)
			equalHeight($(".widgetblock"));
		}	
		// Prepare values to add to CSV file
		// NOTE - based on implementation from web, can also inlcude check boxes etc to determine format etc
		//if(experimentSensorDisplay.indexOf(sensorType+id) != -1)
		//{
			currentSensorString = csvSensorData(sensorType+"_"+id, values, pressure);
			saveCSV(currentSensorString);
		//}

		// Prepare values for graphing if it is requires
		if(expConfigData.sensorTags[id].sensors[sensorType].graph.graphdisplay== "on" && graphDisplay[sensorType+id])
		{
			var ctime = getTimeInMs();
			if (datapoints[sensorType].sensorStartTime[id] == -1)
					datapoints[sensorType].sensorStartTime[id] = ctime;
			var dt = (ctime - datapoints[sensorType].sensorStartTime[id])/1000;
			//console.log("DEBUime for sensor " + sensorType + " and id " + id + " is " + dt)
		
			counter = datapoints[sensorType].counter[id]-1
			// Set x - value to time difference
			var xVal = dt.toFixed(2)
			//Overwrite x value with counter if captureOnClick
			if(expConfigData.sensorTags[id].sensors[sensorType].captureOnClick == "on")
			{
				xVal = datapoints[sensorType].counter[id]
			}
			datapoints[sensorType].x[id][counter] = { label: xVal, y: pressure }
			datapoints[sensorType].counter[id]++;
		
			var graphTitle = expConfigData.sensorTags[id].sensors[sensorType].graphTitle
			var graphType = expConfigData.sensorTags[id].sensors[sensorType].graphType
				if (graphType == null) graphType = "spline"
			var xAxisTitle = expConfigData.sensorTags[id].sensors[sensorType].graphXAxis
			var yAxisTitle = expConfigData.sensorTags[id].sensors[sensorType].graphYAxis
			// Set x-intercept to 700 for Barometer
			var ymin = 900;
			var xmin = datapoints[sensorType].xmin;
			//console.log("DEBUG - Barometer parameters " + xmin + " and " + ymin)
			showGraphicData(sensorType+id+"GraphCanvas", graphType, graphTitle, xAxisTitle, yAxisTitle, xmin, ymin,  datapoints[sensorType].x[id], "Pressure (hPa)");
		}
	}
}

function gyroscopeHandler(data)
{
	// Calculate the gyroscope values from raw sensor data.
	var values = sensortag0.getGyroscopeValues(data)
	var x = values.x
	var y = values.y
	var z = values.z

	// Prepare the information to display.
	string =
		//'raw: <span style="font-family: monospace;">0x' +
		//	bufferToHexStr(data, 0, 6) + '</span><br/>' +
		'x: ' + (x >= 0 ? '+' : '') + x.toFixed(5) + '<br/>' +
		'y: ' + (y >= 0 ? '+' : '') + y.toFixed(5) + '<br/>' +
		'z: ' + (z >= 0 ? '+' : '') + z.toFixed(5) + '<br/>'

	xyzDisplay(0,"Gyroscope", values, string, x,y,z);
}

function gyroscopeHandler1(data)
{
	// Calculate the gyroscope values from raw sensor data.
	var values = sensortag1.getGyroscopeValues(data)
	var x = values.x
	var y = values.y
	var z = values.z

	// Prepare the information to display.
	string =
		//'raw: <span style="font-family: monospace;">0x' +
		//	bufferToHexStr(data, 0, 6) + '</span><br/>' +
		'x: ' + (x >= 0 ? '+' : '') + x.toFixed(5) + '<br/>' +
		'y: ' + (y >= 0 ? '+' : '') + y.toFixed(5) + '<br/>' +
		'z: ' + (z >= 0 ? '+' : '') + z.toFixed(5) + '<br/>'

	xyzDisplay(1,"Gyroscope", values, string, x,y,z);
}

function luxometerHandler(data)
{
	var value = sensortag0.getLuxometerValue(data)

	luxDisplay(0, data, value)


}

function luxometerHandler1(data)
{
	var value = sensortag1.getLuxometerValue(data)
	luxDisplay(1, data, value)
}

var luxDisplay = function(id,  values, lux)
{ 
	var sensorType = "Luxometer"
	// Prepare the information to display.
	string =
		//'raw: <span style="font-family: monospace;">0x' +
		//	bufferToHexStr(data, 0, 2) + '</span><br/>' +
		//'Light level: ' + 
		lux.toPrecision(5) + ' lux<br/>'

	/* 
	 * Display values only by default 
	 * Do not display if sensor has not been initialised (experimentSensorDisplay contains initialised senors)
	 * Do not display if captureOnClick is true or gridDisplay is true and the captureOnClick flag is not set
	 *
	 */	 
	var displayValuesFlag = true;
	if(experimentSensorDisplay.indexOf(sensorType+id) == -1)
		displayValuesFlag = false;
	if ((expConfigData.sensorTags[id].sensors[sensorType].captureOnClick == "on" ||
		expConfigData.sensorTags[id].sensors[sensorType].grid.griddisplay == "on")
		&& !captureOnClickValue[sensorType+id].flag)
		displayValuesFlag = false;
		
	if(displayValuesFlag)
	{
		captureOnClickValue[sensorType+id].flag=false;
		// Update the value displayed.
		displayValue(sensorType+'Data'+id, string)
		// Update it in the grid if applicable
		var gridElement = document.getElementById(sensorType+"Grid"+captureOnClickValue[sensorType+id].gridPosition)
		//console.log("DEBUG - Looking for element " + sensorType+"Grid"+captureOnClickValue[sensorType+id].gridPosition + ". Grid element is " +  gridElement)
		if(gridElement !== null)
		{
			displayValue(sensorType+"Grid"+captureOnClickValue[sensorType+id].gridPosition, string)
			equalHeight($(".widgetblock"));
		}
		
		// Prepare values to add to CSV file
		// NOTE - based on implementation from web, can also inlcude check boxes etc to determine format etc
		//if(experimentSensorDisplay.indexOf(sensorType+id) != -1)
		//{
			currentSensorString = csvSensorData(sensorType+"_"+id, values, lux);
			saveCSV(currentSensorString);
		//}

		// Prepare values for graphing if it is requires
		if(expConfigData.sensorTags[id].sensors[sensorType].graph.graphdisplay== "on" && graphDisplay[sensorType+id])
		{
			var ctime = getTimeInMs();
			if (datapoints[sensorType].sensorStartTime[id] == -1)
					datapoints[sensorType].sensorStartTime[id] = ctime;
			var dt = (ctime - datapoints[sensorType].sensorStartTime[id])/1000;
			//console.log("DEBUG - Sensor Time for sensor " + sensorType + " and id " + id + " is " + dt)
		
			counter = datapoints[sensorType].counter[id]-1
			// Set x - value to time difference
			var xVal = dt.toFixed(2)
			//Overwrite x value with counter if captureOnClick
			if(expConfigData.sensorTags[id].sensors[sensorType].captureOnClick == "on")
			{
				xVal = datapoints[sensorType].counter[id]
			}
			datapoints[sensorType].x[id][counter] = { label: xVal, y: lux }
			datapoints[sensorType].counter[id]++;
		
			var graphTitle = expConfigData.sensorTags[id].sensors[sensorType].graphTitle
			var graphType = expConfigData.sensorTags[id].sensors[sensorType].graphType
				if (graphType == null) graphType = "spline"
			var xAxisTitle = expConfigData.sensorTags[id].sensors[sensorType].graphXAxis
			var yAxisTitle = expConfigData.sensorTags[id].sensors[sensorType].graphYAxis
			showGraphicData(sensorType+id+"GraphCanvas", graphType, graphTitle, xAxisTitle,yAxisTitle, datapoints[sensorType].xmin, datapoints[sensorType].ymin,datapoints[sensorType].x[id], "Lux");
		}
	}
}

var singleValDisplay = function(id, sensorType, values, string, data, units)
{ 
	// Prepare the information to display.
	//string =
	//	data.toPrecision(3) + ' ' + units + '<br/>'

	/* 
	 * Display values only by default 
	 * Do not display if sensor has not been initialised (experimentSensorDisplay contains initialised senors)
	 * Do not display if captureOnClick is true or gridDisplay is true and the captureOnClick flag is not set
	 *
	 */	 
	var displayValuesFlag = true;
	if(experimentSensorDisplay.indexOf(sensorType+id) == -1)
		displayValuesFlag = false;
	if ((expConfigData.sensorTags[id].sensors[sensorType].captureOnClick == "on" ||
		expConfigData.sensorTags[id].sensors[sensorType].grid.griddisplay == "on")
		&& !captureOnClickValue[sensorType+id].flag)
		displayValuesFlag = false;
		
	if(displayValuesFlag)
	{
		captureOnClickValue[sensorType+id].flag=false;
		// Update the value displayed.
		displayValue(sensorType+'Data'+id, string)
		// Update it in the grid if applicable
		var gridElement = document.getElementById(sensorType+"Grid"+captureOnClickValue[sensorType+id].gridPosition)
		//console.log("DEBUG - Looking for element " + sensorType+"Grid"+captureOnClickValue[sensorType+id].gridPosition + ". Grid element is " +  gridElement)
		if(gridElement !== null)
		{
			displayValue(sensorType+"Grid"+captureOnClickValue[sensorType+id].gridPosition, string)
			equalHeight($(".widgetblock"));
		}
		
		currentSensorString = csvSensorData(sensorType+"_"+id, values, data);
		saveCSV(currentSensorString);

		// Prepare values for graphing if it is requires
		if(expConfigData.sensorTags[id].sensors[sensorType].graph.graphdisplay== "on" && graphDisplay[sensorType+id])
		{
			var ctime = getTimeInMs();
			if (datapoints[sensorType].sensorStartTime[id] == -1)
					datapoints[sensorType].sensorStartTime[id] = ctime;
			var dt = (ctime - datapoints[sensorType].sensorStartTime[id])/1000;
			//console.log("DEBUG - Sensor Time for sensor " + sensorType + " and id " + id + " is " + dt)
		
			counter = datapoints[sensorType].counter[id]-1
			// Set x - value to time difference
			var xVal = dt.toFixed(2)
			//Overwrite x value with counter if captureOnClick
			if(expConfigData.sensorTags[id].sensors[sensorType].captureOnClick == "on")
			{
				xVal = datapoints[sensorType].counter[id]
			}
			datapoints[sensorType].x[id][counter] = { label: xVal, y: data }
			datapoints[sensorType].counter[id]++;
		
			var graphTitle = expConfigData.sensorTags[id].sensors[sensorType].graphTitle
			var graphType = expConfigData.sensorTags[id].sensors[sensorType].graphType
				if (graphType == null) graphType = "spline"
			var xAxisTitle = expConfigData.sensorTags[id].sensors[sensorType].graphXAxis
			var yAxisTitle = expConfigData.sensorTags[id].sensors[sensorType].graphYAxis
			showGraphicData(sensorType+id+"GraphCanvas", graphType, graphTitle, xAxisTitle,yAxisTitle, datapoints[sensorType].xmin,datapoints[sensorType].ymin, datapoints[sensorType].x[id], units);
		}
	}
}


var xyzDisplay = function(id, sensorType, values , string, x, y,z, data1,data2,data3)
{ 
	// Prepare the information to display.
	/*string =
		//'raw: <span style="font-family: monospace;">0x' +
		//	bufferToHexStr(data, dataOffset, 6) + '</span><br/>' +
		'x: ' + (x >= 0 ? '+' : '') + x.toFixed(5) + 'G<br/>' +
		'y: ' + (y >= 0 ? '+' : '') + y.toFixed(5) + 'G<br/>' +
		'z: ' + (z >= 0 ? '+' : '') + z.toFixed(5) + 'G<br/>'
*/

	/* 
	 * Display values only by default 
	 * Do not display if sensor has not been initialised (experimentSensorDisplay contains initialised senors)
	 * Do not display if captureOnClick is true or gridDisplay is true and the captureOnClick flag is not set
	 *
	 */	 
	//console.log("DEBUG - Xyz display with arguments " + JSON.stringify(arguments))
	var displayValuesFlag = true;
	if(experimentSensorDisplay.indexOf(sensorType+id) == -1)
		displayValuesFlag = false;
	if ((expConfigData.sensorTags[id].sensors[sensorType].captureOnClick == "on" ||
		expConfigData.sensorTags[id].sensors[sensorType].grid.griddisplay == "on")
		&& !captureOnClickValue[sensorType+id].flag)
		displayValuesFlag = false;
		
	//console.log("DEBUG - display values flag is " + displayValuesFlag + " for " + sensorType)
	//if(expConfigData.sensorTags[id].sensors[sensorType].captureOnClick != "on" || 
	//	((expConfigData.sensorTags[id].sensors[sensorType].captureOnClick == "on" || expConfigData.sensorTags[id].sensors[sensorType].grid.griddisplay == "on") 
	//		&& captureOnClickValue[sensorType+id]) ) 
	if(displayValuesFlag)
	{
		captureOnClickValue[sensorType+id].flag=false;
		// Update the value displayed
		displayValue(sensorType+'Data'+id, string)
		// Update it in the grid if applicable
		var gridElement = document.getElementById(sensorType+"Grid"+captureOnClickValue[sensorType+id].gridPosition)
		//console.log("DEBUG - Looking for element " + sensorType+"Grid"+captureOnClickValue[sensorType+id].gridPosition + ". Grid element is " +  gridElement)
		if(gridElement !== null)
		{
			displayValue(sensorType+"Grid"+captureOnClickValue[sensorType+id].gridPosition, string)
			equalHeight($(".widgetblock"));
		}
 
		// Prepare values to add to CSV file
		// experimentSensorDisplay contains all the initialised sensors
		// NOTE - based on implementation from web, can also inlcude check boxes etc to determine format etc
		//if(experimentSensorDisplay.indexOf(sensorType+id) != -1)
		//{
			if (data1 != null)
			{
				var extradata = data1
				if (data2 != null)
				{
					extradata += "," + data2
					if(data3 != null)
					{
						extradata += "," + data2
					}
				}
			}
			currentSensorString = csvSensorData(sensorType + "_" + id, values, x, y, z,extradata);
			saveCSV(currentSensorString);
		//}

		//console.log("DEBUG - Values for displaying graphs are: " + expConfigData.sensorTags[id].sensors["Accelerometer"].graph + " and " + graphDisplay["Accelerometer"+id])
		// Prepare values for graphing if it is requires
		if(expConfigData.sensorTags[id].sensors[sensorType].graph.graphdisplay== "on" && graphDisplay[sensorType+id])
		{
			var ctime = getTimeInMs();
			if (datapoints[sensorType].sensorStartTime[id] == -1)
					datapoints[sensorType].sensorStartTime[id] = ctime;
			var dt = (ctime - datapoints[sensorType].sensorStartTime[id])/1000;
			//console.log("DEBUG - Sensor Time for sensor " + sensorType + " and id " + id + " is " + dt)
		
			
			counter = datapoints[sensorType].counter[id]-1
			// Set x - value to time difference
			var xVal = dt.toFixed(2)
			//Overwrite x value with counter if captureOnClick
			if(expConfigData.sensorTags[id].sensors[sensorType].captureOnClick == "on")
			{
				xVal = datapoints[sensorType].counter[id]
			}
			datapoints[sensorType].x[id][counter] = { label: xVal, y: x }
			datapoints[sensorType].y[id][counter] = { label: xVal, y: y } 
			datapoints[sensorType].z[id][counter] = { label: xVal, y: z }
			datapoints[sensorType].counter[id]++; 
		
			//console.log("Debug - data stored is: " + JSON.stringify(datapoints.temperature.tc[id]));

			var graphTitle = expConfigData.sensorTags[id].sensors[sensorType].graphTitle
			var graphType = expConfigData.sensorTags[id].sensors[sensorType].graphType
				if (graphType == null) graphType = "spline"
			var xAxisTitle = expConfigData.sensorTags[id].sensors[sensorType].graphXAxis
			var yAxisTitle = expConfigData.sensorTags[id].sensors[sensorType].graphYAxis
			showGraphicData(sensorType+id+"GraphCanvas", graphType, graphTitle, xAxisTitle, yAxisTitle, datapoints[sensorType].xmin, datapoints[sensorType].ymin,  datapoints[sensorType].x[id], "X", datapoints[sensorType].y[id], "Y", datapoints[sensorType].z[id], "Z");
		}
	}
}

var xyzaDisplay = function(id, sensorType, values ,string,  x, y,z, a, data1,data2,data3)
{ 
	
	/* 
	 * Display values only by default 
	 * Do not display if sensor has not been initialised (experimentSensorDisplay contains initialised senors)
	 * Do not display if captureOnClick is true or gridDisplay is true and the captureOnClick flag is not set
	 *
	 */	

	var displayValuesFlag = true;
	if(experimentSensorDisplay.indexOf(sensorType+id) == -1)
		displayValuesFlag = false;
	if ((expConfigData.sensorTags[id].sensors[sensorType].captureOnClick == "on" ||
		expConfigData.sensorTags[id].sensors[sensorType].grid.griddisplay == "on")
		&& !captureOnClickValue[sensorType+id].flag)
		displayValuesFlag = false;
	
	if(displayValuesFlag)
	{
		captureOnClickValue[sensorType+id].flag=false;
		// Update the value displayed.
		displayValue(sensorType+'Data'+id, string)
		//console.log("DEBUG - A value for " + sensorType + " and id " + id + " is " + a)
		var gridElement = document.getElementById(sensorType+"Grid"+captureOnClickValue[sensorType+id].gridPosition)
		//console.log("DEBUG - Looking for element " + sensorType+"Grid"+captureOnClickValue[sensorType+id].gridPosition + ". Grid element is " +  gridElement)
		if(gridElement !== null)
		{
			displayValue(sensorType+"Grid"+captureOnClickValue[sensorType+id].gridPosition, string)
			equalHeight($(".widgetblock"));
		}
		
		// Prepare values to add to CSV file
		// NOTE - based on implementation from web, can also inlcude check boxes etc to determine format etc
		if (data1 != null)
		{
			var extradata = data1
			if (data2 != null)
			{
				extradata += "," + data2
				if(data3 != null)
				{
					extradata += "," + data2
				}
			}
		}
		currentSensorString = csvSensorData(sensorType + "_" + id, values, x, y, z, a, extradata);
		saveCSV(currentSensorString);

		//console.log("DEBUG - Values for diaplying graphs are: " + expConfigData.sensorTags[id].sensors["Accelerometer"].graph + " and " + graphDisplay["Accelerometer"+id])
		// Prepare values for graphing if it is requires
		if(expConfigData.sensorTags[id].sensors[sensorType].graph.graphdisplay== "on" && graphDisplay[sensorType+id])
		{
			var ctime = getTimeInMs();
			if (datapoints[sensorType].sensorStartTime[id] == -1)
					datapoints[sensorType].sensorStartTime[id] = ctime;
			var dt = (ctime - datapoints[sensorType].sensorStartTime[id])/1000;
			//console.log("DEBUG - Sensor Time for sensor " + sensorType + " and id " + id + " is " + dt)
		
			
			counter = datapoints[sensorType].counter[id]-1
			// Set x - value to time difference
			var xVal = dt.toFixed(2)
			//Overwrite x value with counter if captureOnClick
			if(expConfigData.sensorTags[id].sensors[sensorType].captureOnClick == "on")
			{
				xVal = datapoints[sensorType].counter[id]
			}
			datapoints[sensorType].x[id][counter] = { label: xVal, y: x }
			datapoints[sensorType].y[id][counter] = { label: xVal, y: y } 
			datapoints[sensorType].z[id][counter] = { label: xVal, y: z }
			datapoints[sensorType].a[id][counter] = { label: xVal, y: a }
			datapoints[sensorType].counter[id]++;
		
			//console.log("Debug - data stored is: " + JSON.stringify(datapoints.temperature.tc[id]));

			var graphTitle = expConfigData.sensorTags[id].sensors[sensorType].graphTitle
			var graphType = expConfigData.sensorTags[id].sensors[sensorType].graphType
				if (graphType == null) graphType = "spline"
			var xAxisTitle = expConfigData.sensorTags[id].sensors[sensorType].graphXAxis
			var yAxisTitle = expConfigData.sensorTags[id].sensors[sensorType].graphYAxis
			showGraphicData(sensorType+id+"GraphCanvas", graphType, graphTitle, xAxisTitle, yAxisTitle, datapoints[sensorType].xmin, datapoints[sensorType].ymin,  datapoints[sensorType].x[id], "X", datapoints[sensorType].y[id], "Y", datapoints[sensorType].z[id], "Z", datapoints[sensorType].a[id], "Scalar Value");
		}
	}
}

var accelerometerDisplay = function(id, values, x, y,z, a)
{ 
	// Prepare the information to display.
	string =
		//'raw: <span style="font-family: monospace;">0x' +
		//	bufferToHexStr(data, dataOffset, 6) + '</span><br/>' +
		'x: ' + (x >= 0 ? '+' : '') + x.toFixed(5) + 'G<br/>' +
		'y: ' + (y >= 0 ? '+' : '') + y.toFixed(5) + 'G<br/>' +
		'z: ' + (z >= 0 ? '+' : '') + z.toFixed(5) + 'G<br/>' +
		'a: ' + (a >= 0 ? '+' : '') + a.toFixed(5) + 'G<br/>' +

	// Update the value displayed.
	displayValue('AccelerometerData'+id, string)
	
	// Prepare values to add to CSV file
	// NOTE - based on implementation from web, can also inlcude check boxes etc to determine format etc
	if(experimentSensorDisplay.indexOf("Accelerometer"+id) != -1)
	{
		currentSensorString = csvSensorData("Acc_1", data, x, y, z, a, x*g, y*g, z*g);
		saveCSV(currentSensorString);
	}

	//console.log("DEBUG - Values for diaplying graphs are: " + expConfigData.sensorTags[id].sensors["Accelerometer"].graph + " and " + graphDisplay["Accelerometer"+id])
	// Prepare values for graphing if it is requires
	if(expConfigData.sensorTags[id].sensors["Accelerometer"].graph == "on" && graphDisplay["Accelerometer"+id])
	{
		var ctime = getTimeInMs();
		if (datapoints[sensorType].sensorStartTime[id] == -1)
				datapoints[sensorType].sensorStartTime[id] = ctime;
		var dt = (ctime - datapoints[sensorType].sensorStartTime[id])/1000;
		//console.log("DEBUG - Sensor Time for sensor " + sensorType + " and id " + id + " is " + dt)
	
		datapoints.accelerometer.x[id][iNumAccelCounter[id]-1] = { label: dt, y: x }
		datapoints.accelerometer.y[id][iNumAccelCounter[id]-1] = { label: dt, y: y } 
		datapoints.accelerometer.z[id][iNumAccelCounter[id]-1] = { label: dt, y: z }
		iNumAccelCounter[id]++;
	
		//console.log("Debug - data stored is: " + JSON.stringify(datapoints.temperature.tc[id]));

		var graphTitle = expConfigData.sensorTags[id].sensors["Accelerometer"].graphTitle
		var graphType = expConfigData.sensorTags[id].sensors[sensorType].graphType
			if (graphType == null) graphType = "spline"
		var xAxisTitle = expConfigData.sensorTags[id].sensors["Accelerometer"].graphXAxis
		var yAxisTitle = expConfigData.sensorTags[id].sensors["Accelerometer"].graphYAxis
		showGraphicData("Accelerometer"+id+"GraphCanvas",graphType,graphTitle, xAxisTitle, yAxisTitle, datapoints[sensorType].xmin, datapoints[sensorType].ymin,  datapoints.accelerometer.x[id], "Acceleration x-axis", datapoints.accelerometer.y[id], "Acceleration y-axis", datapoints.accelerometer.z[id], "Acceleration z-axis");
	}
}


function displayValue(elementId, value)
{
	//console.log("DEBUG - Displaying value for " + elementId)
	document.getElementById(elementId).innerHTML = value
}

function changeButtonColour(elementId, value)
{
	document.getElementById(elementId).className= value;
}

function setBackgroundColor(color)
{
	document.documentElement.style.background = color
	document.body.style.background = color
}

/**
 * Convert byte buffer to hex string.
 * @param buffer - an Uint8Array
 * @param offset - byte offset
 * @param numBytes - number of bytes to read
 * @return string with hex representation of bytes
 */
function bufferToHexStr(buffer, offset, numBytes)
{
	var hex = ''
	for (var i = 0; i < numBytes; ++i)
	{
		hex += byteToHexStr(buffer[offset + i])
	}
	return hex
}

/**
 * Convert byte number to hex string.
 */
function byteToHexStr(d)
{
	if (d < 0) { d = 0xFF + d + 1 }
	var hex = Number(d).toString(16)
	var padding = 2
	while (hex.length < padding)
	{
		hex = '0' + hex
	}
	return hex
}

document.addEventListener(
	'deviceready',
	function() { evothings.scriptsLoaded(initialiseSensorTag) },
	false)
