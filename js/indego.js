var URL ="https://api.indego.iot.bosch-si.com/api/v1/"; 
var TIMEOUT = 90000;

function handleError(status, error) {
    if (error) {
        console.log(status + " -> " + error);
        console.log(localStorage.getItem("contextId"));
    } else {
        $("#error").html("Username or password wrong!");
        $("#error").show();
    }
}

function connect() {                   
    console.log("connect");  	  
    user = $("#user").val();
    pass = $("#password").val();

    if (user == "" || pass == "") {
    $("#error").html("Username or password not set!");
    $("#error").show();

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
        sessionStorage.setItem("loggedIn", "true");
        
        location.href="index.html"
        }
    });      
};

function updateTopBanners() {
    setAlerts();
    setState();
}

function showDashboard() {
    $("#content").html("");
    showMap();
    updateTopBanners();
}

function showLoadingImage() {
    $("#content").html("");
    $("#content-loader").show();
}

function hideLoadingImage() {
    $("#content-loader").hide();
}

function setPercentageMowed(percent_mowed) {
    $("#percent_mowed").html(percent_mowed + "% mowed!");
}

function getDropdownAlertsTemplate(id, headline, message) {
    return "<div class=\"dropdown-divider\"></div><span class=\"dropdown-item\" href=\"#\"><span class=\"text-danger\"><strong><i class=\"fa fa-fw\"></i>" + headline + " (" + id + ")!</strong></span><div class=\"dropdown-message small\">" + message + "</div></span>";
}

function setActiveErrors(errors, count) {
    $("#active_errors").html(count + " Alert(s)!");
    if(count > 0) {
        $("#alerts-indicator").addClass("text-warning");
    }

    html = "";
    $.each(errors, function(index, value) {
        html += getDropdownAlertsTemplate(value.alert_id, value.headline, value.message);
    });
    $("#dropdown-alerts .dropdown-menu").html("<h6 class=\"dropdown-header\">Alerts:</h6>" + html + "<div class=\"dropdown-divider\"></div><a class=\"dropdown-item small\" href=\"#\" onclick=\"showAlerts();\">View all alerts</a>");
}

function setAlerts() {
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
        success: function(result) {

            if(typeof(result) == "undefined" || result.length == 0) {
                count = 0;
            } else {
                count = result.length;
            }
            setActiveErrors(result, count);
        }
    });  
}

function showAlerts(){
    showLoadingImage();
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
			    html = "No errors found!";
            } else {
			    html = "";
			    $.each(result, function(index, value) {
			        html += "<b>" + value.headline + "</b><br />" + value.message + "<br /><a href='#' onclick='deleteAlert(\"" + value.alert_id + "\")'>Delete</a><br /><br />";
                });
            }
            hideLoadingImage();
			$("#content").html(html);
          }
        });   
        updateTopBanners();   
};

function showCalendar() {
    $("#content").html("Not implemented yet!");
    updateTopBanners();
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

/*function getMachineState(){
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
};*/

function setState(longpoll){
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
        success: function(result){
            console.log(result);

            switch (parseInt(result["state"])){
                case 519: state = "Mower standing/stopped"; break;
                case 257: state = "Loading"; break;
                case 514: state = "Locating"; break;
                case 776: state = "Driving back to Dockingstation"; break;
                case 518: state = "Mowing"; break;
                case 517: state = "Pause"; break;
                case 513: state = "Mowing"; break;
                case 263: state = "Docked"; break;
                case 774: state = "Driving back to Dockingstation"; break;
                case 258: state = "Docked"; break;
                default: state = "defaultstate";;
            }
            $("#status").html("<b>State: </b>" + state);

            setPercentageMowed(result["mowed"]);
        }
    });
}

/*function getState(longpoll){
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
};*/

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
            showAlerts();
        }
    });
}

function showWeather() {
    showLoadingImage();
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
			html = "<div id=\"weather-toggler\" onclick='$(\".weather-entry\").toggle()'>Show/Hide</div>";
			olddate = "";
			outputdate = "";
			for(i=0;i<num;i++) {
				datetime = weather.LocationWeather.forecast.intervals[i].dateTime;
				datestring = toDate(datetime);
				outputdate = "";
				if(olddate != datestring) {
                    olddate = datestring;
                    closing = "";
                    if(i != 0) {
                        closing = "</div>";
                    }
                    outputdate = closing + "<div class='weather-date-entry' onclick='$(\"#weather-" + datestring + "\").show();'>" + datestring + "</div><div class='weather-entry' id='weather-" + datestring + "'>";
				}
                html += outputdate + " -> " + datetime.substr(11, 2) + " Uhr -> " + "Regenwahrscheinlichkeit: " +  weather.LocationWeather.forecast.intervals[i].prrr + " -> " + "Grad: " +  weather.LocationWeather.forecast.intervals[i].tt + ": " + weather.LocationWeather.forecast.intervals[i].wwtext + "<br />";
			}
            hideLoadingImage();
			$('#content').html("<h3>Weatherforecast for " + weather.LocationWeather.location.country + ", " + weather.LocationWeather.location.name + "</h3>" + html + "</div>");
        }
    });
    updateTopBanners();
}

function showMap(){  
    showLoadingImage();
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
        hideLoadingImage();
        $('#content').html("<div style='width: 100%; margin: 0 auto'>" + map + "</div>");
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
    sessionStorage.removeItem("loggedIn");
	location.href = "login.html";
}

$('#page-top').ready(function() {
    if(sessionStorage.getItem("loggedIn") == "true" && localStorage.getItem("contextId")) {
        showDashboard();
    }
});