/*
 * SnapLabsApp.js
 * Contains the functions and logic for NERLD Gen 2 app for both the teacher and student functionality
 * Carried over from ExperimentApp.js and TeacherApp.js
 * This file contains core functions 
 */
 
 // A namespace for new functions.  
 // To differentiate with experiment, teacher, data and graphing functions too
snaplabs = {}

// Those functions concerning session id and authentication
snaplabs.session = {}
var TEACHER_ROLE = "Teacher"
var STUDENT_ROLE = "Student"
var EXPERIMENT_DIR = "Experiment"
var SENSORTAG_DIR = "SensorTag"
var SAVEDDATA_DIR = "SavedData"
  
// Functions concerning data storage in created directory structure
snaplabs.storage = {}
var sensortagConfigDirectoryName = "SensortagMapingConfigFiles" // Directory for stiring sensortag mapping files
var sensortagPackagedFile = "sensorTagConfig_default.json"; // The default file name shipped with the packages.  Copied into directory if required.
var sensortagCurrentFile = "sensorTagConfig_current.json"; // The defauly name for the current active sensortag file name.
var expConfigDirectoryName = "ExperimentAppConfigFiles";
var savedDataDirectoryName = "SavedDataFiles";
var tempFileName = "tempConfigFile.jsonp";
var tempFile; 		// Temporary Config File (FileEntry)

var sensorList = ['Temperature','Humidity','Barometer','Accelerometer','Gyroscope','Magnetometer','Luxometer'];


snaplabs.sensortagconfig = {}  // Function specific to handling of sensortag configuration files
snaplabs.experimentconfig = {}  // Function specific to handling of experiment configuration files
snaplabs.file = {}  // Common functions for file handling
snaplabs.navigation = {}  // Common functions for navigating through pages.  For alert callbacks etc
snaplabs.ui = {} // Functions for displaying html etc on app
snaplabs.server = {} // Functions for the server running
 

snaplabs.onDeviceReady = function() {
	
	//console.log("DEBUG - JUST FOR TESTING DATA CLEARED")
	//window.localStorage.clear();
	
	/*
	* Set up default admin user if it does not exist
	*
	*/
	var adminUser = window.localStorage.getObj("admin@snaplabs.com")
	if(adminUser == null)
	{
		console.log("DEBUG - Setting up Admin User")
		var adminInfo = {}
		adminInfo.username = "Admin"
		adminInfo.password = "snaplabs"
		adminInfo.role = "Teacher" 
		
		window.localStorage.setObj("admin@snaplabs.com", adminInfo)
	}


	/*
	 * Set up the file system directory structure if it doesn't exisit and set the variables
	 * 1. Set Up the sensorTag Mapping Directory.  Only for admin use.
	 * 2. Set up the root for the Experiment Configuration Files
	 * 3. Set up the root for the Saved Data files
	 */
	
	//1.  File System for writing sensortag mapping files
	window.resolveLocalFileSystemURL(cordova.file.externalDataDirectory, function(dir) {
		 dir.getDirectory(sensortagConfigDirectoryName, { create: true }, function (dirEntry) {
			snaplabs.storage.sensortagConfigDir = dirEntry;
			document.getElementById("sensortagConfigDirSetting").innerHTML = snaplabs.storage.sensortagConfigDir.fullPath;
			// Copy Default Sensortag file in this directory as a start if it exists
			console.log("DEBUG - about to copy default sensortag file " + sensortagPackagedFile)
			snaplabs.sensortagconfig.copyPackagedConfigFile(sensortagPackagedFile, sensortagPackagedFile)
			// Read "current" sensortag file or default one if there is no current one
			//snaplabs.sensortagconfig.readCurrentConfigFile()
		}, snaplabs.file.errorHandler);  
	}, snaplabs.file.errorHandler);
	 
	//2. Get the File system for writing the experiment configuration file
	window.resolveLocalFileSystemURL(cordova.file.externalDataDirectory, function(dir) {
		 dir.getDirectory(expConfigDirectoryName, { create: true }, function (dirEntry) {
			// Setting up the files and directories
			snaplabs.storage.experimentConfigDir = dirEntry;
			document.getElementById("experimentConfigDirSetting").innerHTML = snaplabs.storage.experimentConfigDir.fullPath;
			// Copy Packaged Experiment Files to default directory
			snaplabs.experimentconfig.loadDefaultFiles()
			// Create a temporary file for new experiment configurations
			//snaplabs.file.createFile(dirEntry, tempFileName, false);
		 }, snaplabs.file.errorHandler); 

	}, snaplabs.file.errorHandler);	
	
	// 3. File system for the Data logging files
	window.resolveLocalFileSystemURL(cordova.file.externalDataDirectory, function(dir) {
		dir.getDirectory(savedDataDirectoryName, { create: true }, function (dirEntry) {
			// Setting up the files and directories
			snaplabs.storage.savedDataDir = dirEntry;
			document.getElementById("savedDataFileDirSetting").innerHTML = snaplabs.storage.savedDataDir.fullPath;
			// To fill the html with values before starting
			//listSavedDataFiles('savedDataFileList');

		}, snaplabs.file.errorHandler); 
	}, snaplabs.file.errorHandler);	

	
	/* 
	* Start the locally running server for file sharing from the server root directory
	*/
	httpd = ( cordova && cordova.plugins && cordova.plugins.CorHttpd ) ? cordova.plugins.CorHttpd : null;
	//Stop server first
	snaplabs.server.stopServer();
	// Start the server at the data directory. 
	snaplabs.server.serverroot = cordova.file.externalDataDirectory.replace( 'file://', '' );
	
	//snaplabs.server.startServer(snaplabs.server.serverroot);
}

/* 
 * Corhttpd Functions 
 * https://github.com/floatinghotpot/cordova-httpd
 */

snaplabs.server.updateStatus = function() {
	console.log("DEBUG - update status of server")
	document.getElementById('location').innerHTML = "document.location.href: " + document.location.href;
	if( httpd ) {
	  /* use this function to get status of httpd
	  * if server is up, it will return http://<server's ip>:port/
	  * if server is down, it will return empty string ""
	  */
		httpd.getURL(function(url){
			if(url.length > 0) {
				document.getElementById('url').innerHTML = "The server is up at: <a href='" + url + "' target='_self'>" + url + "</a>";
			} else {
				document.getElementById('url').innerHTML = "The server is down.";
			}
		});
		// call this function to retrieve the local path of the www root dir
		httpd.getLocalPath(function(path){
			document.getElementById('localpath').innerHTML = "<br/>localPath: " + path;
		});
	} else {
		alert('CorHttpd plugin not available/ready.');
	}	
} 

snaplabs.server.startServer = function(wwwroot ) {
	console.log("DEBUG - start server from user role " + snaplabs.session.role)
	if ( httpd ) {
		// before start, check whether its up or not

		httpd.getURL(function(url){
			if(url.length > 0) {
				document.getElementById('url').innerHTML = "The server is up at: <a href='" + url + "' target='_blank'>" + url + "</a>";
			} else {
				/* wwwroot is the root dir of web server, it can be absolute or relative path
				* if a relative path is given, it will be relative to cordova assets/www/ in APK.
				* "", by default, it will point to cordova assets/www/, it's good to use 'htdocs' for 'www/htdocs'
				* if a absolute path is given, it will access file system.
				* "/", set the root dir as the www root, it maybe a security issue, but very powerful to browse all dir
				*/
				httpd.startServer({
					'www_root' : wwwroot,
					'port' : 8080,
					'localhost_only' : false
				}, function( url ){
				  // if server is up, it will return the url of http://<server ip>:port/
				  // the ip is the active network connection
				  // if no wifi or no cell, "127.0.0.1" will be returned.
				document.getElementById('url').innerHTML = "The server has been started at: <a href='" + url + "' target='_blank'>" + url + "</a>";
				document.getElementById('url').innerHTML += "<br>The server root directory is " + wwwroot;
				}, function( error ){
					document.getElementById('url').innerHTML = 'Failed to start server: ' + error;
				});
			}

		});
	} else {
		alert('CorHttpd plugin not available/ready.');
	}
}

snaplabs.server.stopServer = function() {
	console.log("DEBUG - stop server from user role " + snaplabs.session.role)
	if ( httpd ) {
		// call this API to stop web server
		httpd.stopServer(function(){
			document.getElementById('url').innerHTML = 'Server has stopped. Restart the application to start the server again.';
		},function( error ){
			document.getElementById('url').innerHTML = 'Failed to stop server' + error;
		});
	} else {
		alert('CorHttpd plugin not available/ready.');
	}
}
/*
 * snaplabs.signinCheck looks for the username and password in the secure storage area
 *
 */
 
