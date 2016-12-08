/*
 * SnapLabsGraphDataApp.js
 * Contains the functions and logic for NERLD Gen 2 app for both the teacher and student functionality
 * This file contains all the functions realted to the Data and Graphing functions from dataStorageGraphing
 */
 
snaplabs.display = {} // Functions related to the logif of displaying graphs and data
datapoints = {}
datapoints.initialised = false;
snaplabs.graph = {}
snaplabs.data = {}
snaplabs.captureOnClick = {}
snaplabs.captureOnClick.value = [] // variable to store values for each sensor configured as capture on click showing whether the
snaplabs.captureOnClick.initialised = false;
snaplabs.graph.graphDisplay = new Array()  // variable storing whether graph is currently displaying ot not
var g = 9.81

// var experimentSensorDisplay = []  replaces by : snaplabs.experimentconfig.experimentSensortags[id].sensors

/*
* temperatureDisplay
* Get and manage the tempreture vlaue dsplay
*/

snaplabs.display.temperatureDisplay = function(id,  ac, af,tc,tf)
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

	//console.log("DEBUG - Display IR " + IR + ", and Ambient " + ambient + " for ID " + sensorType+id)
	/* 
	 * Display values only by default 
	 * Do not display if sensor has not been initialised (snaplabs.experimentconfig.experimentSensortags contains initialised senors)
	 * Do not display if captureOnClick is true or gridDisplay is true and the captureOnClick flag is not set
	 *
	 */	

		var displayValuesFlag = true;
	if(snaplabs.experimentconfig.experimentSensortags[id].sensors.indexOf(sensorType) == -1)
		displayValuesFlag = false;
	if ((expConfigData.sensorTags[id].sensors[sensorType].captureOnClick == "on" ||
		expConfigData.sensorTags[id].sensors[sensorType].grid.griddisplay == "on")
		&& !snaplabs.captureOnClick.value[sensorType+id].flag)
		displayValuesFlag = false;
		
	if(displayValuesFlag)
	{
		snaplabs.captureOnClick.value[sensorType+id].flag=false;

		// Update the value displayed depending on whether either or both temperatures are required
		var string = ""
		if(IR){
			string += (tc >= 0 ? '+' : '') + tc.toFixed(2) + '&deg; C ' +
				'[IR] <br/>'
		}
		if(ambient){
			string += (ac >= 0 ? '+' : '') + ac.toFixed(2) + '&deg; C ' +
				'[amb] <br/>'
		}

		snaplabs.ui.displayValue(sensorType+'Data'+id, string)
		// Look if Grid element exists and write to it if it does
		var gridElement = document.getElementById(sensorType+"Grid"+snaplabs.captureOnClick.value[sensorType+id].gridPosition)
		//console.log("DEBUG - grid element is " +  gridElement)
		if(gridElement !== null)
		{
			snaplabs.ui.snaplabs.ui.displayValue(sensorType+"Grid"+snaplabs.captureOnClick.value[sensorType+id].gridPosition, string)
			equalHeight($(".widgetblock"));
		}
		
		// Prepare values to add to CSV file and graph
		//currentSensorString = csvSensorData(sensorType+"_"+id, ac, tc);
		//snaplabs.file.saveCSV(currentSensorString);

		// Prepare values for graphing if it is requires
		if(expConfigData.sensorTags[id].sensors[sensorType].graph.graphdisplay == "on" && snaplabs.graph.graphDisplay[sensorType+id])
		{
			//console.log("DEBUG - setting up values for graphing if required for " + sensorType+id )
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
			
		
			var graphTitle = expConfigData.sensorTags[id].sensors[sensorType].graphTitle
			var graphType = expConfigData.sensorTags[id].sensors[sensorType].graphType
				if (graphType == null) graphType = "spline"
			var xAxisTitle = expConfigData.sensorTags[id].sensors[sensorType].graphXAxis
			var yAxisTitle = expConfigData.sensorTags[id].sensors[sensorType].graphYAxis
			
			//Check whether the Temperature is set to Ambient, IR or both
			
			if(IR&&ambient){
				snaplabs.graph.showGraphicData(sensorType+id+"GraphCanvas", graphType, graphTitle, xAxisTitle, yAxisTitle, datapoints[sensorType].xmin, datapoints[sensorType].ymin, datapoints[sensorType].x[id], "Ambient Temperature (C)", datapoints[sensorType].y[id], "Target (IR) Temerature (C)");
			}else if (IR){
				snaplabs.graph.showGraphicData(sensorType+id+"GraphCanvas", graphType, graphTitle, xAxisTitle, yAxisTitle, datapoints[sensorType].xmin, datapoints[sensorType].ymin,  datapoints[sensorType].y[id], "Target (IR) Temerature (C)");
			}else if (ambient){
				snaplabs.graph.showGraphicData(sensorType+id+"GraphCanvas", graphType, graphTitle, xAxisTitle, yAxisTitle, datapoints[sensorType].xmin, datapoints[sensorType].ymin,  datapoints[sensorType].x[id], "Ambient Temperature (C)");
			}
		}
	}
}
 
 
snaplabs.display.humidityDisplay = function(id, tc, tf, h)
{ 
	var sensorType = "Humidity"
	// Prepare the information to display.
	string =
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
	if(snaplabs.experimentconfig.experimentSensortags[id].sensors.indexOf(sensorType) == -1)
		displayValuesFlag = false;
	if ((expConfigData.sensorTags[id].sensors[sensorType].captureOnClick == "on" ||
		expConfigData.sensorTags[id].sensors[sensorType].grid.griddisplay == "on")
		&& !snaplabs.captureOnClick.value[sensorType+id].flag)
		displayValuesFlag = false;
		
	if(displayValuesFlag)
	{
		snaplabs.captureOnClick.value[sensorType+id].flag=false;

		// Update the value displayed.
		snaplabs.ui.displayValue(sensorType+'Data'+id, string)
		
		var gridElement = document.getElementById(sensorType+"Grid"+snaplabs.captureOnClick.value[sensorType+id].gridPosition)
		//console.log("DEBUG - Looking for element " + sensorType+"Grid"+captureOnClickValue[sensorType+id].gridPosition + ". Grid element is " +  gridElement)
		if(gridElement !== null)
		{
			displayValue(sensorType+"Grid"+snaplabs.captureOnClick.value[sensorType+id].gridPosition, string)
			equalHeight($(".widgetblock"));
		}
		
		// Prepare values to add to CSV file
		// NOTE - based on implementation from web, can also inlcude check boxes etc to determine format etc
		//if(experimentSensorDisplay.indexOf(sensorType+id) != -1)
		//{
		//	currentSensorString = csvSensorData(sensorType+"_"+id, values, h, tc);
		//	saveCSV(currentSensorString);
		//}

		// Prepare values for graphing if it is requires
		if(expConfigData.sensorTags[id].sensors[sensorType].graph.graphdisplay == "on" && snaplabs.graph.graphDisplay[sensorType+id])
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
			
			var graphTitle = expConfigData.sensorTags[id].sensors[sensorType].graphTitle
			var graphType = expConfigData.sensorTags[id].sensors[sensorType].graphType
				if (graphType == null) graphType = "spline"
			var xAxisTitle = expConfigData.sensorTags[id].sensors[sensorType].graphXAxis
			var yAxisTitle = expConfigData.sensorTags[id].sensors[sensorType].graphYAxis
			snaplabs.graph.showGraphicData(sensorType+id+"GraphCanvas", graphType, graphTitle, xAxisTitle, yAxisTitle, datapoints[sensorType].xmin, datapoints[sensorType].ymin,  datapoints[sensorType].x[id], "Relative Humidity");
		}
	}
}

