/*
 * SnapLabsGraphDataApp.js
 * Contains the functions and logic for NERLD Gen 2 app for both the teacher and student functionality
 * This file contains all the functions realted to the Data and Graphing functions from dataStorageGraphing
 */
 
snaplabs.display = {} // Functions related to the logif of displaying graphs and data
datapoints = {}
datapoints.initialised = false;

snaplabs.graph = {} 
snaplabs.graph.graphDisplay = new Array()  // variable storing whether graph is currently displaying ot not

snaplabs.data = {}
snaplabs.data.savedDataString = ""
snaplabs.data.isStoring = false;
snaplabs.data.filewriter = false;
snaplabs.data.filewriterExists = false;

snaplabs.grid = {}
var currentDate = 0;
var currentSensorString = "";
var startTime = getTimeInMs();
var lastTime = startTime
var currentTime_csv 
var lastTime_csv 

snaplabs.captureOnClick = {}
snaplabs.captureOnClick.value = [] // variable to store values for each sensor configured as capture on click showing whether the
snaplabs.captureOnClick.initialised = false;
var g = 9.81

snaplabs.media = []
snaplabs.media.video = []
snaplabs.media.videoPrefix = ""

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
		if(gridElement !== null)
		{
			snaplabs.ui.displayValue(sensorType+"Grid"+snaplabs.captureOnClick.value[sensorType+id].gridPosition, string)
			equalHeight($(".widgetblock"));
		}
		
		var ctime = getTimeInMs();
		
		// Prepare values to add to CSV file and graph
		currentSensorString = csvSensorData(sensorType+"_"+id, ac, tc);
		snaplabs.data.saveCSV(currentSensorString);

		// Prepare values for graphing if it is requires
		if(expConfigData.sensorTags[id].sensors[sensorType].graph.graphdisplay == "on" && snaplabs.graph.graphDisplay[sensorType+id])
		{
			//console.log("DEBUG - setting up values for graphing if required for " + sensorType+id )
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
		currentSensorString = csvSensorData(sensorType+"_"+id, h, tc);
		snaplabs.data.saveCSV(currentSensorString);
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
		currentSensorString = csvSensorData(sensorType+"_"+id, pressure);
		snaplabs.data.saveCSV(currentSensorString);
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
			//console.log("DEBUG - Barometer data " + JSON.stringify(datapoints[sensorType].x[id][counter]))
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
		//:1067
		console.log("DEBUG - displaying xyz and scalar. Acceleraltion values are: "+ x + ", "+ y+ ", " +z+ ", " +  comb)
		snaplabs.display.xyzaDisplay(id,"Accelerometer", stringXyz+stringScalar, x,y,z, comb)
	}
	else if(xyz)
	{
		snaplabs.display.xyzDisplay(id,"Accelerometer", stringXyz, x,y,z, comb)
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
		console.log("DEBUG - displaying xyz and scalar. Magnetometer values are: "+ x + ", "+ y+ ", " +z+ ", " +  comb)
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
	//console.log(" DEBUG - Arguments for xyza display are: " + JSON.stringify(arguments))
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
		currentSensorString = csvSensorData(sensorType + "_" + id,  x, y, z, a, extradata);
		snaplabs.data.saveCSV(currentSensorString);

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

			/*console.log("Debug - x data stored is: " + JSON.stringify(datapoints[sensorType].x[id][counter]));
			console.log("Debug - y data stored is: " + JSON.stringify(datapoints[sensorType].y[id][counter]));
			console.log("Debug - z data stored is: " + JSON.stringify(datapoints[sensorType].z[id][counter]));
			console.log("Debug - a data stored is: " + JSON.stringify(datapoints[sensorType].a[id][counter]));
			*/
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
		currentSensorString = csvSensorData(sensorType + "_" + id, x, y, z,extradata);
		snaplabs.data.saveCSV(currentSensorString);

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
		//console.log("DEBUG - testing grids for " + sensorType+id + ". Before flag and position are: " + snaplabs.captureOnClick.value[sensorType+id].flag +", " + snaplabs.captureOnClick.value[sensorType+id].gridPosition)
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
		
		currentSensorString = csvSensorData(sensorType+"_"+id,  data);
		snaplabs.data.saveCSV(currentSensorString);

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
			$('.exportGraphButton').show()
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
		for(var id = 0; id<4; id++) 
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
 * snaplabs.graph.exportGraph
 * Save the graph as a PDF
 */

snaplabs.graph.exportGraph = function(canvasName)
{
	console.log("DEBUG - export for canvas " + canvasName)
	//var canvasContainer = document.getElementById(canvasName)
	var canvas = $("#"+ canvasName + " .canvasjs-chart-canvas").get(0);
	var dataURL = canvas.toDataURL('image/jpeg');

	var pdf = new jsPDF();
    pdf.addImage(dataURL, 'JPEG', 0, 0);
    //pdf.save("SavedDataFiles/download.pdf");
	
	getGraphExportFile = function(filePrefix)
	{
		var stamp = new Date();
		console.log("Debug - sent file prefix is " + filePrefix)
		var graphfilename = snaplabs.session.user 
		if(filePrefix != "") graphfilename += "_Graph_" + filePrefix
		logfilename = graphfilename + "_" + stamp.getDate() + "-" + (stamp.getMonth()+1) + "-" + stamp.getFullYear() + "-" + stamp.getHours() + "-" + stamp.getMinutes() + "-" + stamp.getSeconds() + ".pdf";
		// Added TCM
		pdf.save(logfilename) 
		snaplabs.storage.savedDataDir.getFile(logfilename, {create: true, exclusive: false}, 
			function(fileEntry) {
				fileEntry.createWriter(function(writer) {
					writer.write(pdf.output('blob'));
					writer.onwriteend = function() {
						alert('PDF ' + logfilename + ' written. ');
					};
				},
				snaplabs.file.errorHandler);
			},snaplabs.file.errorHandler);
		
	}

	var filePrefix = ""
	if('dataStoragePrefix' in expConfigData) 
			filePrefix = expConfigData.dataStoragePrefix
	console.log("DEBUG - File Prefix is " + filePrefix)
	window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, getGraphExportFile(filePrefix), snaplabs.file.errorHandler);
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
	
snaplabs.data.toggleDataStorage = function()
{
	var filePrefix = ""
	if('dataStoragePrefix' in expConfigData) 
			filePrefix = expConfigData.dataStoragePrefix
		
	console.log("DEBUG - File Prefix is " + filePrefix)
	if (!snaplabs.data.isStoring)
	{
		snaplabs.data.isStoring = true;
		try
		{
			snaplabs.data.initDataStorage(filePrefix);
		}
		catch (ex)
		{
			console.log("DEBUG - Error in Data Storage runInitDataStorage. Error " + JSON.stringify(ex) )
		}
		//snaplabs.ui.changeButtonColour("initDataStorage","asellorange")
		snaplabs.ui.displayValue("initDataStorage","Stop Saving Values")
	}
	else
	{
		snaplabs.data.isStoring = false;
		snaplabs.data.stopInitDataStorage();
	}
}

/*
* initDataStorage
* Initialise the file for data storage
*/
snaplabs.data.initDataStorage = function(filePrefix)
{
	console.log("DEBUG - initDataStorage with file prefix " + filePrefix)
	snaplabs.data.startTime = getTimeInMs(); 
	lastTime_csv = snaplabs.data.startTime;
	currentTime_csv = snaplabs.data.startTime;
	window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, snaplabs.data.getSavedDataFile(filePrefix), snaplabs.file.errorHandler);
	return true;
}

