var sensortagMappingData
var expConfigURLAWS = "https://s3-ap-northeast-1.amazonaws.com/nerldconfigs/expConfig.jsonp";
var sensontagConfigURLLocal = "https://s3-ap-northeast-1.amazonaws.com/nerldconfigs/sensortagConfig.jsonp";
var expConfigURLLocal = "http://10.17.40.64:8080/this.json"
//"http://www.cs.usyd.edu.au/~tmac2470/test.json"
//"http://10.17.40.64:8080/test.json"
//var expConfigURL = "http://www.cs.usyd.edu.au/~tmac2470/expConfig.json"
var sensontagConfigURLAWS = "https://s3-ap-northeast-1.amazonaws.com/nerldconfigs/sensortagConfig.jsonp";
 
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
 * Loading file hosted on a local Teacher app 10.17.40.64:8080
 * 
 */
loadExpConfigLocal = function() 
{ 
	console.log("local Load");
	var jsonData;
	
	console.log("Getting FIle: " +expConfigURLLocal)
	
	cordovaHTTP.get(
		expConfigURLLocal,  
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
			console.log("Status " +  response.status)
			console.log("Data  " + response.data)
				

			//Set html values based on Config file
			if('experimentConfig' in json){
					experimentConfiguration(json.experimentConfig);
			}
			else{
				alert('Malformed json...'); 
			}
			
		}, 
		function(response)   // on error
		{
			console.log(JSON.stringify(response));
		}
	);

}
/*
 * experimetConfiguration 
 * Change app layout based on input from Experiment Config file
 */
experimentConfiguration = function(data) 
{
	//var expFrame = document.getElementById('experiment').contentWindow.document;
	var experiment = document.getElementById('experiment')
    
	//Set Title of experiment
	if('labTitle' in data){
		document.getElementById("labTitle").innerHTML = data.labTitle;
	}else{
		document.getElementById("labTitle").innerHTML = "Default Experiment Title";
	}
	
	// Clear experiment data
	experiment.innerHTML = "";
	
	// Display the SensorTags according to the configfle
	for(id in data.sensorTags){
		var sensorTagData = data.sensorTags[id];
		
		//Diplay SensorTag data if configured
		if(sensorTagData.connect=="on"){
			
			//Set SensorTag Name if not supplied
			var title;
			if(sensorTagData.title==""){
				title = "SensorTag " + id;
			}else{
				title = sensorTagData.title
			}
			
 			// Add each SensorTag name and a connect button for each
			experiment.innerHTML += "<p><button onclick=\"connection("+id+")\" class=\"green\" id=\"connectionButton"+id+"\"> Connect to "+title+"	</button></p>";
			experiment.innerHTML += "<h2 id=\"sensorTagLabel"+id+"\"> "+title+": <span id=\"SystemID"+id+"\">SensorTag ID</span> </h2>";
			experiment.innerHTML += "<p><strong>Status "+id+":</strong> <span id=\"StatusData"+id+"\">NOT CONNECTED</span></p>";
			//experiment.innerHTML += "<p><strong>Identifier "+id+":</strong> <span id=\"SystemID"+id+"\">SensorTag ID</span></p>";

			//console.log("<p><button onclick=\"connection("+id+")\" class=\"green\" id=\"connectionButton"+id+"\"> Connect to "+sensorTagData.title+"	</button></p>")

				for(sensor in sensorTagData.sensors){
				var sensorProps = sensorTagData.sensors[sensor]

				// Use default label in case 
				var sensorLabel = sensorProps.label=="" ? sensor+ " " +id : sensorProps.label;

				//Set up each div for the sensors
				experiment.innerHTML += "<div id=\""+sensor+id+"\" class=\"sensorReadingEntry\"><p><span id=\""+sensor+"Label"+id+"\" class=\"sensorReadingLabel\"><strong>" + sensorLabel +": </strong></span><span id=\""+sensor+"Data"+id+"\" class=\"sensorReadingValue\"> Waiting for value </span></p></div><p>";
				
				//Hide the div if required
				document.getElementById(sensor+id).style.display = sensorProps.display=="on" ? "block" : "none";
			}
 		}
	} 
}

/*
 * Ajax cross domain call for Jsonp to get sensortag configuration file
 * Load the sensortag mapping data file
 */
loadSensortagConfig = function() 
{
	$.ajax({
		url: sensontagConfigURLAWS,
        jsonpCallback: "callback",
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