snaplabs.display.barometerDisplay = function(id, temp, pressure)
{ 
	var sensorType = "Barometer"
	// Prepare the information to display.
	string =
		pressure.toPrecision(6) + ' hPa<br/>'

	/* 
	 * Display values only by default 
	 * Do not display if sensor has not been initialised (experimentSensorDisplay contains initialised senors)
	 * Do not display if captureOnClick is true or gridDisplay is true and the captureOnClick flag is not set
	 *
	 */	

	var displayValuesFlag = true;
	if(snaplabs.experimentconfig.experimentSensortags[id].sensors.indexOf(sensorType) == -1)
		displayValuesFlag = false;
	if ((expConfigData.sensorTags[id].sensors[sensorType].captureOnClick == "on" ||
		expConfigData.sensorTags[id].sensors[sensorType].grid.griddisplay == "on")
		&& !snaplabs.captureOnClick.value[sensorType+id].flag)
		displayValuesFlag = false;
		
	if(displayValuesFlag) 
	{
		snaplabs.captureOnClick.value[sensorType+id].flag=false;
		
		snaplabs.ui.displayValue(sensorType+'Data'+id, string)
		
		var gridElement = document.getElementById(sensorType+"Grid"+snaplabs.captureOnClick.value[sensorType+id].gridPosition)
		//console.log("DEBUG - Looking for element " + sensorType+"Grid"+captureOnClickValue[sensorType+id].gridPosition + ". Grid element is " +  gridElement)
		if(gridElement !== null)
		{
			snaplabs.ui.displayValue(sensorType+"Grid"+snaplabs.captureOnClick.value[sensorType+id].gridPosition, string)
			equalHeight($(".widgetblock"));
		}	
		// Prepare values to add to CSV file
		// NOTE - based on implementation from web, can also inlcude check boxes etc to determine format etc
		//if(experimentSensorDisplay.indexOf(sensorType+id) != -1)
		//{
		//	currentSensorString = csvSensorData(sensorType+"_"+id, values, pressure);
		//	saveCSV(currentSensorString);
		//}

		// Prepare values for graphing if it is requires
		if(expConfigData.sensorTags[id].sensors[sensorType].graph.graphdisplay== "on" && snaplabs.graph.graphDisplay[sensorType+id])
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
			console.log("DEBUG - Barometer data " + JSON.stringify(datapoints[sensorType].x[id][counter]))
			snaplabs.graph.showGraphicData(sensorType+id+"GraphCanvas", graphType, graphTitle, xAxisTitle, yAxisTitle, xmin, ymin,  datapoints[sensorType].x[id], "Pressure (hPa)");
		}
	}
}

