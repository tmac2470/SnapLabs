/*
 * This file is based on code from http://www.heartsome.de/de/android/android-ti-sensor.html
 * Adapted for use with NERLD SensorTag app
 *
 */
var csvfilename = "tisensordata";

var filewriter = false;
var bFilewriter = false;

var logfilename = "";

var fileOutLog = 1;

var savedlines = 0;

var datapoints = {}
datapoints.initialised = false;
var tempData = []

var media = []
media.video = []
media.videoPrefix = ""

/*
 * Data Storage functions changed to use the savedDataDir for files
 *
 */
 
function startDataStorage(filePrefix)
{
	//console.log("DEBUG - start data storage" );
	window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, gotFSTest(filePrefix), failCreateLogFileTest);
	//var retobj = { filename: logfilename, writer: testfilewriter };
	return false;
}

function gotFSTest(filePrefix)
{
	var stamp = new Date();
	console.log("Debug - sent file prefix is " + filePrefix)
	if(filePrefix != "") csvfilename = filePrefix
	logfilename = csvfilename + "-" + stamp.getDate() + "-" + (stamp.getMonth()+1) + "-" + stamp.getFullYear() + "-" + stamp.getHours() + "-" + stamp.getMinutes() + "-" + stamp.getSeconds() + ".csv";
	// Added TCM
	savedDataDir.getFile(logfilename, {create: true, exclusive: false}, gotFileEntryTest, errorHandler);
	// Removed TCM
	//fileSystem.root.getFile(logfilename, {create: true, exclusive: false}, gotFileEntryTest, failGotFSTest);
}

function failCreateLogFileTest(error)
{
	alert("failGotFileEntry: " + error.code);
}

function stopDataStorage()
{
	if (mysavestring != "")
		filewriter.write(mysavestring);
	bFilewriter = false;
	filewriter = "";
	if (fileOutLog == 1)
		alert("Stop Logging to file:\n" + logfilename);
	savedlines = 0;
	return false;
}

function gotFileEntryTest(fileEntry)
{
	fileEntry.createWriter(gotFileWriterTest, failGotFileEntryTest);
}

function failGotFSTest(error)
{
	alert("failGotFS: " + error.code  + "\n" + logfilename);
}

function gotFileWriterTest(writer)
{
	if (fileOutLog == 1)
		alert("Start Logging to file:\n" + logfilename);
	filewriter = writer;
	filewriter.onwriteend = function(evt) 
	{
		 //console.log("contents of file now 'some sample'");
		 //filewriter.write(savedlines + ";" + mysavestring + "\n");
	}
	
	filewriter.onerror = function(evt) 
	{
		alert("filewriter.onerror:" + evt);
	}
	bFilewriter = true;
	savedlines = 0;
	filewriter.write("SavedLine;SensorCode;Called;Date;TimeMs;DTimeMS;DiffTimeMS;data1;data2;data3;data4;data5;data6;data7;data8;data9;data10;data11;data12;data13;data14\n");
}

function failGotFileEntryTest(error)
{
	alert("failGotFileEntry: " + error.code + "\n" + logfilename);
}

var mysavestring = "";

function saveCSV(string)
{
	//console.log("DEBUG - saving CSV with string " + string);

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
}

// Testing Viedo from https://www.raymondcamden.com/2015/06/05/cordova-sample-capture-and-display-video/
function captureError(e) {
    console.log("capture error: "+JSON.stringify(e));
}

var captureSuccess = function(mediaFiles) {
    var i, path, len;
    for (i = 0, len = mediaFiles.length; i < len; i += 1) {
        path = mediaFiles[i].fullPath;
		//console.log("DEBUG -  video path is: " + path)
		//console.log("DEBUG -  media file object is: " + JSON.stringify(mediaFiles[i]))
		
		// save file to new file name based on https://www.raymondcamden.com/2015/07/27/recording-and-saving-audio-in-cordova-applications/
		media.video.file = mediaFiles[i].localURL;
		media.video.filePath = mediaFiles[i].fullPath;
		
		var extension = media.video.file.split(".").pop();
		var d = new Date();
		var filepart = d.getFullYear().toString() + d.getMonth().toString() + d.getDate().toString() + "_" + d.getHours() + d.getMinutes() + d.getSeconds() ; 
		//var filepart = Date.now()
		var filename = media.videoPrefix + filepart + "." + extension;
		//console.log("DEBUG - (TO DO - ADD PREFIX) new filename is "+filename);

		//console.log("DEBUG -  value for file capture is: media.video.file - " + media.video.file )
        
		window.resolveLocalFileSystemURL(media.video.file, function(mediaDir) {
			mediaDir.copyTo(savedDataDir, filename, function(e) {
				console.log('DEBUG - Video file copied successfully to ' + e.fullPath);
				}, function(e) {
					console.log('Error in video file copy: ' + e.message);
			});                 
		});
	}
};



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
 * returns string comprised of date, time and data with the addition of  a specified string
 */
 function csvSensorDataString(code, string)
{
	getTimeInMs()

	var sensorString = 	code + ";" + timerCalled + ";" + currentDate + ";" + currentTime + ";" + (currentTime - startTime) + ";" + (currentTime - lastTime) + ";" + string;
	if (arguments.length > 2)
	{
		for	(index = 2; index < arguments.length; index++)
		{
			sensorString += ";" + arguments[index];
		}
	}
	return sensorString;
}

 /*
 * Toggle for whether data is being stored or not for a sensortag
 * based on code from http://www.heartsome.de/de/android/android-ti-sensor.html
 */
	
