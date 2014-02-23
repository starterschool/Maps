// Load the following when page is ready (sans jQuery)
document.addEventListener('DOMContentLoaded', function(){
    var mapID = "map";
    var mapBoxID = "examples.map-9ijuk24y";

    var startingLatLong = [41.888569, -87.635528];
    var startingZoom = 13;

    // Initialize the map.
    var map = L.mapbox.map(mapID, mapBoxID)
        .setView(startingLatLong, startingZoom);
});

// Get JSON data from Data Portal. (The following is instead of $.getJSON)
// Source: https://data.cityofchicago.org/Environment-Sustainable-Development/Farmers-Markets-2013/i8y3-ytj4

request = new XMLHttpRequest();
request.open('GET', 'http://data.cityofchicago.org/resource/i8y3-ytj4.json', true);

request.onload = function() {
  if (request.status >= 200 && request.status < 400){
    // Success!
    var data = JSON.parse(request.responseText);

    // Loop through the data
        // … and update the map

  } else {
    // We reached our target server, but it returned an error
  }
};

request.onerror = function() {
  // There was a connection error of some sort
};

request.send();

window.distance = function(start, end) {
    // Assumes start & end are in [lat, long] format
    return Math.sqrt(Math.pow(start[0] - end[0], 2) + Math.pow(start[1] - end[1], 2));
};