snaplabs.display.accelerometerDisplay = function(id, x,y,z,comb)
{
	// Check whether all values, xyz or scalar values should be sent
	// Display all by default
	var xyz = true; 
	var scalar = true;

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
		snaplabs.display.xyzaDisplay(id,"Accelerometer", stringXyz+stringScalar, x,y,z, comb, x*g,y*g,z*g)
	}
	else if(xyz)
	{
		snaplabs.display.xyzDisplay(id,"Accelerometer", stringXyz, x,y,z, comb, x*g,y*g,z*g)
	}
	else if(scalar)
	{
		snaplabs.display.singleValDisplay(id,"Accelerometer", stringScalar, comb, "G")
	}
	
}


snaplabs.display.magnetometerDisplay = function(id, x,y,z,comb)
{
	// Check whether all values, xyz or scalar values should be sent
	// Display all by default
	var xyz = true; 
	var scalar = true;

	// Set display and storage values to false if not required
	console.log("DEBUG - Mag parameters are: " + JSON.stringify(expConfigData.sensorTags[id].sensors.Magnetometer.parameters))
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
		snaplabs.display.xyzaDisplay(id,"Magnetometer", stringXyz+stringScalar, x,y,z, comb)
	}
	else if(xyz)
	{
		snaplabs.display.xyzDisplay(id,"Magnetometer", stringXyz, x,y,z, comb)
	}
	else if(scalar)
	{
		snaplabs.display.singleValDisplay(id,"Magnetometer",  stringScalar, comb, "&micro;T")
	}

}


snaplabs.display.gyroscopeDisplay = function(id, x,y,z)
{
	// Prepare the information to display.
	string =
		//'raw: <span style="font-family: monospace;">0x' +
		//	bufferToHexStr(data, 0, 6) + '</span><br/>' +
		'x: ' + (x >= 0 ? '+' : '') + x.toFixed(5) + '<br/>' +
		'y: ' + (y >= 0 ? '+' : '') + y.toFixed(5) + '<br/>' +
		'z: ' + (z >= 0 ? '+' : '') + z.toFixed(5) + '<br/>'

	snaplabs.display.xyzDisplay(0,"Gyroscope", string, x,y,z);
}