snaplabs.signinCheck = function(formData){
	var dataObj = $(formData).serializeJSON();
	var email = dataObj.signinemail
	var pw = dataObj.signinpassword
	console.log("DEBUG - Signin check for user email " + email + " and pw " + pw)

	var savedUser = JSON.parse(window.localStorage.getItem(email))
	if(savedUser === null)
	{
		console.log('DEBUG - User not found with address: ' + email); 
		navigator.notification.alert(
			'Invalid username.  Please try again (or signup as a user)',
			snaplabs.navigation.goToHome,
			'Unsuccessful Login',
			'Try Again'); 
	}
	else
	{
		console.log("Debug - retrieved user info is " + JSON.stringify(savedUser))
		if (savedUser.password == pw) 
		{
			console.log('DEBUG - Passwords match - proceed'); 
				navigator.notification.alert(
					'Welcome ' + savedUser.username + ". You have " + savedUser.role + " priviledges.",
					snaplabs.navigation.goToMain,
					'Successful Login',
					'Begin'); 
		
			snaplabs.session.user = savedUser.username
			snaplabs.session.role = savedUser.role
			var x = document.getElementsByClassName("teacherview");
			var i;
			if (snaplabs.session.role == TEACHER_ROLE)
			{
				for (i = 0; i < x.length; i++) {
					x[i].style.display = "block";
				}
				snaplabs.server.startServer();
			}
			else
			{
				for (i = 0; i < x.length; i++) {
					x[i].style.display = "none";
				}
			}
			
			// Check for Experiment directory - Do Not Create
			snaplabs.storage.experimentConfigDir.getDirectory(snaplabs.session.user, { create: true }, function (dirEntry) {
				// Setting up the files and directories
				snaplabs.storage.userExperimentConfigDir = dirEntry;
				document.getElementById("experimentConfigDirSetting").innerHTML = snaplabs.storage.userExperimentConfigDir.fullPath;
				console.log("DEBUG - Set up new Experiment directory " + snaplabs.storage.userExperimentConfigDir.fullPath)
			}, snaplabs.file.errorHandler); 
				
			// Check for Saved Data directory - DO NOT CREATE
			snaplabs.storage.savedDataDir.getDirectory(snaplabs.session.user, { create: true }, function (dirEntry) {
				// Setting up the files and directories
				snaplabs.storage.userSavedDataDir = dirEntry;
				document.getElementById("savedDataFileDirSetting").innerHTML = snaplabs.storage.userSavedDataDir.fullPath;
				console.log("DEBUG - Set up newSaved Data directory " + snaplabs.storage.userSavedDataDir.fullPath)
			}, snaplabs.file.errorHandler); 
		}
		else
		{
			navigator.notification.alert(
				'Invalid password.  Please try again (or signup as a user)',
				snaplabs.navigation.goToSignin,
				'Unsuccessful Login',
				'Try Again'); 
		} 
	}

}
 

/*
 * snaplabs.registerUser checks for valid user registration
 * 1. Checks that user name is unique
 * 2. Adds user
 * 3. Creates new directory for user
 * (password matching and email format etc done by validation plugin)
 */
 
snaplabs.registerUser = function(formData){
	var dataObj = $(formData).serializeJSON();
	var pw1 = dataObj.password1
	var uname = dataObj.username
	var email = dataObj.email
	
	console.log("DEBUG - Signin check for user " + uname + ", email "+ email +" and pw " + pw1)

	var savedUser = JSON.parse(window.localStorage.getItem(email))
	console.log("DEBUG - user registration user info retrieved is: " + savedUser)
	if(!savedUser)
	{
		console.log("DEBUG - User doesn't exist, adding " + email);
		//var userInfo = {password : pw1, username : uname}
		var userInfo = {}
		userInfo.password = pw1
		userInfo.username = uname
		userInfo.role = STUDENT_ROLE
		
		//window.localStorage.setItem(email, JSON.stringify(userInfo));
		window.localStorage.setObj(email,userInfo); 
		
		// Set Student view
		snaplabs.session.user = uname
		var x = document.getElementsByClassName("teacherview");
		var i;
		for (i = 0; i < x.length; i++) {
			x[i].style.display = "none";
		}
		
		// Create an experiment config sub directory
		snaplabs.storage.experimentConfigDir.getDirectory(snaplabs.session.user, { create: true }, function (dirEntry) {
			// Setting up the files and directories
			snaplabs.storage.userExperimentConfigDir = dirEntry;
			document.getElementById("experimentConfigDirSetting").innerHTML = snaplabs.storage.userExperimentConfigDir.fullPath;
			console.log("DEBUG - Set up new Experiment directory " + snaplabs.storage.userExperimentConfigDir.fullPath)
		}, snaplabs.file.errorHandler); 
		
		// Create a Saved Data sub directory
		snaplabs.storage.savedDataDir.getDirectory(snaplabs.session.user, { create: true }, function (dirEntry) {
			// Setting up the files and directories
			snaplabs.storage.userSavedDataDir = dirEntry;
			document.getElementById("savedDataFileDirSetting").innerHTML = snaplabs.storage.userSavedDataDir.fullPath;
			console.log("DEBUG - Set up newSaved Data directory " + snaplabs.storage.userSavedDataDir.fullPath)
		}, snaplabs.file.errorHandler); 

		navigator.notification.alert( 
			'Welcome ' + snaplabs.session.user,
			snaplabs.navigation.goToMain,
			'Successful Signup',
			'Begin'); 
	}
	else
	{
		console.log('DEBUG - Already exisits: got password as ' + window.localStorage.getItem(uname)); 
		navigator.notification.alert(
			'An account already exists using this email. Please sign in or use a different email address.',
			snaplabs.navigation.goToHome,
			'Account Already Exists',
			'Continue'); 
	}

}

/*
 * goToHome; goToMain  
 * Navigation function for notifications such as alert etc.
 */
snaplabs.navigation.goToHome = function(){
	window.location.href="#pageHome"
}

snaplabs.navigation.goToMain = function(){
	window.location.href="#pageMain"
}

snaplabs.navigation.goToSignin = function(){
	window.location.href="#signinPage"
}

snaplabs.navigation.goToAddSensorTag = function(){
	window.location.href="#pageAddSensortags"
}

/*
 * readAndWritePackagedConfigFile  
 * Write a local SensorTag mapping to the configuration file directory 
 */
snaplabs.sensortagconfig.readCurrentConfigFile = function(){
	// Check for current file and read if it is there.
	snaplabs.storage.sensortagConfigDir.getFile(sensortagCurrentFile, {create: false, exclusive: true}, 
	function(fileEntry) {
		console.log("DEBUG - Current sensortag file exists, read this")
		snaplabs.sensortagconfig.readSensorTagConfigFile(fileEntry, snaplabs.sensortagconfig.readSensortagConfig, false);
		snaplabs.sensortagconfig.currentSensorTagConfigFile = fileEntry 
	}, 
	function(err) {
		console.log("DEBUG - Error getting current file " + err.message + ". Attempt to read default file.")
		snaplabs.storage.sensortagConfigDir.getFile(sensortagPackagedFile, {create: false, exclusive: true}, function(fileEntry) {
			console.log("DEBUG - Default sensortag file exists, read this and make it the current file")
			snaplabs.sensortagconfig.readSensorTagConfigFile(fileEntry, snaplabs.sensortagconfig.readSensortagConfig, true);
			snaplabs.sensortagconfig.currentSensorTagConfigFile = fileEntry 
		}, snaplabs.file.errorHandler); 
	});
} 

/*
 * readAndWritePackagedConfigFile  
 * Write a local SensorTag mapping to the configuration file directory 
 */
snaplabs.sensortagconfig.copyPackagedConfigFile = function(fileNameRead, fileNameWrite){

	jQuery.getJSON(fileNameRead, function(data){         
		console.log("DEBUG - Data read from local file is " + JSON.stringify(data))
		if(data.sensortagMapping){
			snaplabs.storage.sensortagConfigDir.getFile(fileNameWrite, {create: true, exclusive: false}, function(fileEntry) {
				snaplabs.file.writeTextToFile(fileEntry, JSON.stringify(data), false);
			}, snaplabs.file.errorHandler);
			//snaplabs.sensortagconfig.readSensortagConfig(data.sensortagMapping, true);
			console.log("DEBUG - Sensortag mapping package file copied to " + fileNameWrite)
			snaplabs.sensortagconfig.readCurrentConfigFile()
		}
		else{ 
			console.log("DEBUG - Error in copying default Sensortag mapping file in copyPackagedConfigFile")
		}
	})
	.fail(function(jqXHR, textStatus, errorThrown) { console.log('ERROR - getJSON request for copying default sensortag mapping failed! ' + textStatus); })
	
} 

/*
 * readSensortagConfig
 * 
 * Load the sensortag mapping data into current sensortag information
 */
snaplabs.sensortagconfig.readSensortagConfig = function(data, supressAlert)
{
	if (!supressAlert) alert('Successfully loaded configuration file...');
	snaplabs.sensortagconfig.sensortagMappingData = data.sensortags;
	//console.log("DEBUG - Sensortag data has been read as: " + JSON.stringify(snaplabs.sensortagconfig.sensortagMappingData))
}
 
 /*
 * Read the SensorTag Configuration file
 * This function is passed:
 * fileEntry - the sensorTag configuration file to read
 * callback - method to perform on successful read with the newData
 * newData - Data to be added or changed in the sensortag file
 */
