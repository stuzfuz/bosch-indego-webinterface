var URL ="https://api.indego.iot.bosch-si.com/api/v1/"; 
var TIMEOUT = 90000;

function handleError(status, error) {
    if (error) {
        console.log(status + " -> " + error);
        console.log(localStorage.getItem("contextId"));
    } else {
        //logout();
        $("#login").hide();
        $("#loading").hide();
        $("#view").hide();
        $("#error").show();
    }
}

function connect() {                   
	  console.log("connect");  	  
	  user = $("#user").val();
	  pass = $("#password").val();

	  if (user == "" || pass == "") {
	  	alert("User or pass not set");
	  	return false;
	  }

 	  
	  $.ajax({          
		  url: URL + "authenticate",
          timeout: TIMEOUT, 
		  type: "POST",  mimeType: "application/json",
		  contentType: "application/json",
		  dataType: "json",		  
          data: JSON.stringify({ device:'', os_type:'Android', os_version:'6.0', dvc_manuf:'unknown', dvc_type:'unknown' }),		  
		  beforeSend: function( xhr ) {
            xhr.setRequestHeader ("Authorization", "Basic " + btoa(user + ":" + pass));
			$("#login").hide();
			$("#loading").show();
          },
          error: function(xhr, status, error){
		      handleError(status, error);
          },
          success: function(result){    						
			console.log("connected");
			console.log(result);
			
			localStorage.setItem("contextId", result['contextId']);
			localStorage.setItem("almSn", result['alm_sn']);
			
			$("#loading").hide();
			$("#view").show();
			getState();
          }
		});      
};


function getAlerts(){
	  $.ajax({          
		  url: URL + "alerts",
          timeout: TIMEOUT, 
		  type: "GET", 
		  contentType: "application/json",
		  dataType: "json",		  
		  beforeSend: function( xhr ) {
            xhr.setRequestHeader ("x-im-context-id", localStorage.getItem("contextId"));
          },
          error: function(xhr, status, error){
              handleError(status, error);
          },
          success: function(result){
          	$("#loading").hide();

          	console.log(result.length);
          	console.log(result[0]);

			if(typeof(result) == "undefined" || result.length == 0) {
			    html = "Keine Fehler gefunden";
            } else {
			    html = "";
			    $.each(result, function(index, value) {
			        html += "<b>" + value.headline + "</b><br />" + value.message + "<br /><a href='#' onclick='deleteAlert(\"" + value.alert_id + "\")'>L&ouml;schen</a><br /><br />";
                });
            }
			$("#output").html(html);
          }
		});      
};

function getCalender() {
    $("#output").html("Funktion noch nicht implementiert!");
    /*$.ajax({
        url: URL + "alms/" +  localStorage.getItem("almSn") + "/predictive/calendar",
        timeout: TIMEOUT,
        type: "GET",
        contentType: "application/json",
        dataType: "json",
        beforeSend: function( xhr ) {
            xhr.setRequestHeader ("x-im-context-id", localStorage.getItem("contextId"));
        },
        error: function(xhr, status, error){
            handleError(status, error);
        },
        success: function(result){
            console.log(result);
            $.each(result.cals, function(index, value) {
               console.log("index: " + value.cal);

               $.each(value.days, function(i, v) {
                    $.each(v.slots, function (k, slot) {
                        console.log(slot.StHr + " - " + slot.EnHr);
                    });
               });

            });

            $("#output").html(html);
            /*parseCalendar();
            nextAutoRequest();*/ /*
        }
    });*/
}

function getMachineState(){
	  $.ajax({          
	     url: URL + "alms/" +  localStorage.getItem("almSn"),
          timeout: TIMEOUT, 
		  type: "GET",
		  contentType: "application/json",
		  dataType: "json",		  		  
		  beforeSend: function( xhr ) {
            xhr.setRequestHeader ("x-im-context-id", localStorage.getItem("contextId"));
              $("#loading").show();
              $("#view").hide();
          },
          error: function(xhr, status, error){
	         handleError(status, error);
          },
          success: function(result){

			  $("#loading").hide();
			  $("#view").show();
			  html = result.alm_mode + "<br />";
			  html += result.alm_firmware_version + "<br />";
			  html += result.alm_name + "<br />";
			  html += result.needs_service + "<br />";

			  html += "<br />";

			  $("#output").html(html);
          }
		});        
};

function getState(longpoll){
    var laststate = 0;
    console.log("getState");
    $.ajax({
        url: URL + "alms/" +  localStorage.getItem("almSn") + "/state" + ( (longpoll==true) ? "?longpoll=true&timeout=600&last=" + laststate : ""),
        //timeout: TIMEOUT,
        timeout: 1000 * 700,
        type: "GET",
        contentType: "application/json",
        dataType: "json",
        beforeSend: function( xhr ) {
            xhr.setRequestHeader ("x-im-context-id", localStorage.getItem("contextId"));
        },
        error: function(xhr, status, error){
        	handleError(status, error);
        },
        success: function(result){

        	console.log(result);

        	state = "";
            switch (parseInt(result["state"])){
                case 519: state = "M&auml;her steht"; break;
                case 257: state = "Laden"; break;
                case 514: state = "Localisieren"; break;
                case 776: state = "F&auml;hrt zur&uuml;ck zur Station"; break;
                case 518: state = "M&auml;ht"; break;
                case 517: state = "Pause"; break;
                case 513: state = "M&auml;ht"; break;
                case 263: state = "Angedocked"; break;
                case 774: state = "F&auml;hrt zur&uuml;ck zur Station"; break;
                default: state = "defaultstate";;
            }
			html = "Status: " + state + "<br />Gemäht: " + result['mowed'] + " %";
        	$('#output').html(html);
        }
    });
};

