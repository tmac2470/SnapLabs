/*
 * SnapLabsApp.js
 * Contains the functions and logic for NERLD Gen 2 app for both the teacher and student functionality
 * This file contains those functions relating the the UI display
 * Carried over from ExperimentApp.js and TeacherApp.js
 */
 
snaplabs.ui = {} // Functions for displaying html etc on app


/*
 * populate 
 * Function to fill in form in order to edit design
 *
 */
 
snaplabs.ui.populate = function(frm, data) {   
	$.each(data, function(key, value){  
		if(key == "sensorTags")
		{
			for( i=0; i <2; i++)
			{
				$.each(value[i], function(key_i, value_i){  
					//console.log("DEBUG - Looking at element: "+ key_i + " with type " + $ctrl_i.attr("type") + " with value " + value_i)
					if(key_i == "sensors")
					{
						$.each(value_i, function(key_j, value_j){  
							if( typeof value_j === "object")
							{
								$.each(value_j, function(key_k, value_k){  
									if( typeof value_k === "object")
									{
										$.each(value_k, function(key_l, value_l){  
											var $ctrl_l = $('[name="sensorTags['+i+']['+key_i+']['+key_j+']['+key_k+']['+key_l+']"]', frm);   
											//console.log("DEBUG - Looking at element: "+ key_l + " with type " + $ctrl_l.attr("type") + " with value " + value_l)
											//console.log("DEBUG - element is: "+ $ctrl_l.selector)
											popSwitch($ctrl_l, value_l)  
										});
									}
									else
									{
											var $ctrl_k = $('[name="sensorTags['+i+']['+key_i+']['+key_j+']['+key_k+']"]', frm);   
											//console.log("DEBUG - Looking at element: "+ key_k + " with type " + $ctrl_k.attr("type") + " with value " + value_k)
											//console.log("DEBUG - element is: "+ $ctrl_k.selector)
											popSwitch($ctrl_k, value_k)  
									}
								});
							}
							else
							{
								var $ctrl_j = $('[name="sensorTags['+i+']['+key_i+']['+key_j+']"]', frm);   
								//console.log("DEBUG - Looking at element: "+ key_j + " with type " + $ctrl_j.attr("type") + " with value " + value_j)
								//console.log("DEBUG - element is: "+ $ctrl_j.selector)
								popSwitch($ctrl_j, value_j)  
							}
						});
					}
					else
					{
						var $ctrl_i = $('[name="sensorTags['+i+']['+key_i+']"]', frm);   
						popSwitch($ctrl_i, value_i)  
						//console.log("DEBUG - element is: "+ $ctrl_i.selector + " with type " +  $ctrl_i.attr("type") + ", name " + $ctrl_i.attr("name") + " and value " + $ctrl_i.val());
					}
				});
			}
		}
		else
		{
			var $ctrl = $('[name='+key+']', frm);   
			//console.log("DEBUG - Looking at element: "+ key + " with type " + $ctrl.attr("type") + " with value " + value)
			popSwitch($ctrl, value)  
		}
	}); 

	//Internal function for repeated switch statement
	function popSwitch($ctrl, value)
	{
		switch($ctrl.attr("type"))  
		{  
			case "text" :   
			case "hidden":  
				$ctrl.val(value);   
			break;   
			case "radio" : 
			case "checkbox": 
				//console.log("DEBUG - Before. Value is: " + $ctrl.prop("checked") + " for " + $ctrl.attr("name"))
				if(value == "on") {  
					$ctrl.prop("checked", true ).flipswitch('refresh');
				}
				else {  
					$ctrl.prop("checked", false ).flipswitch('refresh');
				}				
				//console.log("DEBUG - After. Value is: " + $ctrl.val() + " for " + $ctrl.attr("name"))
			break;  
			default:
				$ctrl.val(value); 
		}  	
	}	
}

/*
* listLocalExperimentFiles
* List local experiment files (not generic)
*/
snaplabs.ui.listLocalExperimentFiles = function(entry)
{
	var tempName = entry.name.split(".");
	
	var returnStr = '<a class="ui-btn ui-btn-icon-right ui-icon-carat-r" href="#pageExperiment" onclick="snaplabs.experimentconfig.readConfigFile(snaplabs.storage.experimentConfigDir,\'' + entry.fullPath + '\')" data-role="button" data-transition="slide">'
	returnStr += tempName[0].replace(/_/g,' ') + '</a>'
	return returnStr

}