snaplabs.sensortagconfig.readSensorTagConfigFile = function(fileEntry, callback, newData) {
	console.log("DEBUG - reading file " + fileEntry.fullPath)
	console.log("DEBUG - reading file new data is " + JSON.stringify(newData))
	snaplabs.ui.showElementView('sensortagConfigFileData');
	fileEntry.file(function(file) {
		var reader = new FileReader();

		reader.onloadend = function(e) {
			
			try{  // is the resource well-formed?
				var json = JSON.parse(this.result); 
			}
			catch (ex){   
				// Invalid JSON, notify of the failure...
				alert('Could not parse the SensorTag configuration File.  Please create a new one.');
				snaplabs.ui.showElementView('overwriteSensortagConfigFile');
				console.log("DEBUG error " + this.result)
			} 
			if (json){ 
				//Set html values based on Config file
				if('sensortagMapping' in json)
				{	
					console.log("DEBUG - sensorTag mapping found" + JSON.stringify(json))
					callback(json.sensortagMapping, newData)
				}
				else {
					alert('Could not parse the SensorTag configuration File.  Please create a new one.');
					snaplabs.ui.showElementView('overwriteSensortagConfigFile');
					console.log("DEBUG error " + this.result)
				}
			}
		};
		reader.readAsText(file);
	}, snaplabs.file.errorHandler);

}

/*
 * updateInstitutionOwner
 * Get data from the form to update the SensorTag configuration file with a new institution and owner
 */
/*snaplabs.sensortagconfig.updateInstitutionOwner = function() 
{
	var dataObjTemp = $('#sensorTagConfigForm').serializeJSON();
	console.log("DEBUG - changing institution or owner name - data is: " + JSON.stringify(dataObjTemp))
	var newMetadata = {}
	newMetadata.institution = dataObjTemp.institution
	newMetadata.owner = dataObjTemp.owner
	
	// Prompt user to overwrite file or create a copy of current one
	navigator.notification.prompt(
		'Please enter the new configuration file name.\nSelect "Overwrite" to use current file - ' 
			+ snaplabs.sensortagconfig.currentSensorTagConfigFile + '.',  // message
        function(results){
			snaplabs.sensortagconfig.selectSensorTagConfigFileToWrite(results, newMetadata);
		},     // callback to invoke
		'Overwirte File? ', // title
		['Overwrite','Create New File'],   // buttonLabels
		"New File Name"             // defaultText
	);

	//snaplabs.sensortagconfig.readSensorTagConfigFile(snaplabs.sensortagconfig.currentSensorTagConfigFile, snaplabs.sensortagconfig.updateSensorTagConfigFileMetadata, newMetadata);
	
	
}*/

/*
 * updateInstitutionOwner
 * Get data from the form to update the SensorTag configuration file with a new institution and owner
 */
snaplabs.sensortagconfig.newSensortagConfigPrompt = function() 
{
	
	// Prompt user to overwrite file or create a copy of current one
	navigator.notification.prompt(
		'Would you like to create a copy of the current file or a new configuration file: \n' 
			+ snaplabs.sensortagconfig.currentSensorTagConfigFile.fullPath + '.',  // message
        function(results){
			snaplabs.sensortagconfig.selectSensorTagConfigFileToWrite(results, newMetadata);
		},     // callback to invoke
		'New SensorTag Configuration File ', // title
		['Create a Copy','Create New File'],   // buttonLabels
		"New File Name"             // defaultText
	);
	//snaplabs.sensortagconfig.readSensorTagConfigFile(snaplabs.sensortagconfig.currentSensorTagConfigFile, snaplabs.sensortagconfig.updateSensorTagConfigFileMetadata, newMetadata);
	
	
}

/*
 *Update the SensorTag configuration file with a new institution and owner
 */
snaplabs.sensortagconfig.updateSensorTagConfigFileMetadata = function(sensorData, newData) 
{
	console.log("DEBUG - Updating file with new Sensortag " + JSON.stringify(newData) )
	console.log("DEBUG - Original Values " + sensorData.institution +" and " + sensorData.owner )
	if(newData.institution != "")
	{
		sensorData.institution = newData.institution; 
	}
	if(newData.owner != "")
	{
		sensorData.owner = newData.owner; 
	}
	var fullSensorData = {}
	fullSensorData.sensortagMapping = sensorData
	console.log("DEBUG - checking new data: " + JSON.stringify(fullSensorData))
	// If the default file is in use, create a "current file" copy
	
    snaplabs.file.writeTextToFile(snaplabs.sensortagconfig.currentSensorTagConfigFile, JSON.stringify(fullSensorData), false);
	//hideElementView("institutionOwnerUpdate");
}

/*
 * Create a new SensorTag Configuration file
 */
snaplabs.sensortagconfig.newSensorTagConfigFile = function() {
	var dataObjTemp = $('#newSensorTagConfigForm').serializeJSON();
	
	var d = new Date();
	// Set up correct File Name for the investigation
	var fileNameDefault = snaplabs.session.user + "_sensorTagConfig_" + formatDateToString(d)
	fileName = dataObjTemp.sensortagconfigfilename || fileNameDefault

	console.log("Debug - data recieved id " + JSON.stringify(dataObjTemp))
	 
	var data = {}
	data.sensortagMapping = {}
	data.sensortagMapping.institution = dataObjTemp.institution 
	data.sensortagMapping.owner = dataObjTemp.owner
	data.sensortagMapping.sensortags = {};
	console.log("DEBUG - new file string is:" + JSON.stringify(data))

	if(dataObjTemp["copy-or-new-radio"] == "copy")
	{
		console.log("DEBUG - Creating a copy of existing file")
		snaplabs.file.copyFile(snaplabs.storage.sensortagConfigDir, snaplabs.sensortagconfig.currentSensorTagConfigFile.fullPath, fileName) 
		console.log("DEBUG - reading new file and adding data")
		snaplabs.storage.sensortagConfigDir.getFile(fileName, {create: true, exclusive: false}, function(fileEntry) {
			snaplabs.sensortagconfig.currentSensorTagConfigFile = fileEntry
			snaplabs.sensortagconfig.readSensorTagConfigFile(snaplabs.sensortagconfig.currentSensorTagConfigFile, snaplabs.sensortagconfig.updateSensorTagConfigFileMetadata, data);
		}, snaplabs.file.errorHandler);
	}
	else
	{
		console.log("DEBUG - creating new file to write")
		
		snaplabs.storage.sensortagConfigDir.getFile(fileName, {create: true, exclusive: false}, function(fileEntry) {
			snaplabs.file.writeTextToFile(fileEntry, JSON.stringify(data), false); 
			snaplabs.sensortagconfig.currentSensorTagConfigFile = fileEntry
		}, snaplabs.file.errorHandler);		
	}
		
	return true;
}

/*
* User prompt to overwrite or create new file function
*
*/
snaplabs.sensortagconfig.selectSensorTagConfigFileToWrite = function(overwrite, newMetadata)
{
	console.log("DEBUG - chosen option was " + JSON.stringify(overwrite) )
	if(overwrite.buttonIndex == 1)
	{
		console.log("DEBUG - Creating a copy of existing file")
		snaplabs.file.copyFile(snaplabs.storage.sensortagConfigDir, snaplabs.sensortagconfig.currentSensorTagConfigFile, overwrite.input1) 
		console.log("DEBUG - reading new file and adding data")
		snaplabs.storage.sensortagConfigDir.getFile(overwrite.input1, {create: true, exclusive: false}, function(fileEntry) {
			snaplabs.sensortagconfig.currentSensorTagConfigFile = fileEntry
			snaplabs.sensortagconfig.readSensorTagConfigFile(snaplabs.sensortagconfig.currentSensorTagConfigFile, snaplabs.sensortagconfig.updateSensorTagConfigFileMetadata, newMetadata);
		}, snaplabs.file.errorHandler);
	}
	else
	{
		console.log("DEBUG - creating new file to write")
		
		snaplabs.storage.sensortagConfigDir.getFile(overwrite.input1, {create: true, exclusive: false}, function(fileEntry) {
			snaplabs.file.writeTextToFile(fileEntry, JSON.stringify(data), false); 
			snaplabs.sensortagconfig.currentSensorTagConfigFile = fileEntry
		}, snaplabs.file.errorHandler);
		//snaplabs.storage.sensortagConfigDir.getFile(overwrite.input1, {create: true, exclusive: false}, function(fileEntry) {
		//	snaplabs.sensortagconfig.readSensorTagConfigFile(fileEntry, snaplabs.sensortagconfig.updateSensorTagConfigFileMetadata, newMetadata);
		//}
		//, snaplabs.file.errorHandler);
	}
	
	alert("SensorTag Mapping file updated")
}

/* 
* onStartScanButton
* Called to connect for finding the sensortags for naming in the config file
* 
*/
snaplabs.sensortagconfig.onStartScanButton = function() 
{
	evothings.ble.startScan(snaplabs.devices.deviceFound, snaplabs.devices.onScanError );
	snaplabs.ui.displayStatus('Scanning...');
	updateTimer = setInterval(snaplabs.ui.displayDeviceList, 500);
	snaplabs.ui.displayValue('StatusData', "Searching for SensorTags. To connect, press one of the green SensorTag connection buttons below.")
	snaplabs.ui.hideElementView("startScanButton")
	snaplabs.ui.showElementView("pauseScanButton")
};


