/*
 * ExperimentApp.js
 * Contains the functions and logic for NERLD Gen 2 app for loading and running experiments
 * This file includes the file handling for download and reading experiment configuration files.
 * 
 */
 
// Data from experiment config file
var expConfigData
// Experiment Configuration File For display
var experimentSensorDisplay = []
var captureOnClickValue = [] // variable to store values for each sensor configured as capture on click showing whether the
captureOnClickValue.initialised = false;

// SensorTag Configuration File 
var sensortagMappingData
var workingDir; 		//Directory Entry for experiment config failes
var savedDataDir; 		//Directory Entry for saved data files
var expConfigDirectoryName = "ExperimentAppConfigFiles";
var sensortagConfigDirectoryName = "SensortagMapingConfigFiles"
var sensortagPackagedFile = "sensorTagConfigDefault.json";
var sensortagConfigDefaultFileName = "sensorTagConfig.json";
var savedDataDirectoryName = "SavedDataFiles";
var sensorFile; 			// Sensortag Config File (FileEntry)
var sensorFileWriter; 	// Filewriter for the sensortag config file
 
function onDeviceReady() {
	
			
	// Get the File system for writing the experiment configuration file
	window.resolveLocalFileSystemURL(cordova.file.dataDirectory, function(dir) {
		
	
		 dir.getDirectory(expConfigDirectoryName, { create: true }, function (dirEntry) {
			// Setting up the files and directories
			workingDir = dirEntry;
			document.getElementById("experimentConfigDirSetting").innerHTML = workingDir.fullPath;
			// To fill the html with values before starting
			//listExperimentConfigFiles('localFileList');
		 }, errorHandler); 

	}, errorHandler);	

	
	// File System for writing sensortag mapping files
	window.resolveLocalFileSystemURL(cordova.file.dataDirectory, function(dir) {
		 dir.getDirectory(sensortagConfigDirectoryName, { create: true }, function (dirEntry) {
			// Setting up the files and directories
			sensortagConfigDir = dirEntry;
			document.getElementById("sensortagConfigDirSetting").innerHTML = sensortagConfigDir.fullPath;
			// Read Default Sensortag file in this directory as a start if it exisits
			readAndWritePackagedConfigFile(sensortagPackagedFile, sensortagPackagedFile)
		}, errorHandler);  
	}, errorHandler);
	
	// This is saved to external Data - will need a different solution for iOS
	window.resolveLocalFileSystemURL(cordova.file.externalDataDirectory, function(dir) {
		dir.getDirectory(savedDataDirectoryName, { create: true }, function (dirEntry) {
			// Setting up the files and directories
			savedDataDir = dirEntry;
			document.getElementById("savedDataFileDirSetting").innerHTML = savedDataDir.fullPath;
			// To fill the html with values before starting
			//listSavedDataFiles('savedDataFileList');

		}, errorHandler); 
	}, errorHandler);	

	// To open files with .json extension
	var HandleIntent = function (Intent) {
		console.log("DEBUG - intent is: " + JSON.stringify(Intent) + " with data " + Intent.data);
		// With intent you'll do almost everything        

		if(Intent.hasOwnProperty('data')){
			var oldFilename = Intent.data.split("/").pop();
			var newFilename = oldFilename
			var fileType = "expConfig"
			if(newFilename.includes("sensorTagConfig.json"))
			{
				fileType = "sensorTagConfig"
				var d = new Date();
				var filepart = formatDateToString(d)
				newFilename = "sensorTagConfig_" + filepart + ".json"
			}
			
			if(!oldFilename.includes(".json"))
			{
				navigator.notification.alert(
					'Cannot open the file. If you have opened this from a mail attachment, please try downloading the file to local storage and opening again.', // message
					alertDismissed,         // callback
					'Error',            // title
					'OK'                  // buttonName
				);
			}
			else
			{
				navigator.notification.confirm(
					'Would you like to open and save the file ' + oldFilename +'?', // message
					 function(button) {
						if ( button == 1 ) {
							// User selected to View file
							console.log("DEBUG - chose to open with data: " + Intent.data)

							if(fileType=="expConfig")
							{
								window.resolveLocalFileSystemURL(Intent.data, function(mediaDir) {
									mediaDir.copyTo(workingDir, newFilename, function(e) {
										console.log("DEBUG - File successfully copied: " + newFilename)	
									}, function(e) {
										console.log("DEBUG - Error in file copy: " + newFilename)	
									});                 
								});
								window.location.href="#pageExperiment"
								readConfigFile(workingDir, newFilename)
							}
							if(fileType=="sensorTagConfig")
							{
								window.resolveLocalFileSystemURL(Intent.data, function(mediaDir) {
									mediaDir.copyTo(sensortagConfigDir, newFilename, function(e) {
										console.log("DEBUG - File successfully copied: " + newFilename)	
										alert("The SensorTag mapping file has been saved as " + newFilename + ". It can now be selected and loaded if required.")
									}, function(e) {
										console.log("DEBUG - Error in file copy: " + newFilename)	
									});                 
								});
								window.location.href="#pageSettings"
							}
						}
						if ( button == 2 ) {
							console.log("DEBUG - chose to cancel")
						}
					 },           // callback to invoke with index of button pressed
					"Open file",           // title
					['Open','Cancel']     // buttonLabels
				);		 
			}
       }else{ 
			// this will happen in getCordovaIntent when the app starts and there's no
			// active intent
			console.log("The app was opened manually and there's no file to open");
       }
	};
	
	// Handle the intent when the app is open
	// If the app is running in the background, this function
	// will handle the opened file
	window.plugins.intent.setNewIntentHandler(HandleIntent);
	
	// Handle the intent when the app is not open
	// This will be executed only when the app starts or wasn't active
	// in the background
	window.plugins.intent.getCordovaIntent(HandleIntent, function () {
		alert("Error: Cannot open file with intent");
	});
}

function copySuccess(entry) {
    console.log("New Path: " + entry.fullPath);
}

function copyFail(error) {
    alert(error.code);
}

/*
 * Downloading files from Teacher App server
 * Data retrieved from form and used to download the file
 * 
 */
getExperimentConfigFile = function() 
{
	var ipAddress
	var dataObjTemp = $('#downloadForm').serializeJSON();
	console.log("DEBUG - going to get " + dataObjTemp.serverURL)
	dataObjTemp.serverURL === "other" ? ipAddress = dataObjTemp.newServerURL : ipAddress = dataObjTemp.serverURL;
	downloadExpConfigLocal(ipAddress, dataObjTemp.configFileName)
}