snaplabs.display.xyzaDisplay = function(id, sensorType, string,  x, y,z, a, data1,data2,data3)
{ 
	
	/* 
	 * Display values only by default 
	 * Do not display if sensor has not been initialised (experimentSensorDisplay contains initialised senors)
	 * Do not display if captureOnClick is true or gridDisplay is true and the captureOnClick flag is not set
	 *
	 */	
		var displayValuesFlag = true;
	if(snaplabs.experimentconfig.experimentSensortags[id].sensors.indexOf(sensorType) == -1)
		displayValuesFlag = false;
	if ((expConfigData.sensorTags[id].sensors[sensorType].captureOnClick == "on" ||
		expConfigData.sensorTags[id].sensors[sensorType].grid.griddisplay == "on")
		&& !snaplabs.captureOnClick.value[sensorType+id].flag)
		displayValuesFlag = false;
	
	if(displayValuesFlag)
	{
		snaplabs.captureOnClick.value[sensorType+id].flag=false;
		// Update the value displayed.
		snaplabs.ui.displayValue(sensorType+'Data'+id, string)
		//console.log("DEBUG - A value for " + sensorType + " and id " + id + " is " + a)
		var gridElement = document.getElementById(sensorType+"Grid"+snaplabs.captureOnClick.value[sensorType+id].gridPosition)
		//console.log("DEBUG - Looking for element " + sensorType+"Grid"+captureOnClickValue[sensorType+id].gridPosition + ". Grid element is " +  gridElement)
		if(gridElement !== null)
		{
			snaplabs.ui.displayValue(sensorType+"Grid"+snaplabs.captureOnClick.value[sensorType+id].gridPosition, string)
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
		//currentSensorString = csvSensorData(sensorType + "_" + id,  x, y, z, a, extradata);
		//saveCSV(currentSensorString);

		//console.log("DEBUG - Values for diaplying graphs are: " + expConfigData.sensorTags[id].sensors["Accelerometer"].graph + " and " + graphDisplay["Accelerometer"+id])
		// Prepare values for graphing if it is requires
		if(expConfigData.sensorTags[id].sensors[sensorType].graph.graphdisplay== "on" && snaplabs.graph.graphDisplay[sensorType+id])
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
			snaplabs.graph.showGraphicData(sensorType+id+"GraphCanvas", graphType, graphTitle, xAxisTitle, yAxisTitle, datapoints[sensorType].xmin, datapoints[sensorType].ymin,  datapoints[sensorType].x[id], "X", datapoints[sensorType].y[id], "Y", datapoints[sensorType].z[id], "Z", datapoints[sensorType].a[id], "Scalar Value");
		}
	}
}

snaplabs.display.xyzDisplay = function(id, sensorType, string, x, y,z, data1,data2,data3)
{ 
	/* 
	 * Display values only by default 
	 * Do not display if sensor has not been initialised (experimentSensorDisplay contains initialised senors)
	 * Do not display if captureOnClick is true or gridDisplay is true and the captureOnClick flag is not set
	 *
	 */	 
	//console.log("DEBUG - Xyz display with arguments " + JSON.stringify(arguments))
		var displayValuesFlag = true;
	if(snaplabs.experimentconfig.experimentSensortags[id].sensors.indexOf(sensorType) == -1)
		displayValuesFlag = false;
	if ((expConfigData.sensorTags[id].sensors[sensorType].captureOnClick == "on" ||
		expConfigData.sensorTags[id].sensors[sensorType].grid.griddisplay == "on")
		&& !snaplabs.captureOnClick.value[sensorType+id].flag)
		displayValuesFlag = false;
	
		

	if(displayValuesFlag)
	{
		snaplabs.captureOnClick.value[sensorType+id].flag=false;
		// Update the value displayed.
		snaplabs.ui.displayValue(sensorType+'Data'+id, string)
		//console.log("DEBUG - A value for " + sensorType + " and id " + id + " is " + a)
		var gridElement = document.getElementById(sensorType+"Grid"+snaplabs.captureOnClick.value[sensorType+id].gridPosition)
		//console.log("DEBUG - Looking for element " + sensorType+"Grid"+captureOnClickValue[sensorType+id].gridPosition + ". Grid element is " +  gridElement)
		if(gridElement !== null)
		{
			snaplabs.ui.displayValue(sensorType+"Grid"+snaplabs.captureOnClick.value[sensorType+id].gridPosition, string)
			equalHeight($(".widgetblock"));
		}
 

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
		//currentSensorString = csvSensorData(sensorType + "_" + id, x, y, z,extradata);
		//saveCSV(currentSensorString);

		//console.log("DEBUG - Values for displaying graphs are: " + expConfigData.sensorTags[id].sensors["Accelerometer"].graph + " and " + graphDisplay["Accelerometer"+id])
		// Prepare values for graphing if it is requires
		if(expConfigData.sensorTags[id].sensors[sensorType].graph.graphdisplay== "on" && snaplabs.graph.graphDisplay[sensorType+id])
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
			snaplabs.graph.showGraphicData(sensorType+id+"GraphCanvas", graphType, graphTitle, xAxisTitle, yAxisTitle, datapoints[sensorType].xmin, datapoints[sensorType].ymin,  datapoints[sensorType].x[id], "X", datapoints[sensorType].y[id], "Y", datapoints[sensorType].z[id], "Z");
		}
	}
}