/*
 * editExperimentFileList 
 * Html for list for edititing the files
 */

snaplabs.ui.editExperimentFileList = function(entry){
	var li = "<li><a class='ui-btn ui-btn-icon-right ui-icon-carat-r' onclick='snaplabs.experimentconfig.loadExperimentConfigFile(\"" + entry.fullPath +"\")'> " + entry.name + "</a> </li>"
	//console.log("DEBUG - going to return " + li)
	return li
}

/*
 * handleExperimentFileList 
 * Html for list for edititing the files
 */

snaplabs.ui.handleExperimentFileList = function(entry){
	var li = "<li><a class='ui-btn ui-btn-icon-right ui-icon-carat-r' onclick='snaplabs.file.handleExperimentFile(\"" + entry.fullPath +"\")'> " + entry.name + "</a> </li>"
	//console.log("DEBUG - going to return " + li)
	return li
}


/*
 * handleSavedDataFileList 
 * Html for list for handling saved data files the files
 */

snaplabs.ui.handleSavedDataFileList = function(entry){
	var li = "<li><a class='ui-btn ui-btn-icon-right ui-icon-carat-r' onclick='snaplabs.file.handleSavedDataFile(\"" + entry.fullPath +"\")'> " + entry.name + "</a> </li>"
	//console.log("DEBUG - going to return " + li)
	return li
}

/*
 * handleSensortagFileList 
 * Html for list for handling saved data files the files
 */

snaplabs.ui.handleSensorTagFileList = function(entry){
	var li = "<li><a class='ui-btn ui-btn-icon-right ui-icon-carat-r' onclick='snaplabs.file.handleSensorTagFile(\"" + entry.fullPath +"\")'> " + entry.name + "</a> </li>"
	//console.log("DEBUG - going to return " + li)
	return li
}
/*
* createFileListEntries
* List local experiment files (attept at being generic)
*/
snaplabs.ui.createFileListEntries = function(dirTop, viewID, listHTMLFunction)
{
	//console.log("DEBUG - createFileListEntries - attempting Generic list for user " + snaplabs.session.user )
	//console.log("The function passed is  " + listHTMLFunction )
		
	document.getElementById(viewID).innerHTML="";
	var htmlStr = "";
	var fileStr = "";
	
	// Call the reader.readEntries() until no more results are returned, then read the users own directory.
	var addFileEntry = function(dir) {
		//console.log("DEBUG -  Looking in dir" + dir.fullPath)
		var dirReader = dir.createReader();
		dirReader.readEntries (
			function(results) {
				for (var i = 0; i < results.length; i++) {
					if (results[i].isDirectory === true) {
						// Recursive -- call back into this subdirectory
						// Depending on the user
						//console.log("DEBUG - found directory " + results[i].name + ". Checking user permissions.")
						if(snaplabs.session.role == TEACHER_ROLE || results[i].name == snaplabs.session.user)
						{
							addFileEntry(results[i]);
						}
					} else {
						//console.log("DEBUG - found file " + results[i].name)
						fileStr = listHTMLFunction(results[i]);
						document.getElementById(viewID).innerHTML += fileStr;
					}
				}

				htmlStr += fileStr;
				// add this directory's contents to the status
				if (htmlStr.length = 0) 
				{
					$document.getElementById(viewID).innerHTML = "No investigations are available."
				}
			},snaplabs.file.errorHandler);
	};

	addFileEntry(dirTop); // Start reading dirs.
}



/*
 * createWidgets to create the list of available widgets for experiment design
 */