/*
 * Downloading files from specified server in the form
 * Data retrieved from form and used to download the file
 * 
 */
getConfigFile = function(fileType, form) 
{
	var dir = workingDir // default value is for experiment data
	var dataObjTemp = $(form).serializeJSON();
	var ipAddress
	if(fileType == 'sensortagConfig')
	{
		dir = sensortagConfigDir // override with sensortag mapping dir
		//dir = sensortagConfigDir // override with sensortag mapping dir
		dataObjTemp.sensorServerURL === "other" ? ipAddress = dataObjTemp.newSensorServerURL : ipAddress = dataObjTemp.sensorServerURL;
		if(dataObjTemp.sensorServerURL === "other")
		{		
			tempAddress = dataObjTemp.newSensorServerURL
			ipAddress= "http://" + tempAddress + ":8080/"
		}
		else
		{
			ipAddress = dataObjTemp.sensorServerURL;
		}
	} 
	else
	{
		if(dataObjTemp.serverURL === "other")
		{		
			tempAddress = dataObjTemp.newServerURL
			ipAddress= "http://" + tempAddress + ":8080/"
		}
		else
		{
			ipAddress = dataObjTemp.serverURL;
		}

		//dataObjTemp.serverURL === "other" ? ipAddress = dataObjTemp.newServerURL : ipAddress = dataObjTemp.serverURL;
	}
	console.log("DEBUG - specified server is  " + dataObjTemp.newServerURL)
	console.log("DEBUG - going to get " +ipAddress )
	downloadConfig(ipAddress, dataObjTemp.configFileName, dir)
}
/*
 * Loading file hosted on AWS S3 as above
 * 
 */
loadExpConfig = function()  
{
    $.ajax({ 
            url: expConfigURLAWS,
            jsonpCallback: "callback",
            cache: false,
            dataType: "jsonp",
            success: function(response){
				if('experimentConfig' in response){
					experimentConfiguration(response.experimentConfig);
				}
				else{
					alert('Malformed json...');
				}
			}
    });   
}


/*
 * Generic config download and save to directory
 * 
 */ 
downloadConfig = function(ipAddress, fileName, dir, callback) 
{ 
    var fileTransfer = new FileTransfer();
	configURLLocal = ipAddress + fileName;
	console.log("Getting File: " + configURLLocal)
	
    fileTransfer.download(configURLLocal, cordova.file.dataDirectory + dir.fullPath + fileName, 
        function(entry) {
			navigator.notification.alert(
				'File ' + fileName + ' has been downloaded to directory ' + dir.fullPath, // message
				alertDismissed,         // callback
				'Success',            // title
				'OK'                  // buttonName
				);
        }, 
        function(err) {
			navigator.notification.alert(
				'The failed to download. Please check error and try again.\n\n' + (err.body != null ? err.body + " " + 
				err.exception : err.exception),  // message
				alertDismissed,         // callback
				'Error',            // title
				'OK'                  // buttonName
				);
			console.log("File download error: " + JSON.stringify(err))
    });
}

/*
 * Download file hosted on a local Teacher app or AWS and save to directory
 * 
 */
downloadExpConfigLocal = function(ipAddress, fileName, callback) 
{ 
    var fileTransfer = new FileTransfer();
	expConfigURLLocal = ipAddress + fileName;
	console.log("Getting File: " + expConfigURLLocal)
	
    fileTransfer.download(expConfigURLLocal, cordova.file.dataDirectory + workingDir.fullPath + fileName, 
        function(entry) {
			navigator.notification.alert(
				'File ' + fileName + ' has been downloaded to directory ' + workingDir.fullPath, // message
				alertDismissed,         // callback
				'Success',            // title
				'OK'                  // buttonName
				);
        }, 
        function(err) {
			navigator.notification.alert(
				'The failed to download. Please check error and try again.\n\n' + (err.body != null ? err.body + " " + 
				err.exception : err.exception),  // message
				alertDismissed,         // callback
				'Error',            // title
				'OK'                  // buttonName
				);
			console.log("File download error: " + JSON.stringify(err))
    });
}
  

/*
 * Functions to list files in a directory
 * (Based on http://www.html5rocks.com/en/tutorials/file/filesystem/#toc-file)
 */
/*
* listFilesInCollapsible
* An attempt to make this a generic function
*/
listFilesInCollapsible = function(viewID, listFunction, dirName)
{
	//console.log("DEBUG - View ID is " + viewID + ", function is " + listFunction + " and dir name is " + dirName)
	var dirEntry = workingDir
	switch (dirName)
	{
		case "workingDir":
			dirEntry = workingDir
			break;
		case "sensortagConfigDir":
			dirEntry = sensortagConfigDir
			break;
		case "savedDataDir":
			dirEntry = savedDataDir
			break;
	}
	document.getElementById(viewID).innerHTML="";
	getFileList(dirEntry, dirName, viewID, updateCollapsibleList, listFunction);
}

function getFileList(dir, dirName, viewID, callback, listFunction) {
  var dirReader = dir.createReader();
  var entries = [];
  console.log("DEBUG - getting file list for: " + dir.fullPath + " to put in " + viewID)

  // Call the reader.readEntries() until no more results are returned.
  var readEntries = function() {
     dirReader.readEntries (function(results) {
      if (!results.length) {
        callback(entries.sort(), viewID, dirName, listFunction);
      } else {
        entries = entries.concat(toArray(results));
        readEntries();
      }
    }, errorHandler);
  };

  readEntries(); // Start reading dirs.
}

function updateCollapsibleList(entries, viewID, dir, listFunction) {
  // Document fragments can improve performance since they're only appended
  // to the DOM once. Only one browser reflow occurs.
  //var fragment = document.createDocumentFragment();

  entries.forEach(function(entry, i) {
    //var li = document.createElement('li');
    //li.innerHTML = ['<a class=" ui-icon-grid" onclick="loadExpConfig()">', entry.name, '</a>'].join('');
	var li = "<li><a class='ui-btn ui-btn-icon-right ui-icon-carat-r' onclick='"+ listFunction + "(" + dir + ", \"" + entry.name +"\")'> " + entry.name + "</a> </li>"
	console.log("DEBUG - Engtry is: " + li)
    document.getElementById(viewID).innerHTML += li;
  }); 
}



/*
 * Functions to list files in a directory
 * (Based on http://www.html5rocks.com/en/tutorials/file/filesystem/#toc-file)
 */