/*
* gotFSTest
* Check whether the file system exists and create if required
*/

snaplabs.data.getSavedDataFile = function(filePrefix)
{
	var stamp = new Date();
	console.log("Debug - sent file prefix is " + filePrefix)
	var csvfilename = snaplabs.session.user 
	if(filePrefix != "") csvfilename += "_" + filePrefix
	logfilename = csvfilename + "_" + stamp.getDate() + "-" + (stamp.getMonth()+1) + "-" + stamp.getFullYear() + "-" + stamp.getHours() + "-" + stamp.getMinutes() + "-" + stamp.getSeconds() + ".csv";
	// Added TCM
	snaplabs.storage.savedDataDir.getFile(logfilename, {create: true, exclusive: false}, 
		function(fileEntry) {
			fileEntry.createWriter(snaplabs.data.gotSavedDataFileWriter, snaplabs.file.errorHandler);
		},
		snaplabs.file.errorHandler);
}


/*
 * gotSavedDataFileWriter
 * write the string to the file
 */
 
snaplabs.data.gotSavedDataFileWriter = function(writer)
{
	alert("Start Logging to file:\n" + logfilename);
	snaplabs.data.filewriter = writer;
	snaplabs.data.filewriter.onwriteend = function(evt) 
	{
		 //console.log("contents of file now 'some sample'");
		 //filewriter.write(savedlines + ";" + mysavestring + "\n");
	}
	
	snaplabs.data.filewriter.onerror = function(evt) 
	{
		alert("filewriter.onerror:" + evt);
	}
	snaplabs.data.filewriterExists = true;
	snaplabs.data.savedlines = 0;
	snaplabs.data.filewriter.write("Line number; Sensor Code ; Date; Time(HH:mm:ss) ; Time since start (ms); Change in time (ms); Data Fields \n");
}