snaplabs.ui.createWidgets = function()
{
	var widgetList = document.getElementById('widgetset');

	// Clear form
	widgetList.innerHTML = "";

	var collapsibleString = ""
	
	// set up the widgets for the form along with the hidden details they need
	for(var i=0 ;i<sensorList.length;i++) 
	{ 
		collapsibleString += "<div data-role='collapsible' class='selectionpanel'>"
		collapsibleString += 	"<h3>" + sensorList[i] + " Widgets</h3>"
		collapsibleString +=	"<div id='" + sensorList[i] + "_Selection'>"
									// Set Up a Graph Widget
		collapsibleString +=  		"<div itemid='" +sensorList[i] +"_Graph' class='ui-btn ui-btn-inline ui-widget widgetItem ui-widget-content' revert='true' style='position: relative;'>" 
		collapsibleString +=			"<img src='ui/images/graphicon.png' alt='graph' class='widgetimage'><span class='widgetcaption'>" + sensorList[i] + "</span><span class='widgetcaption'> Graph </span>"
										// Set SensorTag 0 to display
		collapsibleString +=			"<input type='hidden' value='on' name='sensorTags[0][connect]'>"
										// Set Graph for Sensor on Tag 0 to display
		collapsibleString +=			"<input type='hidden' value='on' name='sensorTags[0][sensors][" + sensorList[i] + "][graph][graphdisplay]'>"
		collapsibleString +=		"</div> " 
									// Set Up a Data Only Widget
		collapsibleString +=		"<div itemid='" +  sensorList[i] + "_Data' class='ui-btn ui-btn-inline ui-widget widgetItem ui-widget-content' style='position: relative;'>"
		collapsibleString +=			"<img src='ui/images/dataicon.jpg' alt='data' class='widgetimage'><span class='widgetcaption'>" + sensorList[i]+ "</span><span class='widgetcaption'> Data Only </span>" 
										// Set SensorTag 0 to display
		collapsibleString +=			"<input type='hidden' value='on' name='sensorTags[0][connect]'>"
										// Set Sensor on Tag 0 to display
		collapsibleString +=			"<input type='hidden' value='on' name='sensorTags[0][sensors][" + sensorList[i] + "][data][display]'>"
		collapsibleString +=		"</div> " 
									// Set Up a Grid  Widget
		collapsibleString +=		"<div itemid='" +  sensorList[i] + "_Grid' class='ui-btn ui-btn-inline ui-widget widgetItem ui-widget-content' revert='true' style='position: relative;'>"
		collapsibleString +=			"<img src='ui/images/gridicon.png' alt='grid' class='widgetimage'><span class='widgetcaption'> 4x4 " + sensorList[i]+ "</span><span class='widgetcaption'> Grid </span>" 
										// Set SensorTag 0 to display
		collapsibleString +=			"<input type='hidden' value='on' name='sensorTags[0][connect]'>"
										// Set Grid for Sensor on Tag 0 to display as default 4x4
		collapsibleString +=			"<input type='hidden' value='on' name='sensorTags[0][sensors][" + sensorList[i] + "][grid][griddisplay]'>"
		collapsibleString +=			"<input type='hidden' value='4' name='sensorTags[0][sensors][" + sensorList[i] + "][grid][columns]'>"
		collapsibleString +=			"<input type='hidden' value='4' name='sensorTags[0][sensors][" + sensorList[i] + "][grid][rows]'>"
		collapsibleString +=		"</div> " 
		collapsibleString +=	"</div> " 
		collapsibleString += "</div> "  
	}
	
	widgetList.innerHTML += collapsibleString;
	//console.log("DEBUG - widget string is " + collapsibleString)
}


/*
 * buildSensortagConfigHTML 
 * Display SensorTag Config information for each sensortag build using html strings for each sensor and tag
 */ 