listExperimentConfigFiles = function(viewID)
{
	//console.log("DEBUG - View ID is " + viewID)
	document.getElementById(viewID).innerHTML="";
	getFileList(workingDir, viewID, listExpConfigResults);
}

listExperimentConfigFilesToDelete = function(viewID)
{
	//console.log("DEBUG - View ID is " + viewID)
	document.getElementById(viewID).innerHTML="";
	getFileList(workingDir, viewID, listDeleteExpConfigFiles);
}

listSavedDataFiles = function(viewID)
{  
	//console.log("DEBUG - View ID is " + viewID)
	document.getElementById(viewID).innerHTML="";
	getFileList(savedDataDir, viewID, listSavedDataResults);
}

listSavedDataFilesToDelete = function(viewID)
{
	//console.log("DEBUG - View ID is " + viewID)
	document.getElementById(viewID).innerHTML="";
	getFileList(savedDataDir, viewID, listDeleteSavedDataFiles);
}

listSensortagConfigFiles = function(viewID)
{
	//console.log("DEBUG - View ID is " + viewID)
	document.getElementById(viewID).innerHTML="";
	getFileList(sensortagConfigDir, viewID, listSensortagConfigResults);
}

listSensortagConfigFilesToDelete = function(viewID)
{
	//console.log("DEBUG - View ID is " + viewID)
	document.getElementById(viewID).innerHTML="";
	getFileList(sensortagConfigDir, viewID, listDeleteSensortagConfigFiles);
}
function toArray(list) {
  return Array.prototype.slice.call(list || [], 0);
}

function listExpConfigResults(entries, viewID) {
  // Document fragments can improve performance since they're only appended
  // to the DOM once. Only one browser reflow occurs.
  //var fragment = document.createDocumentFragment();

  entries.forEach(function(entry, i) {
    //var li = document.createElement('li');
    //li.innerHTML = ['<a class=" ui-icon-grid" onclick="loadExpConfig()">', entry.name, '</a>'].join('');
	
	var li = "<li><a class='ui-btn ui-btn-icon-right ui-icon-carat-r' href=\"#pageExperiment\" onclick='readConfigFile(workingDir,\"" + entry.name +"\")'> " + entry.name + "</a> </li>"
    //console.log("DEBUG - testing li entry: " + li)
	document.getElementById(viewID).innerHTML += li;
  }); 
   //console.log("DEBUG - testing all entries: " + document.getElementById(viewID).innerHTML)
}

function listDeleteExpConfigFiles(entries, viewID) {
  // Document fragments can improve performance since they're only appended
  // to the DOM once. Only one browser reflow occurs.
  //var fragment = document.createDocumentFragment();

  entries.forEach(function(entry, i) {
    //var li = document.createElement('li');
    //li.innerHTML = ['<a class=" ui-icon-grid" onclick="loadExpConfig()">', entry.name, '</a>'].join('');
	var li = "<li><a class='ui-btn ui-btn-icon-right ui-icon-carat-r' href=\"#pageSettings\" onclick='deleteExperimentFile(\"" + entry.name +"\")'> " + entry.name + "</a> </li>"
    document.getElementById(viewID).innerHTML += li;
  }); 
}

function listSensortagConfigResults(entries, viewID) {
  // Document fragments can improve performance since they're only appended
  // to the DOM once. Only one browser reflow occurs.
  //var fragment = document.createDocumentFragment();

  entries.forEach(function(entry, i) {
    //var li = document.createElement('li');
    //li.innerHTML = ['<a class=" ui-icon-grid" onclick="loadExpConfig()">', entry.name, '</a>'].join('');
	var li = "<li><a class='ui-btn ui-btn-icon-right ui-icon-carat-r' onclick='readConfigFile(sensortagConfigDir, \"" + entry.name +"\")'> " + entry.name + "</a> </li>"
    document.getElementById(viewID).innerHTML += li;
  }); 
}

function listDeleteSensortagConfigFiles(entries, viewID) {
  // Document fragments can improve performance since they're only appended
  // to the DOM once. Only one browser reflow occurs.
  //var fragment = document.createDocumentFragment();

  entries.forEach(function(entry, i) {
    //var li = document.createElement('li');
    //li.innerHTML = ['<a class=" ui-icon-grid" onclick="loadExpConfig()">', entry.name, '</a>'].join('');
	var li = "<li><a class='ui-btn ui-btn-icon-right ui-icon-carat-r' href=\"#pageSettings\" onclick='deleteSensortagConfigFile(\"" + entry.name +"\")'> " + entry.name + "</a> </li>"
    document.getElementById(viewID).innerHTML += li;
  }); 
}
function listSavedDataResults(entries, viewID) {
  // Document fragments can improve performance since they're only appended
  // to the DOM once. Only one browser reflow occurs.
  //var fragment = document.createDocumentFragment();

  entries.forEach(function(entry, i) {
    //var li = document.createElement('li');
    //li.innerHTML = ['<a class=" ui-icon-grid" onclick="loadExpConfig()">', entry.name, '</a>'].join('');
	var li = "<li><a class='ui-btn ui-btn-icon-right ui-icon-carat-r' onclick='viewSavedDataFile(\"" + entry.fullPath +"\")'> " + entry.name + "</a> </li>"
    document.getElementById(viewID).innerHTML += li;
	//console.log("DEBUG - added entry: " + entry.name + ". List code is " + li)
  }); 
}

function listDeleteSavedDataFiles(entries, viewID) {

  entries.forEach(function(entry, i) {
    //var li = document.createElement('li');
    //li.innerHTML = ['<a class=" ui-icon-grid" onclick="loadExpConfig()">', entry.name, '</a>'].join('');
	var li = "<li><a class='ui-btn ui-btn-icon-right ui-icon-carat-r' onclick='deleteSavedDataFile(\"" + entry.name +"\")'> " + entry.name + "</a> </li>"
    document.getElementById(viewID).innerHTML += li;
	//console.log("DEBUG - added entry to delete list: " + entry.name + ". List code is " + li)
  }); 
}

/*function getFileList(dir, viewID, callback) {
  var dirReader = dir.createReader();
  var entries = [];
  //console.log("DEBUG - getting file list for: " + dir.fullPath + " to put in " + viewID )

  // Call the reader.readEntries() until no more results are returned.
  var readEntries = function() {
     dirReader.readEntries (function(results) {
      if (!results.length) {
        callback(entries.sort(), viewID);
      } else {
        entries = entries.concat(toArray(results));
        readEntries();
      }
    }, errorHandler);
  };

  readEntries(); // Start reading dirs.
}*/