snaplabs.display.singleValDisplay = function(id, sensorType,  string, data, units)
{ 
	/* 
	 * Display values only by default 
	 * Do not display if sensor has not been initialised (experimentSensorDisplay contains initialised senors)
	 * Do not display if captureOnClick is true or gridDisplay is true and the captureOnClick flag is not set
	 *
	 */	 
	var displayValuesFlag = true;
	if(snaplabs.experimentconfig.experimentSensortags[id].sensors.indexOf(sensorType) == -1)
		displayValuesFlag = false;
	if ((expConfigData.sensorTags[id].sensors[sensorType].captureOnClick == "on" ||
		expConfigData.sensorTags[id].sensors[sensorType].grid.griddisplay == "on")
		&& !snaplabs.captureOnClick.value[sensorType+id].flag)
		displayValuesFlag = false;
	
		

	if(displayValuesFlag)
	{
		snaplabs.captureOnClick.value[sensorType+id].flag=false;
		// Update the value displayed.
		snaplabs.ui.displayValue(sensorType+'Data'+id, string)
		//console.log("DEBUG - A value for " + sensorType + " and id " + id + " is " + a)
		var gridElement = document.getElementById(sensorType+"Grid"+snaplabs.captureOnClick.value[sensorType+id].gridPosition)
		//console.log("DEBUG - Looking for element " + sensorType+"Grid"+captureOnClickValue[sensorType+id].gridPosition + ". Grid element is " +  gridElement)
		if(gridElement !== null)
		{
			snaplabs.ui.displayValue(sensorType+"Grid"+snaplabs.captureOnClick.value[sensorType+id].gridPosition, string)
			equalHeight($(".widgetblock"));
		}
		
		//currentSensorString = csvSensorData(sensorType+"_"+id, values, data);
		//saveCSV(currentSensorString);

		// Prepare values for graphing if it is requires
		if(expConfigData.sensorTags[id].sensors[sensorType].graph.graphdisplay== "on" && snaplabs.graph.graphDisplay[sensorType+id])
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
			snaplabs.graph.showGraphicData(sensorType+id+"GraphCanvas", graphType, graphTitle, xAxisTitle,yAxisTitle, datapoints[sensorType].xmin,datapoints[sensorType].ymin, datapoints[sensorType].x[id], units);
		}
	}
}

 /*
 * startGraphs
 * Turn on graphing for all graphs
 * (Based on http://www.heartsome.de/de/android/android-ti-sensor.html project)
 *
 */
 
snaplabs.graph.startGraphs = function()
{
	if(!datapoints.initialised)
	{
		snaplabs.graph.initGraphDrawing();
	}
	
	id=0;
	for(key in snaplabs.devices.connected)
	{
		for(var sensor in snaplabs.experimentconfig.experimentSensortags[id].sensors)
		{ 
			var sensorId = snaplabs.experimentconfig.experimentSensortags[id].sensors[sensor]+id; 
			console.log("DEBUG - graph ID is " + sensorId)
			snaplabs.graph.graphDisplay[sensorId]=true;
			snaplabs.ui.showElementViewInline('footerStopGraphsButton')
			snaplabs.ui.hideElementView('footerStartGraphsButton')
		}
		id++;
	}
}

 /*
 * stopGraphs
 * Turn off graphing for all graphs
 * (Based on http://www.heartsome.de/de/android/android-ti-sensor.html project)
 *
 */
 