snaplabs.ui.buildSensortagConfigHTML = function(id) 
{
	var sensors = sensorList
	var config = document.getElementById('sensortag'+id+'List');

	// Clear form
	config.innerHTML = "";
	// Fields for "Display SensorTag" and "Name of SensorTag"
	config.innerHTML +=	"<div data-role='fieldcontain'><label for='addSensortag" +id +"'><strong>Display SensorTag</strong></label><input type='checkbox' data-role='flipswitch' name='sensorTags["+id+"][connect]' id='addSensortag"+id+"'></div>"
	config.innerHTML += "<label for='sensorTags[" +id +"][title]'><strong>Name of SensorTag:</strong></label><input type='text' name='sensorTags[" +id +"][title]' id='sensorTags" +id +"Name' value='Sensortag " + id +"' onfocus='inputFocus(this)' onblur='inputBlur(this)'/>" 

	
	//onchange='showHideSensortagConfig("+id+")'></div>"

	for(var i=0 ;i<sensors.length;i++){ 
		// Changed to using a temporary string to make this more readable
		var tempString = ""
		tempString += "<hr><p><strong class='sensortitle'>" + sensors[i] + "</strong></p>"
		
		// Data sampling rate 
		/*tempString += 	"<div class='ui-field-contain'>"
		tempString +=  		"<label for='sensorTags[" + id + "][sensors][" + sensors[i] + "][sampleinteval]'>Sampling rate:</label>"
		tempString += 		"<select name='sensorTags[" + id + "][sensors][" + sensors[i] + "][sampleinteval]' id='select-native-1'>"
        tempString += 			"<option value='1000'>1 sample per second</option>"
        tempString += 			"<option value='500'>2 samples per second</option>"
        tempString += 			"<option value='250'>4 samples per second</option>"
        tempString += 			"<option value='100'>10 samples per second</option>"
		tempString += 		"</select>"
		tempString += 	"</div>"*/

		// Additonal parameters depending on sensor
		switch(sensors[i]){
			case "Temperature":
				// Temperature sensor can choose to display ambient and/or IR temp
				tempString += "<fieldset class='ui-grid-a'>"
				tempString += 	"<div class='ui-block-a'>"
				// Flip switch for IR Temperature
				tempString += 		"<label for='sensorTags[" + id + "][sensors][" + sensors[i] + "][parameters][IR]'>Infrared or object temperature:</label>"
				tempString += 		"<input  class='sensortag"+id+"' type='checkbox' data-role='flipswitch' name='sensorTags[" +id + "][sensors][" + sensors[i] + "][parameters][IR]' id='" + sensors[i] + id +"TempIRflip'>"
				tempString += 	"</div>"
				tempString += 	"<div class='ui-block-b'>"
				// Flip switch for ambient Temperature diplay
				tempString += 		"<label for='sensorTags[" + id + "][sensors][" + sensors[i] + "][parameters][ambient]'>Ambient temperature:</label>"
				tempString += 		"<input  class='sensortag"+id+"' type='checkbox' data-role='flipswitch' name='sensorTags[" +id + "][sensors][" + sensors[i] + "][parameters][ambient]' id='" + sensors[i] + id +"TempAmbientflip'>"
				tempString += 	"</div>"
				tempString += "</fieldset>"
				break;
			case "Magnetometer":
			case "Accelerometer":
				// 3 axis sensors can choose to display xyz axis and/or scalar values 
				tempString += "<fieldset class='ui-grid-a'>"
				tempString += 	"<div class='ui-block-a'>"
				// Flip switch for IR Temperature
				tempString += 		"<label for='sensorTags[" + id + "][sensors][" + sensors[i] + "][parameters][xyz]'>x-y-z axis values:</label>"
				tempString += 		"<input  class='sensortag"+id+"' type='checkbox' data-role='flipswitch' name='sensorTags[" +id + "][sensors][" + sensors[i] + "][parameters][xyz]' id='" + sensors[i] + id +"XYZflip'>"
				tempString += 	"</div>"
				tempString += 	"<div class='ui-block-b'>"
				// Flip switch for ambient Temperature diplay
				tempString += 		"<label for='sensorTags[" + id + "][sensors][" + sensors[i] + "][parameters][ambient]'>Scalar:</label>"
				tempString += 		"<input  class='sensortag"+id+"' type='checkbox' data-role='flipswitch' name='sensorTags[" +id + "][sensors][" + sensors[i] + "][parameters][scalar]' id='" + sensors[i] + id +"Scalarflip'>"
				tempString += 	"</div>"
				tempString += "</fieldset>"
				break;
		}

		// Side by side flip switches for display and data options
		// Common to all sensors
		tempString += "<fieldset class='ui-grid-c'>"
			tempString += "<div class='ui-block-a'>"
				// Flip switch for data display
				tempString += "<label for='sensorTags[" + id + "][sensors][" + sensors[i] + "][data][display]'>Data:</label>"
				tempString += "<input  class='sensortag"+id+"' type='checkbox' data-role='flipswitch' name='sensorTags[" +id + "][sensors][" + sensors[i] + "][data][display]' id='" + sensors[i] + id +"flip' onchange='snaplabs.ui.showHideLabel(\"" + sensors[i] + id + "label\")'>"
			tempString += "</div>"
			tempString += "<div class='ui-block-b'>"
				// Flip switch for graph diplay
				tempString += "<label for='sensorTags[" + id + "][sensors][" + sensors[i] + "][graph]'>Graph:</label>"
				tempString += "<input  class='sensortag"+id+"' type='checkbox' data-role='flipswitch' name='sensorTags[" +id + "][sensors][" + sensors[i] + "][graph][graphdisplay]' id='" + sensors[i] + id +"flipGraph' style='display:none' onchange='snaplabs.ui.showHideLabel(\"" + sensors[i] + id + "labelGraph\")'> "
			tempString += "</div>"
			tempString += "<div class='ui-block-c'>" 
				// Flip switch for grid diplay
				tempString += "<label for='sensorTags[" + id + "][sensors][" + sensors[i] + "][grid][griddisplay]'> Grid:</label>"
				tempString += "<input  class='sensortag"+id+"' type='checkbox' data-role='flipswitch' name='sensorTags[" +id + "][sensors][" + sensors[i] + "][grid][griddisplay]' id='" + sensors[i] + id +"flipGrid' style='display:none' onchange='snaplabs.ui.snaplabs.ui.showHideLabel(\"" + sensors[i] + id + "GridConfig\")'> "
			tempString += "</div>"
			tempString += "<div class='ui-block-d'>" 
				// Flip switch for graph diplay
				tempString += "<label for='sensorTags[" + id + "][sensors][" + sensors[i] + "][captureOnClick]'> Capture on Click:</label>"
				tempString += "<input  class='sensortag"+id+"' type='checkbox' data-role='flipswitch' name='sensorTags[" +id + "][sensors][" + sensors[i] + "][captureOnClick]' id='" + sensors[i] + id +"flipCaptureOnClick' style='display:none'> "
			tempString += "</div>"
		tempString += "</fieldset>"
		


		// Label for the  data 
		tempString += "<div id='"+ sensors[i] + id + "label' style='display:none' >" 
			tempString += "<label for='sensorTags[" +id +"][sensors][" + sensors[i] + "][data][label]'>"  + sensors[i] + " Data Label:</label>"
			tempString += "<input type='text' name='sensorTags[" +id +"][sensors][" + sensors[i] + "][data][label]' value='' placeholder='"+ sensors[i] + " Label'/>"
		tempString += "</div>"
			
		// Labels for the graph, graph type 
		tempString += "<div id='"+ sensors[i] + id + "labelGraph' style='display:none' >" 
		// Graph Type
		tempString += "<div class='ui-field-contain'>"
		tempString += 	"<label for='sensorTags[" +id +"][sensors][" + sensors[i] + "][graph][graphType]'>Graph Type:</label>"
		tempString += 	"<select name='sensorTags[" +id +"][sensors][" + sensors[i] + "][graph][graphType]'>"
		tempString +=  		"<option value='spline'>Smoothed Line Graph</option>"
		tempString +=  		"<option value='line'>Line Graph</option>"
		tempString +=  		"<option value='scatter'>Scatter Graph</option>"
		tempString +=  		"<option value='area'>Area Graph</option>"
		tempString += 	"</select>"
		tempString += "</div>"
		// Graph Title
		tempString += "<label for='sensorTags[" +id +"][sensors][" + sensors[i] + "][graph][graphTitle]'>"  + sensors[i] + " Graph Title:</label>"
		tempString += "<input type='text' name='sensorTags[" +id +"][sensors][" + sensors[i] + "][graph][graphTitle]' value='' placeholder='"+ sensors[i] + " Graph Label'/>"
		// Graph x-axis
		tempString += "<label for='sensorTags[" +id +"][sensors][" + sensors[i] + "][graphXAxis]'>"  + sensors[i] + " X Axis Title:</label>"
		tempString += "<input type='text' name='sensorTags[" +id +"][sensors][" + sensors[i] + "][graph][graphXAxis]' value='' placeholder='"+ sensors[i] + " Graph X Axis Label'/>"
		// Graph y-axis
		tempString += "<label for='sensorTags[" +id +"][sensors][" + sensors[i] + "][graph][graphYAxis]'>"  + sensors[i] + " Y Axis Title:</label>"
		tempString += "<input type='text' name='sensorTags[" +id +"][sensors][" + sensors[i] + "][graph][graphYAxis]' value='' placeholder='"+ sensors[i] + " Graph Y Axis Label'/>"
		tempString += "</div>"

		//Configuration for the grid
		tempString += "<div id='"+ sensors[i] + id + "GridConfig' style='display:none' >" 
		tempString += 	"<div class='ui-field-contain'>"
		tempString += 		"<label for='sensorTags[" + id + "][sensors][" + sensors[i] + "][grid][columns]'>Columns:</label>"
		tempString += 			"<select name='sensorTags[" + id + "][sensors][" + sensors[i] + "][grid][columns]'>"
		for(var j=2 ;j<6;j++){ 
			tempString +=		"<option value='" +j +"'>" +j +"</option>"
		}
		tempString += 		"</select>"
		tempString += 	"</div>"
		tempString += 	"<div class='ui-field-contain'>"
		tempString += 		"<label for='sensorTags[" + id + "][sensors][" + sensors[i] + "][grid][rows]'>Rows:</label>"
		tempString += 			"<select name='sensorTags[" + id + "][sensors][" + sensors[i] + "][grid][rows]'>"
		for(var k=1 ;k<11;k++){ 
			tempString +=		"<option value='" +k +"'>" +k +"</option>"
		}
		tempString += 		"</select>"
		tempString += "</div>"
			
		
		config.innerHTML += tempString
	}
}