/*
 * saveExperimentConfig.  
 * Save the downloaded experiment string to a file of the same name locally 
 * 
 */
saveExperimentConfig = function(data,fileName) 
{
	console.log("DEBUG - Data to write: " + JSON.stringify(data))
	console.log("DEBUG - file to write: " + fileName + " to  dir " + workingDir.fullPath)
	var isAppend = false;
			
    workingDir.getFile(fileName, {create: true, exclusive: false}, function(fileEntry) {
        writeTextToFile(fileEntry, JSON.stringify(data), isAppend);
    }, errorHandler);
	
}

/*
 * Writing text string to a file
 * (Based https://cordova.apache.org/docs/en/latest/reference/cordova-plugin-file/index.html)
 */
function writeTextToFile(fileEntry, dataString, isAppend) {
    // Create a FileWriter object for our FileEntry (log.txt).
    fileEntry.createWriter(function (fileWriter) {


        fileWriter.onwriteend = function() {
            //console.log("DEBUG - Successful file write (writeTextToFile) to file " + fileEntry.fullPath);
            //readFile(fileEntry);
        };

        fileWriter.onerror = function (e) {
            console.log("Failed file write (writeTextToFile): " + e.toString());
        };

        // If we are appending data to file, go to the end of the file.
        if (isAppend) {
            try {
                fileWriter.seek(fileWriter.length);
            }
            catch (e) {
                console.log("file doesn't exist!");
            }
        }
		tempFileWriter = fileWriter;
		var blob = new Blob([dataString], {type:'text/plain'});
        fileWriter.write(blob);
    });
}

/*
 * Deleteing experiment File
 * NOTE - this has been updated to view, share or delete!
 */
 function handleExperimentFile(dir, fileName) {
	navigator.notification.confirm(
		'Would you like to view, share or delete this file?', // message
		 function(button) {
			console.log("DEBUG - Experiment File handling for file " + fileName)
			if ( button == 1 ) {
				// User selected to View file
				window.location.href="#pageData"
				displayValue("filenameTitle",fileName)
				readAndDumpFile(fileName, workingDir)
			}
			if ( button == 2 ) {
				socialShareFile(dir,fileName)
			}
			if ( button == 3 ) {
				deleteFile(workingDir,fileName);
				listFilesInCollapsible('handleExperimentFileList', 'handleSavedDataFile','workingDir')
			}
		 },           // callback to invoke with index of button pressed
		fileName,           // title
		['View','Share', 'Delete']     // buttonLabels
	);
}

/*
 * Deleteing sensortag config File
 * NOTE - this has been updated to view, share or delete!
 */
 function handleSensortagConfigFile(dir, fileName) {
	navigator.notification.confirm(
		'Would you like to view, share or delete this file?', // message
		 function(button) {
			console.log("DEBUG - Sensortag File handling for file " + fileName)
			if ( button == 1 ) {
				// User selected to View file
				window.location.href="#pageData"
				displayValue("filenameTitle",fileName)
				readAndDumpFile(fileName, sensortagConfigDir)
			}
			if ( button == 2 ) {
				socialShareFile(dir,fileName)
			}
			if ( button == 3 ) {
				deleteFile(sensortagConfigDir,fileName);
				listFilesInCollapsible('handleSensortagConfigFileList','handleSensortagConfigFile','sensortagConfigDir')
			}
		 },           // callback to invoke with index of button pressed
		fileName,           // title
		['View','Share', 'Delete']     // buttonLabels
	);
}

/*
 * Deleting a saved Data file
 * (Based on https://gist.github.com/deedubbu/1590941)
 * NOTE - this has been updated to view, share or delete!
 */
 function handleSavedDataFile(dir, fileName) {

	navigator.notification.confirm(
		'Would you like to view, share or delete this file?', // message
		 function(button) {
			console.log("DEBUG - Saved data File handling for file " + fileName)
			if ( button == 1 ) {
				// User selected to View file
				window.location.href="#pageData"
				displayValue("filenameTitle",fileName)
				readSavedDataFile(fileName)
			}
			if ( button == 2 ) {
				socialShareFile(dir, fileName) 
			}
			if ( button == 3 ) {
				deleteFile(savedDataDir,fileName);
				listFilesInCollapsible('handleSavedDataFileList', 'handleSavedDataFile','savedDataDir')
			}
		 },           // callback to invoke with index of button pressed
		fileName,           // title
		['View','Share', 'Delete']     // buttonLabels
	);
}

function onConfirm(buttonIndex) {
    alert('You selected button ' + buttonIndex);
}

/*
 * Deleteing a file
 * (Based on https://gist.github.com/deedubbu/1590941)
 */
 function deleteFile(fileDir, fileName) {
	var remove_file = function(entry) {
		entry.remove(function() {
			navigator.notification.alert(entry.toURI(), null, 'Entry deleted');                    
		}, errorHandler);
	};
	
	// retrieve a file and truncate it
	fileDir.getFile(fileName, {create: false}, remove_file, errorHandler);
	//alert("Deleting File")
}


/*
 * Reading a file
 * (Based https://cordova.apache.org/docs/en/latest/reference/cordova-plugin-file/index.html)
 */

function readFile(fileEntry) {

    fileEntry.file(function (file) {
        var reader = new FileReader();

        reader.onloadend = function(evt) {
            //console.log("DEBUG - Successful file read: " + this.result);
            console.log(evt.target.result);
        };

        reader.readAsText(file);

    }, errorHandler);
}


/*
 * Saving a file 
 * from https://cordova.apache.org/docs/en/latest/reference/cordova-plugin-file/index.html
 */
function saveFile(dirEntry, origFile, fileName) {
    dirEntry.getFile(fileName, { create: true, exclusive: false }, function (fileEntry) {
        writeFileToFile(fileEntry, origFile);
    }, errorHandler);
	
}

/*
 * Error Handler for File Handling
 *
 */
function errorHandler(e) {
  var msg = '';

  switch (e.code) {
    case FileError.QUOTA_EXCEEDED_ERR:
      msg = 'QUOTA_EXCEEDED_ERR';
      break;
    case FileError.NOT_FOUND_ERR:
      msg = 'NOT_FOUND_ERR';
      break;
    case FileError.SECURITY_ERR:
      msg = 'SECURITY_ERR';
      break;
    case FileError.INVALID_MODIFICATION_ERR:
      msg = 'INVALID_MODIFICATION_ERR';
      break;
    case FileError.INVALID_STATE_ERR:
      msg = 'INVALID_STATE_ERR';
      break;
    default:
      msg = 'Unknown Error';
      break;
  };

  console.log('DEBUG - Error: ' + msg + ' from error ' + JSON.stringify(e));
}
 