// Called when Pause Scan button is selected.
snaplabs.sensortagconfig.onPauseScanButton = function()
{
	evothings.ble.stopScan();
	snaplabs.devices.found = {};
	snaplabs.ui.displayStatus('Scan Paused');
	snaplabs.ui.displayValue("StatusData","Scanning Paused. Click on a green SensorTag connection button to add or change configuration file.")
	clearInterval(updateTimer);
	snaplabs.ui.showElementView("startScanButton")
	snaplabs.ui.hideElementView("pauseScanButton")
};

// Called to reset the scan button
snaplabs.sensortagconfig.onResetScanButton = function(){
	evothings.ble.stopScan();
	snaplabs.devices.found = {};
	snaplabs.ui.displayStatus('Scan Paused');
	snaplabs.ui.displayValue("StatusData","Scanning Paused. Click on a green SensorTag connection button to add or change configuration file.")
	//displayDeviceList();
	clearInterval(updateTimer);
	snaplabs.ui.showElementView("startScanButton")
	snaplabs.ui.hideElementView("pauseScanButton") 
	document.getElementById("found-devices").innerHTML = ''
}
/*
* addToConfig
* Add a sensortag to the configuration file
*/

snaplabs.sensortagconfig.addToConfig = function(systemID)
{
	console.log("DEBUG - addToConfig passed sysID is " + systemID)
	console.log("DEBUG - addToConfig the current config file is " + snaplabs.sensortagconfig.currentSensorTagConfigFile.fullPath)
	snaplabs.ui.displayValue("StatusData", "Searching configuration file for SensorTag ...") 

	snaplabs.sensortagconfig.checkForExistingSensortag(snaplabs.sensortagconfig.currentSensorTagConfigFile,
		systemID);

	snaplabs.ui.displayValue(device.address+'Connect', "Connected: " + device.address)
	snaplabs.ui.showElementView(device.address+'Disconnect')

}

/* 
* snaplabs.sensortagconfig.lookUpSensortagMapping
* Check if name of sensortag is in mapping data
*/
snaplabs.sensortagconfig.lookUpSensortagMapping = function(systemID)
{
	console.log("DEBUG - Looking up " + systemID + " in " + JSON.stringify(snaplabs.sensortagconfig.sensortagMappingData))
	if(snaplabs.sensortagconfig.sensortagMappingData && snaplabs.sensortagconfig.sensortagMappingData[systemID])
	{
		return snaplabs.sensortagconfig.sensortagMappingData[systemID]
	}
	else
	{
		return "Unnamed Tag"
	}
	
}
/*
 * Check whether current SysID is in Config File 
 */
snaplabs.sensortagconfig.checkForExistingSensortag = function(fileName, newSysID)
{
	console.log("DEBUG - looking for " + newSysID + " in " + fileName.fullPath)
    snaplabs.storage.sensortagConfigDir.getFile(fileName.fullPath, {create: false, exclusive: false}, function(fileEntry) {
		snaplabs.sensortagconfig.readSensorTagConfigFile(fileEntry, function(mappingData){
			if(newSysID in mappingData)
			{
				alert("This SensorTag already exists in the configuration file. \nSelect DISCONNECT if you would like to connect to a different SensorTag or press a key on the SensorTag to update the configuration file.")
				snaplabs.ui.displayValue("StatusData","SensorTag found in configuration file.")
				//showElementView('deviceInfo');
			}else{
				alert("You are connecting to a SensorTag. \nOnce connected, press any key on the SensorTag to add it to the configuration file.")
				snaplabs.ui.displayValue("StatusData","New SensorTag found (not in configuration file).")
				//showElementView('deviceInfo');
			}
			
		})
	})
}

snaplabs.sensortagconfig.addSensor = function(results,systemID)
{
	var newSensor = {};
	newSensor.name = results.input1;
	//newSensor.systemID = snaplabs.devices.getSystemID(device);
	newSensor.systemID = systemID;
	console.log("DEBUG - read sensor ID as " + newSensor.systemID)
	// Add for a new file
	snaplabs.sensortagconfig.readSensorTagConfigFile(snaplabs.sensortagconfig.currentSensorTagConfigFile, snaplabs.sensortagconfig.updateSensorTagConfigFileSensors, newSensor);
}

/*
 * Update the SensorTag configuration file with a new Sensor Name
 */ 
snaplabs.sensortagconfig.updateSensorTagConfigFileSensors = function(sensorData, newData) {
	console.log("DEBUG - Updating file with new Sensortag " + JSON.stringify(newData) +". Adding to :" +  JSON.stringify(sensorData))
	if(newData.systemID in sensorData.sensortags)
	{
		console.log("Debug - changing name for " + sensorData.sensortags[newData.systemID] + " to " + newData.name)
		sensorData.sensortags[newData.systemID] = newData.name; 
        snaplabs.file.writeTextToFile(snaplabs.sensortagconfig.currentSensorTagConfigFile, JSON.stringify(sensorData), false);
		alert("Sensortag name updated to " + newData.name + ".\nPlease mark the SensorTag with this name")
	}else
	{
		console.log("DEBUG - adding sensorTag to file")
		sensorData.sensortags[newData.systemID] = newData.name; 
        snaplabs.file.writeTextToFile(snaplabs.sensortagconfig.currentSensorTagConfigFile, JSON.stringify(sensorData), false);
		alert("Sensortag is now named " + newData.name + ".\nPlease mark the SensorTag with this name")
	}
}


/*
 * To load the shipped config files into the root of the experiment directory
 * These are currently hardcoded 
 *
 */ 
snaplabs.experimentconfig.loadDefaultFiles = function(){
	var defaultFiles = ['Balloon_Pressure_Investigation.json', 'Magnetic_Mining_Investigation.json', 'Classroom_Heat_and_Light_Investigation.json', 'Rocket_Acceleration_Investigation.json', 'Investigating_the_SensorTags.json']
	
	for (var i = 0; i < defaultFiles.length; i++){
		(function(i) { 
			jQuery.getJSON(defaultFiles[i], function(data){         
				if(data.experimentConfig){
					snaplabs.storage.experimentConfigDir.getFile(defaultFiles[i], {create: true, exclusive: false}, function(fileEntry) {
						//console.log("DEBUG - going to write file read from " + defaultFiles[i] + " with new fileEntry " + fileEntry.fullPath)
						snaplabs.file.writeTextToFile(fileEntry, JSON.stringify(data), false);
					}, snaplabs.file.errorHandler);
				}
				else{
					console.log("DEBUG - Error in copying default Experiment file in snaplabs.sensortagconfig.loadDefaultFiles for file " + defaultFiles[i])
				}
			})
		})(i);
	}
	
} 

/*
 * Read the SensorTag or experiment Configuration file
 */
snaplabs.experimentconfig.readConfigFile = function(dir, fileName, supressAlert) {

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
							snaplabs.experimentconfig.runExperiment(null),   // callback
							'Error',            // title
							'OK'                  // buttonName
						);
						console.log("DEBUG - error with result " + this.result)
					}
				} 
				if (json){ 
					if(json.experimentConfig){ 
						//window.location.href="#pageExperiment"
						snaplabs.experimentconfig.runExperiment(json.experimentConfig);
						console.log("DEBUG - experiment file")
					} 
					else if(json.sensortagMapping){
						readSensortagConfig(json.sensortagMapping, supressAlert);
						console.log("DEBUG - sensortag mapping file")
					}
					else{
						navigator.notification.alert(
							'There is an error in the file. Please choose another file.\n\n',  // message
							snaplabs.experimentconfig.runExperiment(null),         // callback
							'Error',            // title
							'OK'                  // buttonName
						);
					}
				}
			};
			reader.readAsText(file);
		}, snaplabs.file.errorHandler);  
	}, snaplabs.file.errorHandler);
}


/*
 * runExperiment (replaces experimetConfiguration from ExperimentApp.js)
 * Read Experiment Config File and display the experiment interface
 */