snaplabs.ui.showSensorTagConfigFile = function(sensorData)
{
	//var sensorData = fileData.sensortagMapping;
	var fileOutput = document.getElementById('sensortagConfigFileData');
	fileOutput.innerHTML = "<h2>Current SensorTag Configuration Information:</h2>"; 
	fileOutput.innerHTML += "<b>Institution: </b>" + sensorData.institution + "<br />"; 
	fileOutput.innerHTML += "<b>Owner: </b>" + sensorData.owner + "<br /><br />"; 
	for(sensor in sensorData.sensortags){
		fileOutput.innerHTML += sensorData.sensortags[sensor] + " : " + sensor + "<br />"; 
	}
	snaplabs.ui.showElementView('sensortagConfigHideButton')
	snaplabs.ui.hideElementView('sensortagConfigShowButton')
}

/* 
 * Hide the SensorTag Configuration file
 */
snaplabs.ui.hideSensorTagConfigFile = function() 
{
	// Hide the file data 
	document.getElementById('sensortagConfigFileData').innerHTML = ''
	//Change the buttons to show the file
	snaplabs.ui.hideElementView('sensortagConfigHideButton')
	snaplabs.ui.showElementView('sensortagConfigShowButton')
}

/*
* Present different labels depenting on flipswitch setting
*/