/*
 * Load a local Suite Config File
 */
function readPackagedConfigFile(fileName){
	//console.log("DEBUG - reading file " + fileName)
	jQuery.getJSON(fileName, function(data){         
		if(data.experimentConfig){ 
			experimentConfiguration(data.experimentConfig);
		} 
		else if(data.sensortagMapping){
			readSensortagConfig(data.sensortagMapping, true);
			//console.log("DEBUG - sensortag mapping file")
		}
		else{
			navigator.notification.alert(
				'There is an error in the file. Please choose another file.\n\n',  // message
				experimentConfiguration(null),         // callback
				'Error',            // title
				'OK'                  // buttonName
			);
		}
	})
	
}

/*
 * Write a local SensorTag mapping to new file Config File
 */
function readAndWritePackagedConfigFile(fileNameRead, fileNameWrite){
	jQuery.getJSON(fileNameRead, function(data){         
		//console.log("DEBUG - Data read from local file is " + JSON.stringify(data))
		if(data.sensortagMapping){
			sensortagConfigDir.getFile(fileNameWrite, {create: true, exclusive: false}, function(fileEntry) {
				writeTextToFile(fileEntry, JSON.stringify(data), false);
			}, errorHandler);
			readSensortagConfig(data.sensortagMapping, true);
			//alert("Sensortag mapping read and copied " + JSON.stringify(data))
		}
		else{
			navigator.notification.alert(
				'There is an error in the file. Please choose another file.\n\n',  // message
				experimentConfiguration(null),         // callback
				'Error',            // title
				'OK'                  // buttonName
			);
		}
	})
	
} 
/*
 * Read the SensorTag or experiment Configuration file
 */
function readConfigFile(dir, fileName, supressAlert) {

	console.log("DEBUG - reading file " + fileName + " from " + dir.fullPath)
    dir.getFile(fileName, {create: true, exclusive: false}, function(fileEntry) {
		fileEntry.file(function(file) {
			var reader = new FileReader();

			reader.onloadend = function(e) {
			
				try{  // is the resource well-formed?
					var json = JSON.parse(this.result); 
					console.log("DEBUG - parsing json " + JSON.stringify(json))
				}
				catch (ex){   
					// Invalid JSON, notify of the failure if not suressing alerts ...
					if(!supressAlert)
					{
						navigator.notification.alert(
							'There is an error in the file. Please choose another experiment.\n\n' + JSON.stringify(ex),  // message
							experimentConfiguration(null),         // callback
							'Error',            // title
							'OK'                  // buttonName
						);
						console.log("DEBUG - error with result " + this.result)
					}
				} 
				if (json){ 
					if(json.experimentConfig){ 
						window.location.href="#pageExperiment"
						experimentConfiguration(json.experimentConfig);
						console.log("DEBUG - experiment file")
					} 
					else if(json.sensortagMapping){
						readSensortagConfig(json.sensortagMapping, supressAlert);
						console.log("DEBUG - sensortag mapping file")
					}
					else{
						navigator.notification.alert(
							'There is an error in the file. Please choose another file.\n\n',  // message
							experimentConfiguration(null),         // callback
							'Error',            // title
							'OK'                  // buttonName
						);
					}
				}
			};
			reader.readAsText(file);
		}, errorHandler);  
	}, errorHandler);
}

function viewSavedDataFile(dir, fileName) {
	navigator.notification.confirm(
		'Would you like to view or share this file?', // message
		 function(button) {
			if ( button == 1 ) {
				// User selected to View file
				window.location.href="#pageData"
				displayValue("filenameTitle",fileName)
				readSavedDataFile(fileName)
			}
			if ( button == 2 ) {
				socialShareFile(dir,fileName)
			}
		 },           // callback to invoke with index of button pressed
		fileName,           // title
		['View','Share']     // buttonLabels
	);
}

/*
 * Read and dump saved data file 
 */
function readSavedDataFile(fileName) {

    savedDataDir.getFile(fileName, {create: true, exclusive: false}, function(fileEntry) {
		fileEntry.file(function(file) {
			var reader = new FileReader();

			reader.onloadend = function(e) {
				//console.log("DEBUG - Text is: " + this.result);
				document.getElementById("dataBlock").innerHTML = this.result;
			};
			
			reader.readAsText(file);
		}, errorHandler);
	}, errorHandler);
}

/*
 * Read and dump generic file 
 */
function readAndDumpFile(fileName, dir) {

    dir.getFile(fileName, {create: true, exclusive: false}, function(fileEntry) {
		fileEntry.file(function(file) {
			var reader = new FileReader();

			reader.onloadend = function(e) {
				//console.log("DEBUG - Text is: " + this.result);
				document.getElementById("dataBlock").innerHTML = this.result;
			};
			
			reader.readAsText(file);
		}, errorHandler);
	}, errorHandler);
}

/*
 * Social Sharing plugin uses the following finctions
 * Based on  https://github.com/EddyVerbruggen/SocialSharing-PhoneGap-Plugin
 */
 
var onSuccess = function(result) {
  console.log("Share completed? " + result.completed); // On Android apps mostly return false even while it's true
  console.log("Shared to app: " + result.app); // On Android result.app is currently empty. On iOS it's empty when sharing is cancelled (result.completed=false)
}

var onError = function(msg) { 
  console.log("Sharing failed with message: " + msg);
}

var socialShareFile = function(dir, fileShare) {
	//var fileName = "file://file" + fileShare
	//var fileName = filePath
	
	window.resolveLocalFileSystemURL(window.cordova.file.externalDataDirectory,
        function onSuccess(dirDest)
        {
			console.log("DEBUG - In Success for resolving file system")
			copyDir(dir, fileShare, dirDest)
		},
		console.log("DEBUG - In Fail for resolving file system")
	);             

	fileName = window.cordova.file.externalDataDirectory + fileShare
	console.log("DEBUG - social sharing " + fileName)

	
	window.plugins.socialsharing.shareViaEmail(
		'Please find attached the data file from the Experiment App', // can contain HTML tags, but support on Android is rather limited:  http://stackoverflow.com/questions/15136480/how-to-send-html-content-with-image-through-android-default-email-client
		'Saved Data File From Experiment App',
		null, // TO: must be null or an array
		null, // CC: must be null or an array
		null, // BCC: must be null or an array
		[fileName], // FILES: can be null, a string, or an array
		onSuccess, // called when sharing worked, but also when the user cancelled sharing via email. On iOS, the callbacks' boolean result parameter is true when sharing worked, false if cancelled. On Android, this parameter is always true so it can't be used). See section "Notes about the successCallback" below.
		onError // called when sh*t hits the fan
	);
} 