snaplabs.experimentconfig.runExperiment = function(data) 
{
	snaplabs.devices.closeAllConnections()
	//experimentSensorDisplay = [] // Initialise the sensors registered to be empty
	snaplabs.experimentconfig.experimentSensortags = []
	
	// Save the experiment configuration data and check it exists before continuing
	expConfigData = snaplabs.experimentconfig.checkConfigData(data)
	//expConfigData = data;
	
	if(data==null){
		document.getElementById("labTitle").innerHTML = "Experiment Configuration Not Valid";
		return false;
	} 

	
	// Read and display the sampling interval
	snaplabs.experimentconfig.configuredSampleInterval = data.sampleInterval || 1000
	document.getElementById("sampleInterval").innerHTML = snaplabs.experimentconfig.configuredSampleInterval

	console.log("Grid Footer - read values are: " +expConfigData.captureOnClick + " and " + expConfigData.grids + " and " + expConfigData.graphs )
	// Display the footer buttons if required - Connection, capture on click, graph start
	if(expConfigData.captureOnClick == "on" || expConfigData.grids == "on")
	{
		document.getElementById('footerCoCButton').style.display = "inline"
		document.getElementById('footerClearGrid').style.display = "inline"
	}
	else
	{
		document.getElementById('footerCoCButton').style.display = "none"
		document.getElementById('footerClearGrid').style.display = "none"
	}
	if(expConfigData.graphs == "on")
	{
		document.getElementById('footerStartGraphsButton').style.display = "inline"
		document.getElementById('footerResetGraphsButton').style.display = "inline"
	}
	else
	{
		document.getElementById('footerStartGraphsButton').style.display = "none"
		document.getElementById('footerResetGraphsButton').style.display = "none"
	}
	
	// Clear experiment data
	var experiment = document.getElementById('experiment')
	experiment.innerHTML = "";
	
	// Add the title
	var labtitle = data.labTitle || "Default Experiment Title"
	document.getElementById("labTitle").innerHTML = labtitle + "<img src='ui/images/GrayLogoColour2.jpg'>"; // Add image for Asell
	
	// Display the SensorTags according to the configfile
	for(id in expConfigData.sensorTags){
		
		var sensorTagData = data.sensorTags[id];
		//console.log("DEBUG - sensortag " + id + " data is " + JSON.stringify(sensorTagData))
			
		// Diplay SensorTag data if configured
		if(sensorTagData.connect==="on"){
			// Set up an object for each sensorta.  This will include the sensors to be enabled.
			console.log("DEBUG - about to set up snaplabs.experimentconfig.experimentSensortags for  " + id)
			snaplabs.experimentconfig.experimentSensortags[id] = {}
			snaplabs.experimentconfig.experimentSensortags[id].sensors = []
		
			//Set SensorTag Name if not supplied
			var title;
			if(sensorTagData.title==""){
				title = "";
			}else{
				title = sensorTagData.title + ":"
			}
			
 			// Add each SensorTag name and status
			var sensortagAddString = ""
			sensortagAddString +=	"<div class='ui-grid-a ui-responsive'>"
			sensortagAddString +=		"<div class='ui-block-a'>"
			sensortagAddString += 			"<h3 id=\"sensorTagLabel"+id+"\"><strong> "+title+"</strong> <span id=\"SystemID"+id+"\"> ? </span> </h3>";
			sensortagAddString +=		"</div>"
			sensortagAddString +=		"<div class='ui-block-b' style='text-align: right;'>"
			sensortagAddString += 			"<h3><strong>Status:</strong> <span id=\"StatusData"+id+"\">NOT CONNECTED</span></h3>";
			sensortagAddString +=		"</div>"
			sensortagAddString +=	"</div>"
			
			console.log("DEBUG - list for sensors etc is " + sensortagAddString)
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
				sensorAddDataString += 	"<div id=\""+sensor+id+"\" class=\"sensorReadingEntry\" > <br>"
				sensorAddDataString +=		"<span id=\""+sensor+"Label"+id+"\" class=\"sensorReadingLabel\"><strong>" + sensorLabel +": </strong></span>"	
				sensorAddDataString +=		"<span id=\""+sensor+"Data"+id+"\" class=\"sensorReadingValue\"> Waiting for value </span></p>"
				// add 'Click' button if "capture on click"
				//if(sensorProps.captureOnClick=="on" && sensorProps.grid.griddisplay!="on")
				//	sensorAddDataString += 	"<p><button id=\""+sensor+id+"CoCButton\" class='asellbrightgreen' onclick='captureOnClick(\"" + sensor +id +"\", "+ id + ")'> Capture "+sensor+" value</button></p>";
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
					sensorAddGraphString += 	"<div id=\""+sensor+id+"GraphCanvas\" class=\"sensorGraph resizeable\" style='height:200px; width: 100%'><p>"
					sensorAddGraphString += 		"<span id=\""+sensor+"GraphTitle"+id+"\" class=\"sensorGraphTitle\">"
					sensorAddGraphString +=			"</span>"
					sensorAddGraphString +=		"</div>"
					//Set up each div for the sensors start/stop graph button
					//sensorAddGraphString +=		"<div class='ui-grid-a ui-responsive'>"
					//sensorAddGraphString +=			"<div class='ui-block-a'>"
					//sensorAddGraphString += 			"<button data-mini='true' id='toggleGraphButton"+sensor+id+"' type='button' onclick='toggleDrawGraphs(\"" + sensor + id +"\"," + id+ ");' class='asellbrightgreen'>"
					//sensorAddGraphString += 			"Start "+sensor+" Graphing (connect to SensorTag)"
					//sensorAddGraphString += 			"Start "
					//sensorAddGraphString +=			"</div>" 
					//Set up each div for the reset graph button
					//sensorAddGraphString +=			"<div class='ui-block-b' style='text-align: right;' id=\""+sensor+id+"GraphReset\" >"
					//sensorAddGraphString += 			"<button data-mini='true' id='resetGraphButton"+sensor+id+"' type='button' onclick='resetGraph(\"" + sensor +"\"," + id+ ");' class='charcoal' >"
					//sensorAddGraphString += 			"Reset"
					//sensorAddGraphString += 			"</button>"
					//sensorAddGraphString +=			"</div>"
					//sensorAddGraphString +=		"</div>"
					//sensorAddGraphString +=	"</div><p>"
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
						sensorAddGridString += 			"<button class='asellbrightgreen' onclick='snaplabs.grid.captureOnClickGrid(\"" + sensor +id +"\", \""+ id + "\", \"" + cellCount + "\")'> "+cellCount+ "</button>"
						sensorAddGridString += 	"</div></div>"
						//console.log("Debug - the function is: " + " onclick='snaplabs.grid.captureOnClickGrid(\"" + sensor +id +"\", \""+ id + "\", \"" + cellCount + "\")'")
						
						cellCount++
						sensorAddGridString +=  "<div class='ui-block-b'><div class='ui-bar  border-grid widgetblock'  id='"+sensor+"Grid"+cellCount+"'>"
						sensorAddGridString += 			"<button class='asellbrightgreen' onclick='snaplabs.grid.captureOnClickGrid(\"" + sensor +id +"\", \""+ id + "\", \"" + cellCount + "\")'>  "+cellCount+ "</button>"
						sensorAddGridString += 	"</div></div>"
						cellCount++
						if(sensorProps.grid.columns > 2)
						{
							sensorAddGridString +=     "<div class='ui-block-c'><div class='ui-bar  border-grid widgetblock' id='"+sensor+"Grid"+cellCount+"'>"
							sensorAddGridString += 			"<button class='asellbrightgreen' onclick='snaplabs.grid.captureOnClickGrid(\"" + sensor +id +"\", \""+ id + "\", \"" + cellCount + "\")'>  "+cellCount+ "</button>"
							sensorAddGridString += 	"</div></div>"
							cellCount++
						}
						if(sensorProps.grid.columns > 3)
						{
							sensorAddGridString +=     "<div class='ui-block-d'><div class='ui-bar  border-grid widgetblock' id='"+sensor+"Grid"+cellCount+"'>"
							sensorAddGridString += 			"<button class='asellbrightgreen' onclick='snaplabs.grid.captureOnClickGrid(\"" + sensor +id +"\", \""+ id + "\", \"" + cellCount + "\")'>  "+cellCount+ "</button>"
							sensorAddGridString += 	"</div></div>"
							cellCount++
						}
						if(sensorProps.grid.columns > 4)
						{
							sensorAddGridString +=     "<div class='ui-block-e'><div class='ui-bar  border-grid widgetblock' id='"+sensor+"Grid"+cellCount+"'>"
							sensorAddGridString += 			"<button class='asellbrightgreen' onclick='snaplabs.grid.captureOnClickGrid(\"" + sensor +id +"\", \""+ id + "\", \"" + cellCount + "\")'>  "+cellCount+ "</button>"
							sensorAddGridString += 	"</div></div>"
							cellCount++
						}
					}
					//sensorAddGridString += "</div>"
					//sensorAddGridString += "<div>"
					//sensorAddGridString += "<button class='asellbrightgreen' onclick='clearGrid(\"" + sensor +"\", \""+ id + "\", \"" + cellCount + "\")'> Clear Grid </button>"
					sensorAddGridString += "</div>"
					snaplabs.grid.cellCount = cellCount
				}

				experiment.innerHTML += sensorAddDataString + sensorAddGraphString + sensorAddGridString
				//console.log("DEBUG - html is " + sensorAddDataString + sensorAddGraphString + sensorAddGridString )

				//Hide the data div if required
				document.getElementById(sensor+id).style.display = sensorProps.data.display==="on"  ? "block" : "none";


				if(expConfigData.graphAutoStart == "on" && sensorProps.graph.graphdisplay==="on"){
					document.getElementById("toggleGraphButton"+sensor+id).style.display = sensorProps.graph.graphdisplay==="on" && expConfigData.graphAutoStart != "on" ? "block" : "none";
					graphDisplay[sensor+id]=true;
					changeButtonColour("resetGraphButton"+sensor+id,"asellbrightgreen")
					console.log("Debug - setting graph diplay true for " + sensor+id)
				}
				// Reset the graphs if they have been created before
				if(datapoints.initialised)
				{
					snaplabs.graph.resetGraph(sensor,id)
					snaplabs.graph.graphDisplay[sensor+id]=false;
				}
				
				//Activate the sensortag handler
				if(sensorProps.data.display==="on" || sensorProps.graph.graphdisplay==="on" || sensorProps.grid.griddisplay==="on")
				{
					snaplabs.experimentconfig.experimentSensortags[id].sensors.push(sensor)

					//console.log("DEBUG - the sensortag object for id  " + id + " added " + sensor);
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
		video +=		"<button class='asellgreen' id='startVideo' onclick=\"snaplabs.media.startVideo('" + tempVideoPrefix + "')\" > Start Video </button>"
		video +=	"</div>"
		experiment.innerHTML += video
		//console.log("DEBUG - video Prefix is " + tempVideoPrefix)
	}

	
	// show Data Storage if allowed and set the prefix for the file
	if(data.dataStorageAllowed == "on"){
		console.log("DEBUG - Data Storage is allowed")
		var tempPrefix = ""
		if('dataStoragePrefix' in data) 
			tempPrefix = data.dataStoragePrefix
			
		snaplabs.storage.dataStoragePrefix = tempPrefix
		snaplabs.ui.showElementViewInline('initDataStorage')
	}
	

	
	
	// Initialise the graph if Autostart is set
	if(expConfigData.graphAutoStart == "on"){
		snaplabs.graph.initGraphDrawing();	
	} 

	// Initialise the captureOnClick values for captureOnClick
	if(!snaplabs.captureOnClick.initialised)
	{
		snaplabs.graph.initGridDrawing();
	}
	
}