snaplabs.ui.showHideLabel = function(labelID) 
{
	if($("#"+labelID).css('display') === 'none'){
		document.getElementById(labelID).style.display = 'block'
	}
	else{
		document.getElementById(labelID).style.display = 'none'
	}
} 
 
snaplabs.ui.displayValue = function(elementId, value)
{
	//console.log("DEBUG - trying to set value to " + value)
	if(document.getElementById(elementId))
		document.getElementById(elementId).innerHTML = value
}
 
 // Display the device list.
snaplabs.ui.displayDeviceList = function()
{
	// Clear device list.
	$('#found-devices').empty();

	var timeNow = Date.now();

	$.each(snaplabs.devices.found, function(key, device)
	{
		// Only show devices that are updated during the last 10 seconds.
		if (device.timeStamp + 10000 > timeNow)
		//if(true)
		{
			// Map the RSSI value to a width in percent for the indicator.
			var rssiWidth = 100; // Used when RSSI is zero or greater.
			if (device.rssi < -100) { rssiWidth = 0; }
			else if (device.rssi < 0) { rssiWidth = 100 + device.rssi; }

			// Create tag for device data.
			var element = $(
				'<br>'
				// Do not show address on iOS since it can be confused
				// with an iBeacon UUID. 
				// +	(evothings.os.isIOS() ? '' : device.address) 
				//+	device.rssi + '<br />'
				//+ 	'<div style="background:rgb(225,0,0);height:20px;width:'
				//+ 		rssiWidth + '%;"></div>'
				+ '<button id="' + key +'Connect" data-inline="true" onclick="snaplabs.devices.addDeviceToConfig(\'' + key + '\')" class="asellbrightgreen"> <strong> press to connect to ' + device.name + '</strong> </button>' 
				+ '<button id="' + key +'Disconnect" data-inline="true" onclick="snaplabs.devices.disconnect(\'' +  key + '\')" class="asellred" style="display:none"> <strong> Disconnect </strong> </button>'
				+ 	'<div style="background:rgb(225,0,0);height:20px;width:'
				+ 		rssiWidth + '%;"></div>'
				+ '</br>'
			);
			$('#found-devices').append(element);
			console.log("DEBUG - List - Found element with " + key + " and  details " + JSON.stringify(device))
		} 
	}); 
};


 // Display the device list.