/*
 * Copying a file to a new directory
 * from http://www.html5rocks.com/en/tutorials/file/filesystem/
 */
function copyDir(cwd, src, dest) {
  cwd.getFile(src, {}, function(fileEntry) {
	console.log("DEBUG - Success in getting src file. Dest file is " + dest.fullPath + fileEntry.name)
     fileEntry.copyTo(dest);
  }, errorHandler);
}

/*
 * experimetConfiguration 
 * Change app layout based on input from Experiment Config file
 */
experimentConfiguration = function(data) 
{
	sensortag0.disconnectDevice()
	sensortag1.disconnectDevice()
	experimentSensorDisplay = [] // Initialise the sensors registered to be empty

	// Save the experiment configuration data
	expConfigData = data;
	//console.log("DEBUG - Data sent and stored is: " + JSON.stringify(expConfigData))
	
	//var expFrame = document.getElementById('experiment').contentWindow.document;
	var experiment = document.getElementById('experiment')
	
	// Clear experiment data
	experiment.innerHTML = "";
	
	if(data==null){
		document.getElementById("labTitle").innerHTML = "Experiment Configuration Not Valid";
		return false;
	} 

	//Set Title of experiment
	if('labTitle' in data){
		document.getElementById("labTitle").innerHTML = data.labTitle + "<img src='ui/images/GrayLogoColour2.jpg'>"; // Add image for Asell
	}else{
		document.getElementById("labTitle").innerHTML = "Default Experiment Title <img src='ui/images/GrayLogoColour2.jpg'>";
	}
	
	// Display the SensorTags according to the configfile
	for(id in data.sensorTags){
		var sensorTagData = data.sensorTags[id];
		//console.log("DEBUG - sensortag " + id + " data is " + JSON.stringify(sensorTagData))
			
		//Diplay SensorTag data if configured
		// Additional or if forr earlier file format
		if(sensorTagData.connect==="on" || sensorTagData.connect==="1" ){
			
			//Set SensorTag Name if not supplied
			var title;
			if(sensorTagData.title==""){
				title = "";
			}else{
				title = sensorTagData.title + ":"
			}
			
 			// Add each SensorTag name and a connect button for each
			//
			var sensortagAddString = ""
			sensortagAddString +=	"<div class='ui-grid-a ui-responsive'>"
			sensortagAddString +=		"<div class='ui-block-a'>"
			sensortagAddString += 			"<h2 id=\"sensorTagLabel"+id+"\"> "+title+" <span id=\"SystemID"+id+"\"> ? </span> </h2>";
			sensortagAddString += 			"<p><strong>Status:</strong> <span id=\"StatusData"+id+"\">NOT CONNECTED</span></p>";
			sensortagAddString +=		"</div>"
			sensortagAddString +=		"<div class='ui-block-b' style='text-align: right;'>"
			sensortagAddString += 			"<p><button class='asellbrightgreen' onclick=\"connection("+id+")\" id=\"connectionButton"+id+"\"> Connect </button></p>";
			sensortagAddString +=		"</div>"
			sensortagAddString +=	"</div>"

			experiment.innerHTML += sensortagAddString;
			
			// Add each sensor as required
			for(sensor in sensorTagData.sensors){
				var sensorProps = sensorTagData.sensors[sensor]
				//console.log("DEBUG - Sensor Props JSON is: " + JSON.stringify(sensorProps))

				// Use default labels and titles in case and store these values
				var sensorLabel = sensorProps.data.label=="" ? sensor+ " " +id : sensorProps.data.label;
				var sensorGraphTitle = sensorProps.graph.graphTitle=="" ? sensor+ " " +id + " Graph" : sensorProps.graph.graphTitle;
				expConfigData.sensorTags[id].sensors[sensor].graph.graphTitle = sensorGraphTitle
				
				var sensorXAxis = sensorProps.graph.graphXAxis=="" ? sensor + " " +id + " Time Periods" : sensorProps.graph.graphXAxis;
				expConfigData.sensorTags[id].sensors[sensor].graph.graphXAxis = sensorXAxis

				var sensorYAxis = sensorProps.graph.graphYAxis=="" ? sensor + " " +id + " Values" : sensorProps.graph.graphYAxis;
				expConfigData.sensorTags[id].sensors[sensor].graph.graphYAxis = sensorYAxis

				/*
				* Set up the sections for the data, graphs and grids
				*/
				var sensorAddDataString = ""
				//Set up each div for the sensors data displays 
				sensorAddDataString += 	"<div id=\""+sensor+id+"\" class=\"sensorReadingEntry\" >"
				sensorAddDataString +=		"<span id=\""+sensor+"Label"+id+"\" class=\"sensorReadingLabel\"><strong>" + sensorLabel +": </strong></span>"	
				sensorAddDataString +=		"<span id=\""+sensor+"Data"+id+"\" class=\"sensorReadingValue\"> Waiting for value </span></p>"
				// add 'Click' button if "capture on click"
				if(sensorProps.captureOnClick=="on" && sensorProps.grid.griddisplay!="on")
					sensorAddDataString += 	"<p><button id=\""+sensor+id+"CoCButton\" class='asellbrightgreen' onclick='captureOnClick(\"" + sensor +id +"\", "+ id + ")'> Capture "+sensor+" value</button></p>";
				sensorAddDataString +=	"</div>"
				
				/*
				* Set up each div for the sensors graph display
				*/
				var sensorAddGraphString = ""
				if (sensorProps.graph.graphdisplay=="on")
				{
					//console.log("DEBUG - Adding Graph for " + sensor+ id)

					sensorAddGraphString += "<div id=\""+sensor+id+"Graph\"  class='ui-bar ui-bar-a ui-corner-all graphdiv'>"
					//Set up each div for the sensors graph display
					sensorAddGraphString += 	"<div id=\""+sensor+id+"GraphCanvas\" class=\"sensorGraph\" style='height:200px; width: 100%'><p>"
					sensorAddGraphString += 		"<span id=\""+sensor+"GraphTitle"+id+"\" class=\"sensorGraphTitle\">"
					sensorAddGraphString +=			"</span>"
					sensorAddGraphString +=		"</div>"
					//Set up each div for the sensors start/stop graph button
					sensorAddGraphString +=		"<div class='ui-grid-a ui-responsive'>"
					sensorAddGraphString +=			"<div class='ui-block-a'>"
					sensorAddGraphString += 			"<button data-mini='true' id='toggleGraphButton"+sensor+id+"' type='button' onclick='toggleDrawGraphs(\"" + sensor + id +"\"," + id+ ");' class='asellbrightgreen'>"
					//sensorAddGraphString += 			"Start "+sensor+" Graphing (connect to SensorTag)"
					sensorAddGraphString += 			"Start "
					sensorAddGraphString +=			"</div>" 
					//Set up each div for the reset graph button
					sensorAddGraphString +=			"<div class='ui-block-b' style='text-align: right;' id=\""+sensor+id+"GraphReset\" >"
					sensorAddGraphString += 			"<button data-mini='true' id='resetGraphButton"+sensor+id+"' type='button' onclick='resetGraph(\"" + sensor +"\"," + id+ ");' class='charcoal' >"
					sensorAddGraphString += 			"Reset"
					sensorAddGraphString += 			"</button>"
					sensorAddGraphString +=			"</div>"
					sensorAddGraphString +=		"</div>"
					sensorAddGraphString +=	"</div><p>"
				}

				/*
				* Set up each div for the sensors grid display
				*/	
				var sensorAddGridString = ""
				var cellCount = 0
				if (sensorProps.grid.griddisplay=="on")// && sensorProps.captureOnClick=="on")
				{
					var columnClass = "ui-grid-b"
					switch (sensorProps.grid.columns)
					{
						case "2":
							columnClass = "ui-grid-a"
							break;
						case "3":
							columnClass = "ui-grid-b"
							break;
						case "4":
							columnClass = "ui-grid-c"
							break;
						case "5":
							columnClass = "ui-grid-d"
							break;
					}
					
					var rowNumber = sensorProps.grid.rows
					//console.log("DEBUG - Number of columns: " + columnClass + ", and rows: " + rowNumber )
					
					sensorAddGridString += "<div id=\""+sensor+id+"Grid\"  class='"+columnClass+" ' data-theme='a' >"
					var cellCount = 0
					for(i = 0; i < rowNumber; i++)
					{
						sensorAddGridString +=  "<div class='ui-block-a'><div class='ui-bar border-grid widgetblock'  id='"+sensor+"Grid"+cellCount+"'>"
						sensorAddGridString += 			"<button class='asellbrightgreen' onclick='captureOnClickGrid(\"" + sensor +id +"\", \""+ id + "\", \"" + cellCount + "\")'> "+cellCount+ "</button>"
						sensorAddGridString += 	"</div></div>"
						//console.log("Debug - the function is: " + " onclick='captureOnClickGrid(\"" + sensor +id +"\", \""+ id + "\", \"" + cellCount + "\")'")
						
						cellCount++
						sensorAddGridString +=  "<div class='ui-block-b'><div class='ui-bar  border-grid widgetblock'  id='"+sensor+"Grid"+cellCount+"'>"
						sensorAddGridString += 			"<button class='asellbrightgreen' onclick='captureOnClickGrid(\"" + sensor +id +"\", \""+ id + "\", \"" + cellCount + "\")'>  "+cellCount+ "</button>"
						sensorAddGridString += 	"</div></div>"
						cellCount++
						if(sensorProps.grid.columns > 2)
						{
							sensorAddGridString +=     "<div class='ui-block-c'><div class='ui-bar  border-grid widgetblock' id='"+sensor+"Grid"+cellCount+"'>"
							sensorAddGridString += 			"<button class='asellbrightgreen' onclick='captureOnClickGrid(\"" + sensor +id +"\", \""+ id + "\", \"" + cellCount + "\")'>  "+cellCount+ "</button>"
							sensorAddGridString += 	"</div></div>"
							cellCount++
						}
						if(sensorProps.grid.columns > 3)
						{
							sensorAddGridString +=     "<div class='ui-block-d'><div class='ui-bar  border-grid widgetblock' id='"+sensor+"Grid"+cellCount+"'>"
							sensorAddGridString += 			"<button class='asellbrightgreen' onclick='captureOnClickGrid(\"" + sensor +id +"\", \""+ id + "\", \"" + cellCount + "\")'>  "+cellCount+ "</button>"
							sensorAddGridString += 	"</div></div>"
							cellCount++
						}
						if(sensorProps.grid.columns > 4)
						{
							sensorAddGridString +=     "<div class='ui-block-e'><div class='ui-bar  border-grid widgetblock' id='"+sensor+"Grid"+cellCount+"'>"
							sensorAddGridString += 			"<button class='asellbrightgreen' onclick='captureOnClickGrid(\"" + sensor +id +"\", \""+ id + "\", \"" + cellCount + "\")'>  "+cellCount+ "</button>"
							sensorAddGridString += 	"</div></div>"
							cellCount++
						}
					}
					//sensorAddGridString += "</div>"
					//sensorAddGridString += "<div>"
					sensorAddGridString += "<button class='asellbrightgreen' onclick='clearGrid(\"" + sensor +"\", \""+ id + "\", \"" + cellCount + "\")'> Clear Grid </button>"
					sensorAddGridString += "</div>"
				}

				experiment.innerHTML += sensorAddDataString + sensorAddGraphString + sensorAddGridString
				//console.log("DEBUG - html is " + sensorAddDataString + sensorAddGraphString + sensorAddGridString )

				//Hide the data div if required
				document.getElementById(sensor+id).style.display = sensorProps.data.display==="on"  ? "block" : "none";

				// All hidden if display value is "off".  
/*				if(sensorProps.data.display==="off")
				{	
					document.getElementById(sensor+id).style.display = "none"
					document.getElementById(sensor+id+"Graph").style.display = "none"
					document.getElementById("toggleGraphButton"+sensor+id).style.display = "none"
					if (sensorProps.grid.griddisplay=="on")// && sensorProps.captureOnClick=="on")
						document.getElementById(sensor+id+"Grid").style.display = "none"
					if (sensorProps.captureOnClick=="on")
						document.getElementById(sensor+id+"CoCButton").style.display = "none"
				}
*/				

				// Set the graphs to display if graphAutoStart is set. Hide toggle button
				if(expConfigData.graphAutoStart == "on" && sensorProps.graph.graphdisplay==="on"){
					document.getElementById("toggleGraphButton"+sensor+id).style.display = sensorProps.graph.graphdisplay==="on" && expConfigData.graphAutoStart != "on" ? "block" : "none";
					graphDisplay[sensor+id]=true;
					changeButtonColour("resetGraphButton"+sensor+id,"asellbrightgreen")
					console.log("Debug - setting graph diplay true for " + sensor+id)
				}
				// Reset the graphs if they have been created before
				if(datapoints.initialised)
				{
					resetGraph(sensor,id)
					graphDisplay[sensor+id]=false;
				}
				
				//Activate the sensortag handler
				if(sensorProps.data.display==="on" || sensorProps.graph.graphdisplay==="on" || sensorProps.grid.griddisplay==="on")
				{
					var interval = sensorProps.sampleinterval || 1000
					console.log("Debug - setting interval to " + interval)
					
					initialiseHandler(id,sensor,interval);
					
			        experimentSensorDisplay.push(sensor+id);
					//console.log("DEBUG - newstring for values is: " + experimentSensorDisplay.toString());
					//console.log("DEBUG - newstring for values is: " + experimentSensorDisplay.toString());
				}
			}
			//console.log("DEBUG - Experiment tempString so far is " + experiment.innerHTML)

 		}
	} 

	// Add Video allowed
	if(data.videoAllowed == "on"){
		var tempVideoPrefix = ""
		if('videoPrefix' in data) 
			tempVideoPrefix = data.videoPrefix
			
		var video =	"<div id='videoArea'>"
		video +=		"<button class='asellgreen' id='startVideo' onclick=\"startVideo('" + tempVideoPrefix + "')\" > Start Video </button>"
		video +=	"</div>"
		experiment.innerHTML += video
		//console.log("DEBUG - video Prefix is " + tempVideoPrefix)
	}

	
	// Add Data Storage if allowed
	if(data.dataStorageAllowed == "on"){
		var tempPrefix = ""
		if('dataStoragePrefix' in data) 
			tempPrefix = data.dataStoragePrefix
			
		var footer = "<div data-role='footer' class='ui-bar'>"
			footer += 		"<button class='asellgreen' id='initDataStorage' onclick=\"toggleDataStorage('" + tempPrefix + "')\" > Write Sensor Data to a file </button>"
			footer += "</div>"
			experiment.innerHTML += footer
	}
	
	// Initialise the graph if Autostart is set
	if(expConfigData.graphAutoStart == "on"){
		initGraphDrawing();	
	} 

	// Initialise the captureOnClick values for captureOnClick
	if(!captureOnClickValue.initialised)
	{
		initGridDrawing();
	}
}

