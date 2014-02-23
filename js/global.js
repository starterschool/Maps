// Load the following when page is ready (sans jQuery)
document.addEventListener('DOMContentLoaded', function(){
    var mapID = "map";
    var mapBoxID = "examples.map-9ijuk24y";

    var startingLatLong = [41.888569, -87.635528];
    var startingZoom = 13;

    var map = L.mapbox.map(mapID, mapBoxID)
        .setView([41.888569, -87.635528], 13);
});

// Equivalent to $.getJSON
request = new XMLHttpRequest();
request.open('GET', 'http://data.cityofchicago.org/resource/i8y3-ytj4.json', true);

request.onload = function() {
  if (request.status >= 200 && request.status < 400){
    // Success!
    data = JSON.parse(request.responseText);
  } else {
    // We reached our target server, but it returned an error
  }
};

request.onerror = function() {
  // There was a connection error of some sort
};

request.send();
