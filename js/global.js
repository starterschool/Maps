// - - - - - - -
// WINDOW-SCOPED ARRAY FOR MARKET DATA
// - - - - - - -

window.geoJSON = [];
window.defaultMarkerColor = '#666';
window.openMarkerColor = '#f0a';

// - - - - - - -
// METHOD FOR CALCULATING AS-CROW-FLIES DISTANCE BETWEEN TWO POINTS
// - - - - - - -

window.distance = function(start, end) {
    // Assumes start & end are in [lat, long] format
    return Math.sqrt(Math.pow(end[0] - start[0], 2) + Math.pow(end[1] - start[1], 2));
};

// - - - - - - -
// METHOD FOR ADDING POINTS TO MAP, THEN DEFINING POPUPS
// - - - - - - -

window.addMarketsToMap = function(marketArray, popupToOpen) {
    map.featureLayer.setGeoJSON(marketArray);

    map.featureLayer.eachLayer(function(layer) {
        var templateBlock = document.getElementById('tooltip').innerHTML;
        var compiledTemplate = _.template(templateBlock);

        var html = compiledTemplate({
            intersection: layer.feature.name,
            day: layer.feature.day
        });

        layer.bindPopup(html);

        if (popupToOpen && layer.feature.name == popupToOpen) {
            layer.openPopup();
        }
    });
};

// - - - - - - -
// ASSIGN CLICK HANDLER TO LINKS IN LEGEND
// - - - - - - -

var days = document.querySelectorAll('.days a');
_.each(days, function(obj, key) {
    obj.addEventListener('click', function(evt) {
        evt.preventDefault();
        var currLink = evt.srcElement;

        _.each(days, function(obj, key) {
            obj.className = '';
        });
        currLink.className = 'active';

        var filteredPoints = _.each(geoJSON, function(obj, key) {
            obj.properties['marker-size'] = 'small';
            obj.properties['marker-color'] = defaultMarkerColor;
            if (obj.day.toLowerCase() == currLink.id || currLink.id == 'all') {
                obj.properties['marker-size'] = 'large';
                obj.properties['marker-color'] = openMarkerColor;
            }
        });

        addMarketsToMap(filteredPoints);
    });
});

// - - - - - - -
// LOAD THE FOLLOWING WHEN THE DOCUMENT IS READY
// - - - - - - -

document.addEventListener('DOMContentLoaded', function() {

    // - - - - - - -
    // MAP CONSTANTS
    // - - - - - - -

    var mapID = "map";
    var mapBoxID = "examples.map-9ijuk24y";
    var startingLatLong = [41.888569, -87.635528];
    var startingZoom = 12;

    // - - - - - - -
    // MAPBOX OBJECTS
    // - - - - - - -

    // Geocoder
    var myGeoControl = L.mapbox.geocoderControl(mapBoxID);

    // Legend
    // var myLegend = L.mapbox.legendControl({position: 'topright'});
    // myLegend.addLegend(document.getElementById('legend-content').innerHTML);

    // Map
    window.map = L.mapbox.map(mapID, mapBoxID)
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

        map.setView(L.latLng(theResult.latlng), startingZoom + 1);
        addMarketsToMap(sortedPoints, closestMarket.name);
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
            // For each market, create a GeoJSON object. Collect them into an array, then add array to map at once.
            // See http://mapbox.com/developers/simplestyle/ for marker style docs
            // - - - - - - -

            geoJSON = _.map(marketData, function(element, index) {

                var markerSize = 'small';
                var markerColor = defaultMarkerColor;
                var today = moment();
                var currentDayOfWeek = moment().format("dddd").toLowerCase();

                if (element.day.toLowerCase() == currentDayOfWeek) {
                    markerSize = 'large';
                    markerColor = openMarkerColor;
                }

                document.getElementById(currentDayOfWeek).className = 'active';

                return {
                    type: 'Feature',
                    name: element.intersection,
                    day: element.day,
                    geometry: {
                        type: 'Point',
                        coordinates: [element.longitude, element.latitude] // Must be LongLat, not LatLong
                    },
                    // Properties come from SimpleStyle docs — https://www.mapbox.com/developers/simplestyle/
                    properties: {
                        title: 'A Market',
                        description: 'More info',
                        'marker-size': markerSize,
                        'marker-color': markerColor,
                        'marker-symbol': 'farm'
                    }
                };
            });

            addMarketsToMap(geoJSON);
        } else {
          // We reached our target server, but it returned an error
        }
    };

    request.onerror = function() {
        // There was a connection error of some sort
    };

    request.send();
});