function toggleDataStorage(filePrefix)
{
	if (!isStoring)
	{
		isStoring = true;
		runInitDataStorage(filePrefix);
	}
	else
	{
		isStoring = false;
		stopInitDataStorage();
	}
}
	
/*
 * Initialise data storage function for sensor
 * based on code from http://www.heartsome.de/de/android/android-ti-sensor.html
 */


function runInitDataStorage(filePrefix)
{
	try
	{
		initDataStorage(filePrefix);
	}
	catch (ex)
	{
		console.log("DEBUG - Error in Data Storage runInitDataStorage. Error " + JSON.stringify(ex) )
	}
	
	// document.getElementById("init ").disabled = true;
	// document.getElementById("stopDataStorage").disabled = false;
	
	changeButtonColour("initDataStorage","asellorange")
	displayValue("initDataStorage","Stop Saving Values")
}

function stopInitDataStorage()
{
	try
	{
		stopDataStorage();
	}
	catch (ex)
	{
		console.log("DEBUG - Error in Data Storage stopInitDataStorage")
	}
	changeButtonColour("initDataStorage","asellgreen")
	displayValue("initDataStorage","Start Saving Values")
}

function initDataStorage(filePrefix)
{
	console.log("DEBUG - initDataStorage with file prefix " + filePrefix)
	timerCalled=0;
	var startTime = getTimeInMs(); 
	lastTime = startTime;
	startDataStorage(filePrefix);
	return true;
}

 /*
 * Start video capturing
 * based on  https://www.raymondcamden.com/2015/06/05/cordova-sample-capture-and-display-video/
 */
	
function startVideo(filePrefix)
{
	media.videoPrefix = filePrefix
	navigator.device.capture.captureVideo(captureSuccess, captureError, {limit: 1});
}
	

function captureOnClick(sensorId,id)
{
	if( (id==0 && sensortag0.connected) || (id==1 && sensortag1.connected) )
	{
		captureOnClickValue[sensorId].flag = true;
		console.log("DEBUG - set capture on click for " + sensorId + " to " + captureOnClickValue[sensorId].flag )
		// If it is a grid format, increment the grid position for the next value - doesn't work yet because it starts at 1 and does not interact with frid option well 
		// sensorId+"Grid"+captureOnClickValue[sensorId].gridPosition ++
	}
	else 
	{
		alert("Connect to the Sensortag before starting the graphs")
	} 
}	
	
function captureOnClickGrid(sensorId,id,value)
{
	console.log("DEBUG - captureOnClickGrid")
	if( (id==0 && sensortag0.connected) || (id==1 && sensortag1.connected) )
	{
		captureOnClickValue[sensorId].flag = true;
		captureOnClickValue[sensorId].gridPosition = value;
		console.log("DEBUG - set capture on click for " + sensorId + " to " + captureOnClickValue[sensorId].flag +  " for position " + captureOnClickValue[sensorId].gridPosition )
	}
	else 
	{
		alert("Connect to the Sensortag before starting the graphs")
	} 
}	

function clearGrid(sensorType,id,value)
{
	for(i = 0; i < value; i++)
	{
		//console.log("DEBUG - Clearing Grid for " + sensorType + id + " in position " + i )
		var buttonString = "<button class='asellbrightgreen' onclick='captureOnClickGrid(\"" + sensorType + id +"\", \""+ id + "\", \"" + i + "\")'>"+i+ "</button>"
		displayValue(sensorType+"Grid"+i, buttonString)
	} 
	captureOnClickValue[sensorType+id].gridPosition = 0;
	captureOnClickValue[sensorType+id].firstcell = true;
	//console.log("DEBUG - clearing grid for " + sensorType+id + " with capture on click values of " + JSON.stringify(captureOnClickValue[sensorType+id]))
}	

