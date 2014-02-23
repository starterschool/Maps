// Load the following when page is ready (sans jQuery)
document.addEventListener('DOMContentLoaded', function(){
    var mapID = "map";
    var mapBoxID = "examples.map-9ijuk24y";

    var map = L.mapbox.map(mapID, mapBoxID)
        .setView([41.888569, -87.635528], 13);
});