/*
 * quickDesignConfiguration 
 * Submit information from form, validate and fill out missing information and save
 */
 
snaplabs.experimentconfig.quickDesignConfiguration = function(){
	var dataObjTemp = $('#quickDesignForm').serializeJSON();
	console.log("DEBUG - Form for quick design is: " + JSON.stringify(dataObjTemp) )
	var newDataObj = dataObjTemp


	// Check if the field exists in the formObject, if not create it and set to default value
	newDataObj.labTitle = dataObjTemp.labTitle || "Investigation"
	var d = new Date();
	// Set up correct File Name for the investigation
	var fileName = snaplabs.session.user + "_" + newDataObj.labTitle.replace(/ /g,'') + "_" + formatDateToString(d)
	console.log("DEBUG - file name is: " + fileName  + ", before replaced is " +newDataObj.labTitle)

	newDataObj.dataStorageAllowed = dataObjTemp.dataStorageAllowed || "on"
	newDataObj.videoAllowed = dataObjTemp.videoAllowed || "off"
	newDataObj.dataStoragePrefix = dataObjTemp.dataStoragePrefix || fileName
	newDataObj.videoPrefix = dataObjTemp.labTitle || fileName
	newDataObj.graphAutoStart = dataObjTemp.graphAutoStart || "off"

	for (var i=0; i<2; i++)
	{
		newDataObj.sensorTags[i] = dataObjTemp.sensorTags[i] || {};
		newDataObj.sensorTags[i].connect = dataObjTemp.sensorTags[i].connect || "off"
		newDataObj.sensorTags[i].title = dataObjTemp.sensorTags[i].title || "SensorTag"
		newDataObj.sensorTags[i].sensors = dataObjTemp.sensorTags[i].sensors || {}
		for(var j=0 ;j<sensorList.length;j++){
			var sensorName = sensorList[j]
			newDataObj.sensorTags[i].sensors[sensorName] = dataObjTemp.sensorTags[i].sensors[sensorName] || {}
			newDataObj.sensorTags[i].sensors[sensorName].data = dataObjTemp.sensorTags[i].sensors[sensorName].data || {}
			newDataObj.sensorTags[i].sensors[sensorName].data.display = dataObjTemp.sensorTags[i].sensors[sensorName].data.display || "off"
			newDataObj.sensorTags[i].sensors[sensorName].data.label = dataObjTemp.sensorTags[i].sensors[sensorName].data.label || sensorName
			newDataObj.sensorTags[i].sensors[sensorName].graph = dataObjTemp.sensorTags[i].sensors[sensorName].graph || {}
			newDataObj.sensorTags[i].sensors[sensorName].graph.graphdisplay = dataObjTemp.sensorTags[i].sensors[sensorName].graph.graphdisplay || "off"
			newDataObj.sensorTags[i].sensors[sensorName].graph.graphType = dataObjTemp.sensorTags[i].sensors[sensorName].graph.graphType || "spline"
			newDataObj.sensorTags[i].sensors[sensorName].graph.graphTitle = dataObjTemp.sensorTags[i].sensors[sensorName].graph.graphTitle || sensorName + " Graph"
			newDataObj.sensorTags[i].sensors[sensorName].graph.graphXAxis = dataObjTemp.sensorTags[i].sensors[sensorName].graph.graphXAxis || "Time (s)"
			newDataObj.sensorTags[i].sensors[sensorName].graph.graphYAxis = dataObjTemp.sensorTags[i].sensors[sensorName].graph.graphYAxis || sensorName
			newDataObj.sensorTags[i].sensors[sensorName].captureOnClick = dataObjTemp.sensorTags[i].sensors[sensorName].captureOnClick || "off"
			newDataObj.sensorTags[i].sensors[sensorName].grid = dataObjTemp.sensorTags[i].sensors[sensorName].grid || {}
			newDataObj.sensorTags[i].sensors[sensorName].grid.griddisplay = dataObjTemp.sensorTags[i].sensors[sensorName].grid.griddisplay || "off"
			newDataObj.sensorTags[i].sensors[sensorName].grid.columns = dataObjTemp.sensorTags[i].sensors[sensorName].grid.columns || "4"
			newDataObj.sensorTags[i].sensors[sensorName].grid.rows = dataObjTemp.sensorTags[i].sensors[sensorName].grid.rows || "4"
			
			switch (sensorName)
			{
				case "Temperature":
					newDataObj.sensorTags[i].sensors[sensorName].parameters = dataObjTemp.sensorTags[i].sensors[sensorName].parameters || {}
					newDataObj.sensorTags[i].sensors[sensorName].parameters.ambient = dataObjTemp.sensorTags[i].sensors[sensorName].parameters.ambient || "on"
					newDataObj.sensorTags[i].sensors[sensorName].parameters.IR = dataObjTemp.sensorTags[i].sensors[sensorName].parameters.IR || "on"
					break;
				case "Magnetometer":
				case "Accelerometer":
					newDataObj.sensorTags[i].sensors[sensorName].parameters = dataObjTemp.sensorTags[i].sensors[sensorName].parameters || {}
					newDataObj.sensorTags[i].sensors[sensorName].parameters.xyz = dataObjTemp.sensorTags[i].sensors[sensorName].parameters.xyz || "on"
					newDataObj.sensorTags[i].sensors[sensorName].parameters.scalar = dataObjTemp.sensorTags[i].sensors[sensorName].parameters.scalar || "on"
					break;
			}
		}
	}


	alert("Your configuration file has been saved to: " + fileName +".json" + ".\n\n Please make a note of this name.");
	
	//check the form for setting global values
	//var newData = snaplabs.experimentconfig.checkForm(newDataObj)
	
	snaplabs.experimentconfig.submitExperimentConfig(newDataObj, fileName+".json")
	//console.log("DEBUG - After manipulation oject is: " + JSON.stringify(newDataObj) )
}

/*
 * resetQuickDesign 
 * Reset widgets to oriinal position
 */
snaplabs.experimentconfig.resetQuickDesign = function()
{
	$('.widgetItem','#canvaspanel').each(function() {
		var itemid = $(this).attr("itemid");
		var sensor = itemid.split("_");
 
		$(this).appendTo("#"+sensor[0]+"_Selection");

		//console.log("DEBUG - looping through widgets. Item id is " + itemid)
	});
}
/*
 * submitQuickExperimentConfig 
 * Submit the information from the form to the config file to save
 */
snaplabs.experimentconfig.submitExperimentConfig = function(dataObj, fileName) 
{
	var openingStr = "callback({\n\"experimentConfig\": \n"; 
	var closingString = "}} )";
	var openingStrJson = "{\n\"experimentConfig\": \n";
	var closingStringJson = "} ";

	//console.log("DEBUG - written String is: " + openingStrJson + JSON.stringify(dataObj) + closingStringJson )
	
	var isAppend = false;
	//snaplabs.file.writeTextToFileAndCopy(tempFile, openingStrJson + JSON.stringify(dataObj) + closingStringJson, isAppend, tempFileName, fileName ); 
	snaplabs.file.createFile(snaplabs.storage.userExperimentConfigDir, fileName,  openingStrJson + JSON.stringify(dataObj) + closingStringJson, isAppend)
	
}


/*
 * snaplabs.experimentconfig.submitFullDesign 
 * Prompt User for the configuration File Name and submit the design
 */
snaplabs.experimentconfig.submitFullDesign = function() 
{

	var d = new Date();
	var defaultFileName = snaplabs.session.user + "_Investigation_" + formatDateToString(d) +".json"
	navigator.notification.prompt(
		'Please enter the file name for your configuration file',  // message
		snaplabs.experimentconfig.saveConfigFile,     // callback to invoke
		'Configuration File Name ', // title
		['Ok','Exit'],             // buttonLabels
		defaultFileName             // defaultText
	);
}