/*
 * Following functions are used for graphing the values from the sensor tags
 * Based on http://www.heartsome.de/de/android/android-ti-sensor.html project
 *
 */
 
 function toggleDrawGraphs(sensorId,id)
{
	//console.log("DEBUG - Trying graphing for values: " + sensorId + " and " +id)
	//console.log("DEBUG - connections are: " + sensortag0.connected + " and " +sensortag1.connected)
	if(!datapoints.initialised)
	{
		initGraphDrawing();
	}
	
	// Check that sensortag is connected
	if( (id==0 && sensortag0.connected) || (id==1 && sensortag1.connected) )
	{
		//console.log("DEBUG - Toggling values for " +sensorId)
		if (!graphDisplay[sensorId])
		{
			graphDisplay[sensorId]=true;
			displayValue("toggleGraphButton"+sensorId,"Stop Graphing")
			changeButtonColour("toggleGraphButton"+sensorId,"asellorange")
			changeButtonColour("resetGraphButton"+sensorId,"asellbrightgreen")
		}
		else
		{
			graphDisplay[sensorId]=false;
			displayValue("toggleGraphButton"+sensorId,"Start Graphing")
			changeButtonColour("toggleGraphButton"+sensorId,"asellbrightgreen")
			changeButtonColour("resetGraphButton"+sensorId,"charcoal")
		}
	}
	else
	{
		alert("Connect to the Sensortag before starting the graphs")
	}

	//showGraphicData("chartContainerAcc", "Accelerometer values", "Acceleration m/s2", datapointsx, datapointsy, datapointsz);
	//showGraphicData("chartContainerGyro", "Gyrometer values", "Gyrometer degrees", datapointgx, datapointgy, datapointgz);
	//showGraphicData("chartContainerMag", "Magnetometer values", "Magnetometer degrees", datapointmx, datapointmy, datapointmz);
	//showGraphicDataSingle("chartContainerBaro", "Barometer values", "Barometer raw", datapointbx);
}

function showGraphicData(id, graphType, graphTitle, xAxisTitle, yAxisTitle, xmin, ymin, dx, dx_label, dy, dy_label, dz, dz_label, da, da_label)
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

 function resetGraph(sensor,id)
{
	//console.log("DEBUG - Resetting values of graph for : " + sensor + " and " +id)
	datapoints[sensor][id] = {}
	datapoints[sensor].x[id] = []
	datapoints[sensor].y[id] = []
	datapoints[sensor].z[id] = []
	datapoints[sensor].a[id] = []
	datapoints[sensor].counter[id] = 1
	datapoints[sensor].sensorStartTime[id] = -1
}


function showGraphicDataSingle(id, text, title, dx)
{
  var chart = new CanvasJS.Chart(id,
    {
		theme: "theme2",//theme1
        zoomEnabled: true,
        title:
        {
			text: text,
        },
        axisX:
		{
			title: "Time Points",
		},
		axisY:
		{
			title: title,
	        interval: 5,
		},
		data:
		[              
			{
				type: "spline",
				showInLegend: true,
				legendText: "X",
				dataPoints:  dx
			}
		]
	});

  chart.render();
}

function showGraphicDataTriple(id, text, title, dx, dy, dz)
{
	//console.log("DEBUG - Adding Chart with derails: " + id + ", "+ text + ", "+ title + ", "+ dx + ", "+ dy + ", "+ dz )
	var chart = new CanvasJS.Chart(id,
    {
		theme: "theme2",//theme1
		zoomEnabled: true,
        title:
        {
			text: text,
        },
        axisX:
		{
            title: "Time Points",
        },
        axisY:
        {
			title: title,
	        interval: 5,
        },
        data:
        [              
			{
				type: "spline",
                showInLegend: true,
                legendText: "X",
                dataPoints:  dx
            },
            {
				type: "spline",
                showInLegend: true,
                legendText: "Y",
                dataPoints:  dy
            },
            {
                type: "spline",
                showInLegend: true,
                legendText: "Z",
                dataPoints:  dz
            }
        ]
    });
	
  chart.render();
}

function initGridDrawing()
{
	// set up variables for graphing function		
	var sensors = ['Temperature','Humidity','Barometer','Accelerometer','Gyroscope','Magnetometer','Luxometer','Keypress'];

	for(var i=0 ; i<sensors.length ;i++)
	{ 
		//console.log("DEBUG - Graph point variable set up for " + sensors[i])
		var sensorName = sensors[i];
		for(var j = 0; j<2; j++) 
		{
			captureOnClickValue[sensorName+j] = {}
			captureOnClickValue[sensorName+j].flag = false
			captureOnClickValue[sensorName+j].gridPosition = 0
			captureOnClickValue[sensorName+j].firstcell = true
			//console.log("DEBUG - initialising grid values for " + sensorName + j )
		}
	}
	captureOnClickValue.initialised = true;
}

function initGraphDrawing()
{
	// set up variables for graphing function		
	var sensors = ['Temperature','Humidity','Barometer','Accelerometer','Gyroscope','Magnetometer','Luxometer','Keypress'];

	for(var i=0 ; i<sensors.length ;i++)
	{ 
		//console.log("DEBUG - Graph point variable set up for " + sensors[i])
		var sensorName = sensors[i];
		
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
	