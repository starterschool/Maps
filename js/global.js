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
    var defaultMarkerColor = '#f0a';

    // - - - - - - -
    // WINDOW-SCOPED ARRAY FOR MARKET DATA
    // - - - - - - -

    window.geoJSON = [];

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
        // - - - - - - -
        // FIRST SORT THE MARKETS BY DISTANCE
        // And reset their colors
        // - - - - - - -

        var sortedPoints = _.sortBy(geoJSON, function(obj, key) {
            var coords = obj.geometry.coordinates.slice().reverse(); // slice() is there to copy the object, since reverse() mutates the original object
            var distance = window.distance(theResult.latlng, coords);
            obj.properties['marker-color'] = defaultMarkerColor;
            return distance;
        });

        // - - - - - - -
        // THEN SET THE CLOSEST ONE TO A DIFFERENT COLOR
        // - - - - - - -

        var closestMarket = sortedPoints[0];
        closestMarket.properties['marker-color'] = '#00f';

        // - - - - - - -
        // THEN REDEFINE THE LAYER OF MARKERS
        // And open up the popup of the closest one
        // - - - - - - -

        var layers = map
            .setView(L.latLng(theResult.latlng), startingZoom + 1)
            .featureLayer.setGeoJSON(sortedPoints)
            .eachLayer(function (marker) {
                if (marker.feature.name == closestMarket.name) {
                    marker.openPopup();
                }
            });
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
            // LOOP THROUGH DATA, OPTION 2
            // For each market, create a GeoJSON object. Collect them into an array, then add array to map at once.
            // See http://mapbox.com/developers/simplestyle/ for marker style docs
            // - - - - - - -

            geoJSON = _.map(marketData, function(element, index) {
                return {
                    type: 'Feature',
                    name: element.intersection,
                    geometry: {
                        type: 'Point',
                        coordinates: [element.longitude, element.latitude]
                    },
                    properties: {
                        title: 'A Single Marker',
                        description: 'Just one of me',
                        'marker-size': 'large',
                        'marker-color': defaultMarkerColor
                    }
                };
            });

            map.featureLayer.setGeoJSON(geoJSON);
        } else {
          // We reached our target server, but it returned an error
      }
    };

    request.onerror = function() {
        // There was a connection error of some sort
    };

    request.send();
});