snaplabs.graph.stopGraphs = function()
{
	if(!datapoints.initialised)
	{
		snaplabs.graph.initGraphDrawing();
	}
	
	id=0;
	for(key in snaplabs.devices.connected)
	{
		for(var sensor in snaplabs.experimentconfig.experimentSensortags[id].sensors)
		{ 
			var sensorId = snaplabs.experimentconfig.experimentSensortags[id].sensors[sensor]+id; 
			console.log("DEBUG - graph ID is " + sensorId)
			snaplabs.graph.graphDisplay[sensorId]=false;
			snaplabs.ui.showElementViewInline('footerStartGraphsButton')
			snaplabs.ui.hideElementView('footerStopGraphsButton')
		}
		id++;
	}
}


/*
* snaplabs.graph.showGraphicData
* Display the graph values ont he specified graph
*/


snaplabs.graph.showGraphicData = function(id, graphType, graphTitle, xAxisTitle, yAxisTitle, xmin, ymin, dx, dx_label, dy, dy_label, dz, dz_label, da, da_label)
{
	//console.log("DEBUG - Graphing with parameters " + JSON.stringify(arguments))
	// Set up data depending on number of parameters
	var dataSeries = new Array()
	var a = { 	type: graphType,
                showInLegend: true,
                legendText: dx_label,
                dataPoints:  dx,
			}
	dataSeries.push(a);
	
	if(dy != null){
		var b ={
				type: graphType,
                showInLegend: true,
                legendText: dy_label,
                dataPoints:  dy
            }
		dataSeries.push(b)
		
		if(dz != null){
			var c ={
				type: graphType,
                showInLegend: true,
                legendText: dz_label,
                dataPoints:  dz
            } 
			dataSeries.push(c)
			
			if(da != null){
				var d ={
					type: graphType,
					showInLegend: true,
					legendText: da_label,
					dataPoints:  da
				} 
				dataSeries.push(d)
			}
		}
	}
	//console.log("DEBUG - Series " + JSON.stringify(dataSeries));

	var chart = new CanvasJS.Chart(id,
    {
		theme: "theme2",//theme1
		zoomEnabled: true,
		exportEnabled: true,
        title:
        {
			text: graphTitle,
        },
        axisX:
		{
			minimum: xmin,
            title: xAxisTitle,
			viewportMinimum: 0,
			viewportMaximum: 20,
            valueFormatString: "0.00", //try properties here
        },
        axisY:
        {
			minimum: ymin,
			title: yAxisTitle,
        },
        data: dataSeries
    });
	
  chart.render();
}

/*
* initGraphDrawing
* Set up the required datapoints for the graphs
*
*/
snaplabs.graph.initGraphDrawing = function()
{
	// set up variables for graphing function		
	//var sensors = ['Temperature','Humidity','Barometer','Accelerometer','Gyroscope','Magnetometer','Luxometer','Keypress'];

	for(var i=0 ; i<sensorList.length ;i++)
	{ 
		console.log("DEBUG - Graph point variable set up for " +  sensorList[i])
		var sensorName = sensorList[i];
		
		datapoints[sensorName] = {}
		datapoints[sensorName].x = []
		datapoints[sensorName].y = []
		datapoints[sensorName].z = []
		datapoints[sensorName].a = []
		datapoints[sensorName].xmin = 0
		datapoints[sensorName].ymin = 0
		datapoints[sensorName].counter = []
		datapoints[sensorName].sensorStartTime = []
		
		for(var j = 0; j<2; j++) 
		{
			datapoints[sensorName][j] = {}
			datapoints[sensorName].x[j] = []
			datapoints[sensorName].y[j] = []
			datapoints[sensorName].z[j] = []
			datapoints[sensorName].a[j] = []
			datapoints[sensorName].counter[j] = 1
			datapoints[sensorName].sensorStartTime[j] = -1
		}
	}
	datapoints.initialised = true;
}

/*
* resetAllGraphs
* rest the points on all the graphs
*
*/