snaplabs.ui.displayConnectionSelectList = function()
{
	// Clear device list.
	$('#popupConnectionList').empty();

	var topElement = $(
	 '<span data-role="list-divider">Scanning - select a device:</span>'
	 + '<li><a  onclick=\'snaplabs.devices.connectToAllDevicesExperiment()\'>Nearest Device</a></li>'
	);
	$('#popupConnectionList').append(topElement);

	console.log("DEBUG - updating connec	tion popup list")
			
	var timeNow = Date.now();

	$.each(snaplabs.devices.found, function(key, device)
	{

		// Only show devices that are updated during the last 10 seconds.
		if (device.timeStamp + 10000 > timeNow)
		//if(true)
		{
			// Find if the device is in the sensortag mapping file
			// This may only apply to ANDROID
			var tagName =  snaplabs.sensortagconfig.lookUpSensortagMapping(device.address)
			if (tagName == "Unnamed Tag")
			{
				tagName = device.address
			}
			

			// Create tag for device data.
			var element = $(
			    '<li><a  onclick=\'snaplabs.devices.connectToDeviceExperiment("' + device.address + '",0)\'>' + tagName + '</a></li>'

			);

		
			$('#popupConnectionList').append(element);
			var el = document.getElementById('popupConnectionList');
			var elementHtml = el.innerHTML;
				console.log("DEBUG - element is: " + elementHtml)			
		} 
	}); 

	
};
// Display a status message for sensortag scanning
snaplabs.ui.displayStatus = function(message)
{
	$('#scan-status').html(message);
};

 
/*
* listFilesInDiv
* An attempt to make this a generic function (can be used for other lists too, not only collapsible)
*/
snaplabs.ui.listFilesInDiv = function(dirType, viewID, listHTMLFunction)
{
	//console.log("DEBUG - View ID is " + viewID + ", function is " + listHTMLFunction + " and dir type  is " + dirType)
	var dir;
	switch(dirType)
	{
		case "EXPERIMENT_DIR":
			dir = snaplabs.storage.experimentConfigDir
			//snaplabs.session.role == TEACHER_ROLE ? dir = snaplabs.storage.experimentConfigDir : dir = snaplabs.storage.userExperimentConfigDir
			break;
		case "SAVEDDATA_DIR":
			dir = snaplabs.storage.savedDataDir
			//snaplabs.session.role == TEACHER_ROLE ? dir = snaplabs.storage.savedDataDir : dir = snaplabs.storage.userSavedDataDir
			break;
		case "SENSORTAG_DIR":
			dir = snaplabs.storage.sensortagConfigDir
			//snaplabs.session.role == TEACHER_ROLE ? dir = snaplabs.storage.sensortagConfigDir  : dir = snaplabs.storage.userSensortagConfigDir 
			break;
		default:
			snaplabs.session.role == TEACHER_ROLE ? dir = snaplabs.storage.experimentDir : dir = snaplabs.storage.userExperimentDir
			console.log("DEBUG - Default case. Received " + dirType + " and set " + dir.fullPath)
			break;
	}
	document.getElementById(viewID).innerHTML="";
	//console.log("DEBUG - Dir path is " + dir.fullPath)

	snaplabs.ui.createFileListEntries(dir, viewID, listHTMLFunction)

}
 
 /*
 * Show element view
 */
snaplabs.ui.showElementView = function(el) {
	document.getElementById(el).style.display = "block";
}

/*
 * Hide element view
 */
snaplabs.ui.hideElementView = function(el) {
	document.getElementById(el).style.display = "none";
}

 /*
 * Show element view inline
 */
snaplabs.ui.showElementViewInline = function(el) {
	document.getElementById(el).style.display = "inline";
}

 


snaplabs.ui.changeButtonColour  = function(elementId, value)
{
	document.getElementById(elementId).className= value;
}

snaplabs.ui.setBackgroundColor = function(color)
{
	document.documentElement.style.background = color
	document.body.style.background = color
}