/*
 * Reading sensortag data from local file
 * Load the sensortag mapping data file
 */
readSensortagConfig = function(data, supressAlert)
{
	if (!supressAlert) alert('Successfully loaded configuration file...');
	sensortagMappingData = data.sensortags;
	//console.log("Debug - SensorMapping data is: " + JSON.stringify(sensortagMappingData));
}
 
  
 /*
 * Ajax cross domain call for Jsonp to get sensortag configuration file
 * Load the sensortag mapping data file
 */
loadSensortagConfig = function(fileName) 
{
	// From loading from AWS and entering data
	$.ajax({
		url: sensontagConfigURLAWS,
        jsonpCallback: "callback",
        cache: false,
        cache: false,
        dataType: "jsonp",
        success: function(response){
			if('sensortagMapping' in response)
			{
				alert('Successfully downloaded configuration file...');
				sensortagMappingData = response.sensortagMapping.sensortags;
			}
			else
				alert('Malformed json...');
		}
    });
}

/*
 * CordovaHTTP get to load json sensortag config from a file server on Teacher App
 * Load the sensortag mapping data file
 */
loadSensortagConfigLocal = function() 
{
	cordovaHTTP.get(
		sensontagConfigURLLocal,  
		function(response)  // on success
		{
			try{  // is the resource well-formed?
				var json = JSON.parse(response.data); 
			}
			catch (ex){   
				// Invalid JSON, notify of the failure...
				alert('Could not parse json, aborting...');
				console.log(response.data)
			} 
			if (json){ 
				//Set html values based on Config file
				if('sensortagMapping' in json)
				{
					//console.log("success in loadSensortagConfig");
					sensortagMappingData = json.sensortagMapping.sensortags;
				}
				else
					alert('Malformed json...');
				//document.getElementById("demo2").innerHTML = json.experimentConfig.labTitle;
			}
		}, 
		function(response)   // on error
		{
			console.log(JSON.stringify(response));
		});
}

