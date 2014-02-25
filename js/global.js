// - - - - - - -
// METHOD FOR CALCULATING AS-CROW-FLIES DISTANCE BETWEEN TWO POINTS
// - - - - - - -

window.distance = function(start, end) {
    // Assumes start & end are in [lat, long] format
    return Math.sqrt(Math.pow(end[0] - start[0], 2) + Math.pow(end[1] - start[1], 2));
};

// - - - - - - -
// LOAD THE FOLLOWING WHEN THE DOCUMENT IS READY
// - - - - - - -

document.addEventListener('DOMContentLoaded', function(){

    // - - - - - - -
    // MAP CONSTANTS
    // - - - - - - -

    var mapID = "map";
    var mapBoxID = "examples.map-9ijuk24y";
    var startingLatLong = [41.888569, -87.635528];
    var startingZoom = 13;

    // - - - - - - -
    // WINDOW-SCOPED ARRAY FOR MARKET DATA
    // - - - - - - -

    window.marketData = [];

    // - - - - - - -
    // MAPBOX OBJECTS
    // - - - - - - -

    // Geocoder
    var myGeoControl = L.mapbox.geocoderControl(mapBoxID);

    // Map
    var map = L.mapbox.map(mapID, mapBoxID)
        .setView(startingLatLong, startingZoom)
        .addControl(myGeoControl);

    // - - - - - - -
    // HANDLE EVENT WHEN ADDRESS IS SUCCESFULLY MATCHED IN GEOCODER
    // - - - - - - -

    myGeoControl.on('found', function(theResult) {
        // console.log(theResult);

        var newList = _.sortBy(marketData, function(obj, key) {
            var distance = window.distance(theResult.latlng, [obj.latitude,obj.longitude]);
            // console.log(theResult.latlng, [obj.latitude,obj.longitude], distance);
            obj['distance'] = distance;
            return distance;
        });

        console.log(newList[0]);
    });

    // - - - - - - -
    // AJAX REQUEST FOR FARMERS MARKET DATA
    // Source: https://data.cityofchicago.org/Environment-Sustainable-Development/Farmers-Markets-2013/i8y3-ytj4
    // - - - - - - -

    var dataPortalURL = 'http://data.cityofchicago.org/resource/i8y3-ytj4.json';

    request = new XMLHttpRequest();
    request.open('GET', dataPortalURL, true);

    request.onload = function() {
        if (request.status >= 200 && request.status < 400){
            marketData = JSON.parse(request.responseText);

            // - - - - - - -
            // LOOP THROUGH DATA
            // For each market, add a marker to the map
            // See http://mapbox.com/developers/simplestyle/ for marker style docs
            // - - - - - - -

            _.each(marketData, function(element, index) {
                L.mapbox.featureLayer({
                    type: 'Feature',
                    geometry: {
                        type: 'Point',
                        coordinates: [element.longitude, element.latitude]
                    },
                    properties: {
                        title: 'A Single Marker',
                        description: 'Just one of me',
                        'marker-size': 'large',
                        'marker-color': '#f0a'
                    }
                }).addTo(map);
            });
        } else {
          // We reached our target server, but it returned an error
      }
    };

    request.onerror = function() {
        // There was a connection error of some sort
    };

    request.send();
});