snaplabs.experimentconfig.saveConfigFile = function(results) {
	// Set file name to one entered by user
	expConfigFileName = results.input1;
	var dataObjTemp = $('#experimentForm').serializeJSON({checkboxUncheckedValue: "off"});
	console.log("Form data: " + JSON.stringify(dataObjTemp))
	//var dataObj = snaplabs.experimentconfig.checkForm(dataObjTemp)
	 
	if(results.buttonIndex===1){
		alert("Your configuration file has been saved to: " + expConfigFileName + ".\n\n Please make a note of this name.");
		$('#experimentFormReset').button('enable');
		$('#experimentFormReset').button('refresh');
		snaplabs.experimentconfig.submitExperimentConfig(dataObj,expConfigFileName);
		
	}else{
		alert("No file saved");
	}
}

/*
* checkConfigData
* Check and consolidate the form data
*/

 
snaplabs.experimentconfig.checkConfigData = function(dataObjTemp){
	console.log("DEBUG - checking form")
	var results = dataObjTemp
	results.captureOnClick = "off"
	results.graphs = "off"
	results.grids = "off"
	 
	for(i in dataObjTemp.sensorTags)
	{
		var sensorTags = dataObjTemp.sensorTags[i]
		//console.log("Debug - found sensortag " + JSON.stringify(sensorTags))
		if(sensorTags.connect=="on")
		{
			for(j in sensorTags.sensors)
			{
				//console.log("Debug - found sensor " + j)
				if(sensorTags.sensors[j].graph.graphdisplay == "on")
					results.graphs = "on"
				if(sensorTags.sensors[j].grid.griddisplay == "on")
					results.grids = "on"
				if(sensorTags.sensors[j].captureOnClick == "on")
					results.captureOnClick = "off"
			}
		}
	}
	return results
 }
 /*
 * loadExperimentConfigFile 
 * Loads up an experiment config file to edit
 */

snaplabs.experimentconfig.loadExperimentConfigFile = function(fileName){
	console.log("DEBUG - loading config for " + fileName)
	$("body").pagecontainer("change", "#pageFullDesign");
	
	snaplabs.storage.experimentConfigDir.getFile(fileName, {create: false, exclusive: false}, function(fileEntry) {
		fileEntry.file(function(file) {
			var reader = new FileReader();

			reader.onloadend = function(e) {
				//console.log("DEBUG - Data read is: " + this.result);
				var data = JSON.parse(this.result)
				snaplabs.ui.populate("#experimentForm", data.experimentConfig)
				console.log("DEBUG - Data sent is: " + JSON.stringify(data.experimentConfig));
			};
			
			reader.readAsText(file);
		}, snaplabs.file.errorHandler);
	}, snaplabs.file.errorHandler);

}





/*
 * Writing text string to a file
 * (Based https://cordova.apache.org/docs/en/latest/reference/cordova-plugin-file/index.html)
 */