function formatDateToString(date){
   // 01, 02, 03, ... 29, 30, 31
   var dd = (date.getDate() < 10 ? '0' : '') + date.getDate();
   // 01, 02, 03, ... 10, 11, 12
   var MM = ((date.getMonth() + 1) < 10 ? '0' : '') + (date.getMonth() + 1);
   // 1970, 1971, ... 2015, 2016, ...
   var yyyy = date.getFullYear();

   // Hours
   var hrs = (date.getHours() < 10 ? '0' : '') + date.getHours();
   // Mins
   var mins = (date.getMinutes() < 10 ? '0' : '') + date.getMinutes();
   // Seconds
   var secs = date.getSeconds();

   // create the format you want
   return (yyyy+ MM + dd + '_' + hrs+mins+secs);
}

function alertDismissed() {
    console.log("Alert dismissed");
}

/* For testing
var expConfigURLAWS = "https://s3-ap-northeast-1.amazonaws.com/nerldconfigs/expConfig.jsonp";
var sensontagConfigURLLocal = "https://s3-ap-northeast-1.amazonaws.com/nerldconfigs/sensortagConfig.jsonp";
var expConfigURLLocal = "http://10.17.40.64:8080/this.json"
//"http://www.cs.usyd.edu.au/~tmac2470/test.json"
//"http://10.17.40.64:8080/test.json"
//var expConfigURL = "http://www.cs.usyd.edu.au/~tmac2470/expConfig.json"
var sensontagConfigURLAWSDefault = "https://s3-ap-northeast-1.amazonaws.com/nerldconfigs/sensortagConfig.jsonp";
var sensontagConfigURLAWS = "https://s3-ap-northeast-1.amazonaws.com/nerldconfigs/";
*/