snaplabs.data.stopInitDataStorage = function()
{
	try
	{
		snaplabs.data.stopDataStorage();
	}
	catch (ex)
	{
		console.log("DEBUG - Error in Data Storage stopInitDataStorage")
	}
	//snaplabs.ui.changeButtonColour("initDataStorage","asellgreen")
	snaplabs.ui.displayValue("initDataStorage","Start Saving Values")
}

snaplabs.data.stopDataStorage = function()
{
	if (snaplabs.data.savedDataString != "")
		snaplabs.data.filewriter.write(snaplabs.data.savedDataString);
	snaplabs.data.filewriterExists = false;
	snaplabs.data.filewriter = "";
	alert("Stop Logging to file:\n" + logfilename);
	snaplabs.data.savedlines = 0;
	return false;
}




snaplabs.data.saveCSV = function(string)
{
	//console.log("DEBUG - saving CSV with string " + string);

	if (snaplabs.data.filewriterExists == true)
	{
		snaplabs.data.savedlines++;
		snaplabs.data.savedDataString += snaplabs.data.savedlines + ";" + string + "\n";
		if ((snaplabs.data.savedlines % 200) == 0)
		{
			console.log("DEBUG - saving CSV with added string " + snaplabs.data.savedDataString);
			snaplabs.data.filewriter.write(snaplabs.data.savedDataString);
			snaplabs.data.savedDataString = "";
		}
	}
}

snaplabs.grid.captureOnClickGrid = function(sensorId,id,value)
{
	console.log("DEBUG - connected devices " + JSON.stringify(snaplabs.devices.connected))
	// Note required as described in http://stackoverflow.com/questions/2528680/javascript-array-length-incorrect-on-array-of-objects
	if(Object.size(snaplabs.devices.connected) > 0 ) 
	{
		snaplabs.captureOnClick.value[sensorId].flag = true;
		snaplabs.captureOnClick.value[sensorId].gridPosition = value;
		console.log("DEBUG - set capture on click for " + sensorId + " to " + snaplabs.captureOnClick.value[sensorId].flag +  " for position " + snaplabs.captureOnClick.value[sensorId].gridPosition )
	}
	else 
	{
		alert("Connect to the Sensortag before starting the graphs")
	} 
}

snaplabs.grid.clearGrids = function()
{
	id=0;
	for(key in snaplabs.devices.connected)
	{
		for(var sensor in snaplabs.experimentconfig.experimentSensortags[id].sensors)
		{ 
			var sensorType = snaplabs.experimentconfig.experimentSensortags[id].sensors[sensor];
			console.log("DEBUG - Resetting values of grids for : " + sensorType + " and " +id + ". Cell count is " + snaplabs.grid.cellCount)
			for(i = 0; i < snaplabs.grid.cellCount; i++)
			{
				console.log("DEBUG - Clearing Grid for " + sensorType + id + " in position " + i )
				var buttonString = "<button class='asellbrightgreen' onclick='snaplabs.grid.captureOnClickGrid(\"" + sensorType + id +"\", \""+ id + "\", \"" + i + "\")'>"+i+ "</button>"
				if(document.getElementById(sensorType+"Grid"+i))
					snaplabs.ui.displayValue(sensorType+"Grid"+i, buttonString)
			} 

			snaplabs.captureOnClick.value[sensorType+id].gridPosition = 0;
			snaplabs.captureOnClick.value[sensorType+id].firstcell = true;
		}
	}

	//console.log("DEBUG - clearing grid for " + sensorType+id + " with capture on click values of " + JSON.stringify(captureOnClickValue[sensorType+id]))
}	


 /*
 * Start video capturing
 * based on  https://www.raymondcamden.com/2015/06/05/cordova-sample-capture-and-display-video/
 */
	
snaplabs.media.startVideo = function()
{
	var filePrefix = ""
	if('videoPrefix' in expConfigData) 
			filePrefix = expConfigData.dataStoragePrefix

	snaplabs.media.videoPrefix = filePrefix
	navigator.device.capture.captureVideo(snaplabs.media.captureSuccess, snaplabs.media.captureError, {limit: 1});
}