snaplabs.graph.resetAllGraphs = function()
{
	for(i in sensorList)
	{
		sensor = sensorList[i]
		for(var id = 0; id<2; id++) 
		{
			console.log("DEBUG - Resetting values of graph for : " + sensor + " and " +id)
			datapoints[sensor][id] = {}
			datapoints[sensor].x[id] = []
			datapoints[sensor].y[id] = []
			datapoints[sensor].z[id] = []
			datapoints[sensor].a[id] = []
			datapoints[sensor].counter[id] = 1
			datapoints[sensor].sensorStartTime[id] = -1
			if(document.getElementById(sensor+id+"GraphCanvas"))
				document.getElementById(sensor+id+"GraphCanvas").innerHTML = "";
		}
	}
}

/*
* resetGraphs
* rest the points on a specific graph
*
*/

snaplabs.graph.resetGraph = function(sensor, id)
{
	datapoints[sensor][id] = {}
	datapoints[sensor].x[id] = []
	datapoints[sensor].y[id] = []
	datapoints[sensor].z[id] = []
	datapoints[sensor].a[id] = []
	datapoints[sensor].counter[id] = 1
	datapoints[sensor].sensorStartTime[id] = -1
	if(document.getElementById(sensor+id+"GraphCanvas"))
		document.getElementById(sensor+id+"GraphCanvas").innerHTML = "";
}
/*
 * initGridDrawing
 * Initialise the values for the graphs
 */
 
snaplabs.graph.initGridDrawing = function()
{
	// set up variables for graphing function		
 
	for(var i=0 ; i<sensorList.length ;i++)
	{ 
		var sensorName = sensorList[i];
		//console.log("DEBUG - Grid values about to be initialised for " + sensorName)
		for(var j in snaplabs.experimentconfig.experimentSensortags)
		{
			snaplabs.captureOnClick.value[sensorName+j] = {}
			snaplabs.captureOnClick.value[sensorName+j].flag = false
			snaplabs.captureOnClick.value[sensorName+j].gridPosition = 0
			snaplabs.captureOnClick.value[sensorName+j].firstcell = true
			//console.log("DEBUG - initialising grid values for " + sensorName + j )
		}
	}
	//console.log("DEBUG - initialising grid values")
	snaplabs.captureOnClick.initialised = true;
}


 /*
 * Toggle for whether data is being stored or not for a sensortag
 * based on code from http://www.heartsome.de/de/android/android-ti-sensor.html
 */
	
snaplabs.data.toggleDataStorage = function(filePrefix)
{
	if (!isStoring)
	{
		isStoring = true;
		snaplabs.data.runInitDataStorage(filePrefix);
	}
	else
	{
		isStoring = false;
		snaplabs.data.stopInitDataStorage();
	}
}



/*snaplabs.file.saveCSV = function(string)
{
	console.log("DEBUG - saving CSV with string " + string);

	if (bFilewriter == true)
	{
		savedlines++;
		mysavestring = mysavestring + savedlines + ";" + string + "\n";
		if ((savedlines % 200) == 0)
		{
			console.log("DEBUG - saving CSV with added string " + mysavestring);
			filewriter.write(mysavestring);
			mysavestring = "";
		}
	}
}*/

 /*
 * returns string comprised of date, time and data
 */
function csvSensorData(code, data)
{
	getTimeInMs()
	var sensorString = 	code + ";" + timerCalled + ";" + currentDate + ";" + currentTime + ";" + (currentTime - startTime) + ";" + (currentTime - lastTime);
	for	(index = 0; index < data.length; index++) 
	{
		sensorString += ";" + data[index];
	}
	
	if (arguments.length > 2)
	{
		for	(var index = 2; index < arguments.length; index++)
		{
			sensorString += ";" + arguments[index];
		}
	}
	
	return sensorString;
}

/*
 *
 * The following functions are used for the data storage function of the app and set up the data storage file, format and time
 * based on code from http://www.heartsome.de/de/android/android-ti-sensor.html
 *
 */

var currentTime = 0;
var currentDate = 0;
var timerCalled = 0;
var lastTime = 0;
var currentSensorString = "";

var startTime = getTimeInMs();
timerCalled--;
lastTime = startTime;

var isStoring = false;

 /*
 * Time in ms
 */
function getTimeInMs()
{
	lastTime = currentTime;
	var d = new Date();
	currentTime  = d.getTime();
	currentDate  = d.toLocaleString(); 
	timerCalled++;
	return currentTime;
}