snaplabs.file.writeTextToFileAndCopy = function(fileEntry, dataString, isAppend, oldFileName, newFileName) {
    // Create a FileWriter object for our FileEntry (log.txt).
    fileEntry.createWriter(function (fileWriter) {

        fileWriter.onwriteend = function() {
            console.log("DEBUG - Starting to rename from " + oldFileName + " to " + newFileName + " and store in  " + snaplabs.storage.userExperimentConfigDir.fullPath)
			snaplabs.file.copyFile(snaplabs.storage.userExperimentConfigDir, oldFileName, newFileName);            
        };
        fileWriter.onerror = function (e) {
            console.log("Failed file write: " + e.toString());
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
		//tempFileWriter = fileWriter;
		var blob = new Blob([dataString], {type:'text/plain'});
		console.log("DEBUG - data to write is " + dataString)
        fileWriter.write(blob);
    });
}

/*
 * Copying a file to a new directory
 * from http://www.html5rocks.com/en/tutorials/file/filesystem/
 * cwd is current directory, src is the file name and dest is the destination directory
 */
snaplabs.file.copyToDir = function(cwd, src, dest) {
  cwd.getFile(src, {}, function(fileEntry) {
	console.log("DEBUG - Success in getting src file. Dest file is " + dest.fullPath + fileEntry.name)
     fileEntry.copyTo(dest);
  }, snaplabs.file.errorHandler);
}

/*
 * Copying a file
 * from http://www.html5rocks.com/en/tutorials/file/filesystem/
 */
snaplabs.file.copyFile = function(cwd, src, newName) {
  cwd.getFile(src, {}, function(fileEntry) {
    fileEntry.copyTo(cwd, newName);
  }, snaplabs.file.errorHandler);
}

/*
 * Writing text string to a file
 * (Based https://cordova.apache.org/docs/en/latest/reference/cordova-plugin-file/index.html)
 */
snaplabs.file.writeTextToFile = function(fileEntry, dataString, isAppend) {
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
 * Downloading files from specified server in the form
 * Data retrieved from form and used to download the file
 * 
 */
snaplabs.file.getConfigFile = function(fileType, form) 
{
	var dir = snaplabs.storage.userExperimentConfigDir // default value is for experiment data
	var dataObjTemp = $(form).serializeJSON();
	var ipAddress
	if(fileType == 'sensortagConfig')
	{
		dir = snaplabs.storage.sensortagConfigDir // override with sensortag mapping dir
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
	snaplabs.file.downloadConfig(ipAddress, dataObjTemp.configFileName, dir)
}
/*
 * Creating a file
 * (Based https://cordova.apache.org/docs/en/latest/reference/cordova-plugin-file/index.html)
 */
snaplabs.file.createFile = function(dirEntry, fileName, dataString, isAppend) {
    // Creates a new file or returns the file if it already exists.
    dirEntry.getFile(fileName, {create: true, exclusive: false}, function(fileEntry) {
        snaplabs.file.writeTextToFile(fileEntry, dataString, isAppend); 
		//tempFile = fileEntry;
    }, snaplabs.file.errorHandler);
}
/*
 * Generic config download and save to directory
 * 
 */ 
snaplabs.file.downloadConfig = function(ipAddress, fileName, dir, callback) 
{ 
    var fileTransfer = new FileTransfer();
	configURLLocal = ipAddress + fileName;
	console.log("Getting File: " + configURLLocal)
	
    fileTransfer.download(configURLLocal, cordova.file.dataDirectory + dir.fullPath + fileName, 
        function(entry) {
			navigator.notification.alert(
				'File ' + fileName + ' has been downloaded to directory ' + dir.fullPath, // message
				snaplabs.navigation.goToMain,         // callback
				'Success',            // title
				'OK'                  // buttonName
				);
        }, 
        function(err) {
			navigator.notification.alert(
				'The failed to download. Please check error and try again.\n\n' + (err.body != null ? err.body + " " + 
				err.exception : err.exception),  // message
				snaplabs.navigation.goToMain,         // callback
				'Error',            // title
				'OK'                  // buttonName
				);
			console.log("File download error: " + JSON.stringify(err))
    });
}
 
/*
 * Handling an Experiment File
 * Can be viewed, shared or deleted if Teacher role
 */
snaplabs.file.handleExperimentFile = function(fileName) {
	navigator.notification.confirm(
		'Would you like to view, share or delete this file?', // message
		 function(button) {
			console.log("DEBUG - Experiment File handling for file " + fileName + ", button pressed is " + button)
			if ( button == 1 ) {
				// User selected to View file
				window.location.href="#pageData"
				snaplabs.ui.displayValue("filenameTitle",fileName)
				snaplabs.file.readAndDumpFile(fileName)
			}
			if ( button == 2 ) {
				snaplabs.file.socialShareFile(fileName)
			}
			if ( button == 3 ) {
				if(snaplabs.session.role == TEACHER_ROLE)
				{
					snaplabs.file.deleteFile(fileName);
					snaplabs.ui.listFilesInDiv("EXPERIMENT_DIR",'handleExperimentFileList',snaplabs.ui.handleExperimentFileList)
				}
				else
				{
					alert("You do not have the correct permissions to delete files.")
				}
			}
		 },           // callback to invoke with index of button pressed
		fileName,           // title
		['View','Share', 'Delete']     // buttonLabels
	);
}

/*
 * Handling a saved Data file
 * (Based on https://gist.github.com/deedubbu/1590941)
 * NOTE - this has been updated to view, share or delete!
 */
snaplabs.file.handleSavedDataFile = function(fileName) {

	navigator.notification.confirm(
		'Would you like to view, share or delete this file?', // message
		 function(button) {
			console.log("DEBUG - Saved data File handling for file " + fileName)
			if ( button == 1 ) {
				if(fileName.split(".").pop() == "3gp")
				{
					alert("Video files cannot be viewed in this app.")
				}else
				{
					// User selected to View file
					window.location.href="#pageData"
					snaplabs.ui.displayValue("filenameTitle",fileName)
					snaplabs.file.readAndDumpFile(fileName)
				}
			}
			if ( button == 2 ) {
				snaplabs.file.socialShareFile(fileName) 
			}
			if ( button == 3 ) {
				if(snaplabs.session.role == TEACHER_ROLE)
				{
					snaplabs.file.deleteFile(fileName);
					snaplabs.ui.listFilesInDiv("SAVEDDATA_DIR",'handleSavedDataFileList',snaplabs.ui.handleSavedDataFileList)
				}
				else
				{
					alert("You do not have the correct permissions to delete files.")
				}
			}
		 },           // callback to invoke with index of button pressed
		fileName,           // title
		['View','Share','Delete']     // buttonLabels
	);
}

/*
 * Handling a saved Data file
 * (Based on https://gist.github.com/deedubbu/1590941)
 * NOTE - this has been updated to view, share or delete!
 */
snaplabs.file.handleSensorTagFile = function(fileName) {

	navigator.notification.confirm(
		'Would you like to view, share or delete this file?', // message
		 function(button) {
			//console.log("DEBUG - Sensor File handling for file " + fileName)
			if ( button == 1 ) {
				// User selected to View file
				window.location.href="#pageData"
				snaplabs.ui.displayValue("filenameTitle",fileName)
				snaplabs.file.readAndDumpFile(fileName)
			}
			if ( button == 2 ) {
				snaplabs.file.socialShareFile(fileName) 
			}
			if ( button == 3 ) {
				if(snaplabs.session.role == TEACHER_ROLE)
				{
					snaplabs.file.deleteFile(fileName);
					snaplabs.ui.listFilesInDiv("SENSORTAG_DIR",'handleSensortagFileList',snaplabs.ui.handleSensorTagFileList)
				}
				else
				{
					alert("You do not have the correct permissions to delete files.")
				}
			}
		 },           // callback to invoke with index of button pressed
		fileName,           // title
		['View','Share','Delete']     // buttonLabels
	);
}
/*
 * Read and dump generic file 
 */
snaplabs.file.readAndDumpFile = function(fileName) {

	//snaplabs.storage.experimentConfigDir.getDirectory(dirName, { create: false }, function (dirEntry) {
	window.resolveLocalFileSystemURL(cordova.file.externalDataDirectory, function(dirEntry) {
		console.log("DEBUG - Got Dir entry: " + dirEntry.fullPath);
		dirEntry.getFile(fileName, {create: false, exclusive: false}, function(fileEntry) {
			console.log("DEBUG - Got File entry: " + fileEntry.fullPath);
			fileEntry.file(function(file) {
				var reader = new FileReader();

				reader.onloadend = function(e) {
					console.log("DEBUG - Text is: " + this.result);
					document.getElementById("dataBlock").innerHTML = this.result;
				};
				
				reader.readAsText(file);
			}, snaplabs.file.errorHandler);
		}, snaplabs.file.errorHandler);
	});
}

/*
 * Social Sharing plugin uses the following finctions
 * Based on  https://github.com/EddyVerbruggen/SocialSharing-PhoneGap-Plugin
 */
 
snaplabs.file.socialShareFile = function(fileShare) {
	//var fileName = "file://file" + fileShare
	//var fileName = filePath
	
/*	window.resolveLocalFileSystemURL(window.cordova.file.externalDataDirectory,
        function onSuccess(dirDest)
        {
			console.log("DEBUG - In Success for resolving file system")
			snaplabs.file.copyDir(dir, fileShare, dirDest)
		},
		console.log("DEBUG - In Fail for resolving file system")
	);             
*/
	fileName = window.cordova.file.externalDataDirectory + fileShare
	console.log("DEBUG - social sharing " + fileName)

	window.plugins.socialsharing.shareViaEmail(
		'Please find attached the data file from the Experiment App', // can contain HTML tags, but support on Android is rather limited:  http://stackoverflow.com/questions/15136480/how-to-send-html-content-with-image-through-android-default-email-client
		'Saved Data File From Experiment App',
		null, // TO: must be null or an array
		null, // CC: must be null or an array
		null, // BCC: must be null or an array
		[fileName], // FILES: can be null, a string, or an array
		snaplabs.file.onSuccessSharing , // called when sharing worked, but also when the user cancelled sharing via email. On iOS, the callbacks' boolean result parameter is true when sharing worked, false if cancelled. On Android, this parameter is always true so it can't be used). See section "Notes about the successCallback" below.
		snaplabs.file.onErrorSharing // called when sh*t hits the fan
	);
}

/*
 * Social Sharing plugin uses the following finctions
 * Based on  https://github.com/EddyVerbruggen/SocialSharing-PhoneGap-Plugin
 */
 
snaplabs.file.onSuccessSharing = function(result) {
  console.log("Share completed? " + result.completed); // On Android apps mostly return false even while it's true
  console.log("Shared to app: " + result.app); // On Android result.app is currently empty. On iOS it's empty when sharing is cancelled (result.completed=false)
}

snaplabs.file.onErrorSharing = function(msg) { 
  console.log("Sharing failed with message: " + msg);
}

/*
 * Copying a file to a new directory
 * from http://www.html5rocks.com/en/tutorials/file/filesystem/
 */
snaplabs.file.copyDir = function(cwd, src, dest) {
  cwd.getFile(src, {}, function(fileEntry) {
	console.log("DEBUG - Success in getting src file. Dest file is " + dest.fullPath + fileEntry.name)
     fileEntry.copyTo(dest);
  }, errorHandler);
}

/*
 * Deleteing a file
 * (Based on https://gist.github.com/deedubbu/1590941)
 */
snaplabs.file.deleteFile = function(fileName) {
	var remove_file = function(entry) {
		entry.remove(function() {
			navigator.notification.alert(entry.toURI(), null, 'Entry deleted');                    
		}, snaplabs.file.errorHandler);
	};
	
	// retrieve a file and truncate it
	window.resolveLocalFileSystemURL(cordova.file.externalDataDirectory, function(dirEntry) {
		dirEntry.getFile(fileName, {create: false}, remove_file, snaplabs.file.errorHandler);
	});
	//alert("Deleting File")
}

/*
 * Error Handler for File Handling
 *
 */
snaplabs.file.errorHandler = function(e) {
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
* For testing around the crashes
*/
snaplabs.setTeacher = function()
{
	snaplabs.session.user = "TestAdmin"
	var x = document.getElementsByClassName("teacherview");
	var i;
	snaplabs.session.role = TEACHER_ROLE
	for (i = 0; i < x.length; i++) {
		//console.log("DEBUG - setting teacher view") 
		x[i].style.display = "block";
	}
	navigator.notification.alert(
		'Welcome ' + snaplabs.session.user,
		snaplabs.navigation.goToMain,
		'Successful Signup',
		'Begin'); 
	snaplabs.server.startServer(snaplabs.server.serverroot);
	
	// Check for Experiment directory 
	snaplabs.storage.experimentConfigDir.getDirectory(snaplabs.session.user, { create: true }, function (dirEntry) {
		// Setting up the files and directories
		snaplabs.storage.userExperimentConfigDir = dirEntry;
		document.getElementById("experimentConfigDirSetting").innerHTML = snaplabs.storage.userExperimentConfigDir.fullPath;
		console.log("DEBUG - Set up new Experiment directory " + snaplabs.storage.userExperimentConfigDir.fullPath)
	}, snaplabs.file.errorHandler); 
		
	// Check for Saved Data directory 
	snaplabs.storage.savedDataDir.getDirectory(snaplabs.session.user, { create: true }, function (dirEntry) {
		// Setting up the files and directories
		snaplabs.storage.userSavedDataDir = dirEntry;
		document.getElementById("savedDataFileDirSetting").innerHTML = snaplabs.storage.userSavedDataDir.fullPath;
		console.log("DEBUG - Set up newSaved Data directory " + snaplabs.storage.userSavedDataDir.fullPath)
	}, snaplabs.file.errorHandler); 
}

/*
* For testing around the crashes
*/
snaplabs.setStudent = function()
{
	snaplabs.session.user = "TestStudent"
	var x = document.getElementsByClassName("teacherview");
	var i;
	snaplabs.session.role = STUDENT_ROLE
	for (i = 0; i < x.length; i++) {
		x[i].style.display = "none";
	}
	navigator.notification.alert(
		'Welcome ' + snaplabs.session.user,
		snaplabs.navigation.goToMain,
		'Successful Signup',
		'Begin'); 

		// Check for Experiment directory - Do Not Create
	snaplabs.storage.experimentConfigDir.getDirectory(snaplabs.session.user, { create: true }, function (dirEntry) {
		// Setting up the files and directories
		snaplabs.storage.userExperimentConfigDir = dirEntry;
		document.getElementById("experimentConfigDirSetting").innerHTML = snaplabs.storage.userExperimentConfigDir.fullPath;
		console.log("DEBUG - Set up new Experiment directory " + snaplabs.storage.userExperimentConfigDir.fullPath)
	}, snaplabs.file.errorHandler); 
		
	// Check for Saved Data directory - DO NOT CREATE
	snaplabs.storage.savedDataDir.getDirectory(snaplabs.session.user, { create: true }, function (dirEntry) {
		// Setting up the files and directories
		snaplabs.storage.userSavedDataDir = dirEntry;
		document.getElementById("savedDataFileDirSetting").innerHTML = snaplabs.storage.userSavedDataDir.fullPath;
		console.log("DEBUG - Set up newSaved Data directory " + snaplabs.storage.userSavedDataDir.fullPath)
	}, snaplabs.file.errorHandler); 
}


Storage.prototype.setObj = function(key, obj) {
    return this.setItem(key, JSON.stringify(obj))
}
Storage.prototype.getObj = function(key) {
    return JSON.parse(this.getItem(key))
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