// Testing Video from https://www.raymondcamden.com/2015/06/05/cordova-sample-capture-and-display-video/
snaplabs.media.captureError = function(e) {
    console.log("capture error: "+JSON.stringify(e));
}

snaplabs.media.captureSuccess = function(mediaFiles) {
    var i, path, len;
    for (i = 0, len = mediaFiles.length; i < len; i += 1) {
        path = mediaFiles[i].fullPath;
		//console.log("DEBUG -  video path is: " + path)
		//console.log("DEBUG -  media file object is: " + JSON.stringify(mediaFiles[i]))
		
		// save file to new file name based on https://www.raymondcamden.com/2015/07/27/recording-and-saving-audio-in-cordova-applications/
		snaplabs.media.video.file = mediaFiles[i].localURL;
		snaplabs.media.video.filePath = mediaFiles[i].fullPath;
		
		var extension = snaplabs.media.video.file.split(".").pop();
		var d = new Date();
		var filepart = d.getFullYear().toString() + d.getMonth().toString() + d.getDate().toString() + "_" + d.getHours() + d.getMinutes() + d.getSeconds() ; 
		//var filepart = Date.now()
		var filename = snaplabs.session.user + "_" + snaplabs.media.videoPrefix + filepart + "." + extension;
		//console.log("DEBUG - (TO DO - ADD PREFIX) new filename is "+filename);

		//console.log("DEBUG -  value for file capture is: media.video.file - " + media.video.file )
        
		window.resolveLocalFileSystemURL(snaplabs.media.video.file, function(mediaDir) {
			mediaDir.copyTo(snaplabs.storage.savedDataDir, filename, function(e) {
				console.log('DEBUG - Video file copied successfully to ' + e.fullPath);
				}, function(e) {
					console.log('Error in video file copy: ' + e.message);
			});                 
		});
	}
};


snaplabs.captureOnClick.capture = function()
{
	if(Object.size(snaplabs.devices.connected) > 0 ) 
	{
		id=0;
		for(key in snaplabs.devices.connected)
		{
			for(var sensor in snaplabs.experimentconfig.experimentSensortags[id].sensors)
			{ 
				var sensorId = snaplabs.experimentconfig.experimentSensortags[id].sensors[sensor]+id;
				// Only increment posiion if it has not been reported yet
				if(!snaplabs.captureOnClick.value[sensorId].flag)
				{
					snaplabs.captureOnClick.value[sensorId].flag = true;
					// Only increment after the first cell has been filled
					if(snaplabs.captureOnClick.value[sensorId].firstcell)
					{
						snaplabs.captureOnClick.value[sensorId].firstcell = false;
					} 
					else
					{
						snaplabs.captureOnClick.value[sensorId].gridPosition++;
					}
				}
				console.log("DEBUG - set capture on click for " + sensorId + " to " + snaplabs.captureOnClick.value[sensorId].flag)
				// If it is a grid format, increment the grid position for the next value - doesn't work yet because it starts at 1 and does not interact with grid option well 
				// sensorId+"Grid"+captureOnClickValue[sensorId].gridPosition ++
			}
			id++
		}
	}
	else 
	{
		alert("Connect to the Sensortag before starting the graphs")
	} 
}	
	

 /*
 * returns string comprised of date, time and data
 */
function csvSensorData()
{
	//console.log("DEBUG - args length is " + arguments.length + " and they are " + JSON.stringify(arguments));
	var sensorType = arguments[0]
	
	lastTime_csv = currentTime_csv
	currentTime_csv = getTimeInMs();
	var timeSinceStart = (currentTime_csv - snaplabs.data.startTime)/1000;
	var dt = (currentTime_csv - lastTime_csv)/1000
	
	var sensorString = 	sensorType + ";" + currentDate + ";" + timeSinceStart + ";" + dt;
	for	(index = 0; index < arguments.length; index++) 
	{
		sensorString += ";" + arguments[index];
	}

	return sensorString;
}

/*
 *
 * The following functions are used for the data storage function of the app and set up the data storage file, format and time
 * based on code from http://www.heartsome.de/de/android/android-ti-sensor.html
 *
 */


 /*
 * Time in ms
 */
function getTimeInMs()
{
	var d = new Date();
	var currentTime  = d.getTime();
	currentDate  = d.toLocaleString(); 
	return currentTime;
}

Object.size = function(obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};