function toDate(dateTime) {
    var from = dateTime.substr(0, 10).split("-");
    console.log(from);
    return from[2] + "." + from[1] + "." + from[0];
}

function deleteAlert(idx){
    console.log("deletingAlert " + idx);
    $.ajax({
        url: URL + "alerts/" + idx,
        timeout: TIMEOUT,
        type: "DELETE",
        beforeSend: function( xhr ) {
            xhr.setRequestHeader ("x-im-context-id", localStorage.getItem("contextId"));
        },
        error: function(xhr, status, error){
            handleError(status, error);
        },
        success: function(result){
            console.log('deleted');
            getAlerts();
        }
    });
}

function getWeather() {
    $.ajax({
        url: URL + "alms/" +  localStorage.getItem("almSn") + "/predictive/weather",
        timeout: TIMEOUT,
        type: "GET",
        contentType: "application/json",
        dataType: "json",
        beforeSend: function( xhr ) {
            xhr.setRequestHeader ("x-im-context-id", localStorage.getItem("contextId"));
            $("#loading").show();
        },
        error: function(xhr, status, error){
            handleError(status, error);
        },
        success: function(result){
            $("#loading").hide();
            weather = result;
			num = weather.LocationWeather.forecast.intervals.length;
			html = "";
			olddate = "";
			outputdate = "";
			for(i=0;i<num;i++) {
				datetime = weather.LocationWeather.forecast.intervals[i].dateTime;
				datestring = toDate(datetime);
				outputdate = "";
				if(olddate != datestring) {
					olddate = datestring;
					outputdate = (i != 0) ? "</div>" : "" + "<div class='weather-date-entry'>" + datestring + "</div><div id='weather-" + datestring + "'>";
				}
                html += outputdate + datetime.substr(11, 2) + " Uhr -> " + "Regenwahrscheinlichkeit: " +  weather.LocationWeather.forecast.intervals[i].prrr + " -> " + "Grad: " +  weather.LocationWeather.forecast.intervals[i].tt + ": " + weather.LocationWeather.forecast.intervals[i].wwtext + "<br />";
			}

			$('#output').html("<h3>Wettervorhersage für " + weather.LocationWeather.location.country + ", " + weather.LocationWeather.location.name + "</h3>" + html + "</div>");
        }
    });
}

function isAlreadyLoggedIn() {
	if (localStorage.getItem("contextId")) {
		$("#loading").hide();
		$("#login").hide();
	    $("#view").show();
        getState(true);
	}
}

function getMap(){   
	  $.ajax({          
		  url: URL + "alms/" +  localStorage.getItem("almSn") + "/map",
          timeout: TIMEOUT,   
		  type: "GET",  mimeType: "application/html",          
		  beforeSend: function( xhr ) {
            xhr.setRequestHeader ("x-im-context-id", localStorage.getItem("contextId"));
			$("#loading").show();			
          },
          error: function(xhr, status, error){
		      handleError(status, error);
          },
          success: function(result){  
			$("#loading").hide();
			map = result;
			console.log(result);
			$('#output').html("<div style='width: 50%; margin: 0 auto'>" + map + "</div>");
          }
		});      
};

function home(){
  console.log("home");
  $.ajax({
      url: URL + "alms/" +  localStorage.getItem("almSn") + "/state",
      timeout: TIMEOUT,
      type: "PUT",
      contentType: "application/json",
      data: JSON.stringify({ state: 'returnToDock' }),
      beforeSend: function( xhr ) {
        xhr.setRequestHeader ("x-im-context-id", localStorage.getItem("contextId"));
      },
      error: function(xhr, status, error){
          handleError(status, error);
      },
      success: function(result){
        console.log("fahre heim!");
        $("#output").html("fahre heim!");
      }
    });
};

function mow() {
    console.log("mow");
    $.ajax({
        url: URL + "alms/" +  localStorage.getItem("almSn") + "/state",
        timeout: TIMEOUT,
        type: "PUT",
        contentType: "application/json",
        data: JSON.stringify({ state: 'mow' }),
        beforeSend: function( xhr ) {
            xhr.setRequestHeader ("x-im-context-id", localStorage.getItem("contextId"));
        },
        error: function(xhr, status, error){
            handleError(status, error);
        },
        success: function(result){
            console.log("starte mähen!");
            $("#output").html("starte mähen!");
        }
    });
}

function pause() {
    console.log("pause");
    $.ajax({
        url: URL + "alms/" +  localStorage.getItem("almSn") + "/state",
        timeout: TIMEOUT,
        type: "PUT",
        contentType: "application/json",
        data: JSON.stringify({ state: 'pause' }),
        beforeSend: function( xhr ) {
            xhr.setRequestHeader ("x-im-context-id", localStorage.getItem("contextId"));
        },
        error: function(xhr, status, error){
            handleError(status, error);
        },
        success: function(result){
            console.log("bleibe stehen!");
            $("#output").html("bleibe stehen!");
        }
    });
}

function logout() {
	localStorage.removeItem("contextId");
	location.reload();
}

$('#view').ready(function() {
	isAlreadyLoggedIn();
});