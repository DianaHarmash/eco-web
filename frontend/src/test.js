import {contentMarker1, 
    contentMarker2, 
    contentMarker3, 
    contentMarker4,
    contentMarker5, 
    contentMarker6, 
    contentMarker7, 
    contentMarker8, 
    contentMarker9, 
    contentMarker10} 
from "./content.js"

// Dynamic loading of Google Maps
(async function loadGoogleMaps() {
const script = document.createElement("script");
script.src = "https://maps.googleapis.com/maps/api/js?key=AIzaSyAOVYRIgupAurZup5y1PRh8Ismb1A3lLao&libraries=&v=beta";
script.async = true;
script.onload = initMap;
document.head.appendChild(script);
})();

let map;
let markers = [];
let allMarkers = []; 

async function initMap() {
const { Map } = await google.maps.importLibrary("maps");
const { Marker } = await google.maps.importLibrary("marker");
const {InfoWindow} = await google.maps.importLibrary("maps");

map = new Map(document.getElementById("map"), {
    center: { lat: 50.46002204159702, lng: 30.6198825268124 },
    zoom: 10,
});


const markerCategories = { 
    air: [
        createMarker({ lat: 50.434029821469814, lng: 30.545483455483158 }, "Kniaziv Ostrozkykh St, 37", contentMarker1),
        createMarker({ lat: 50.433494221605294, lng: 30.546773340141495 }, "Kniaziv Ostrozkykh St, 39А", contentMarker2),
        createMarker({ lat: 50.42265320492365, lng: 30.40500063851317 }, "Pshenychna St, 2А, Kyiv, Ukraine, 03680", contentMarker3),
        createMarker({ lat: 50.466205239891224, lng: 30.34436691153281 }, "Akademika Yefremova St, 10, Kyiv, Ukraine, 02000", contentMarker4),
    ],
    water: [
        createMarker({ lat:  50.47462835721761, lng: 30.439475396189376 }, "Shchusieva St, 21, Kyiv, Ukraine, 02000", contentMarker5),
        createMarker({ lat:  50.44253672918231, lng: 30.62666903851487 }, "Darnitskaya Square, Kyiv, Ukraine, 02000", contentMarker6),
    ],
    coastal: [
        createMarker({ lat: 50.35904081370877, lng: 30.621417562282403 }, "Uyutnaya St, Kyiv, Ukraine, 02000", contentMarker7),
        createMarker({ lat: 50.38225256999784, lng: 30.636823000653347 }, "Darnitskaya Square", contentMarker8),
        createMarker({ lat: 50.42342592539638, lng: 30.389092103648007 }, "Vasylia Kasiiana St, 1, Kyiv, Ukraine, 03191", contentMarker9),
    ],
    biological: [
        createMarker({ lat:  50.378179630976376, lng: 30.459638982689626 }, "Vasylia Kasiiana St, 1, Kyiv, Ukraine, 03191", contentMarker10),
    ]
};

// Listen to checkboxes
document.getElementById('marker-options').addEventListener('change', function () {
    // Cleean the map
    hideAllMarkers();

    // Get selected categories
    const selectedCategories = Array.from(document.querySelectorAll('#marker-options input:checked')).map(input => input.value);

    // Show markers for the categories
    selectedCategories.forEach(category => {
        showMarkers(markerCategories[category]);
    });
});

// Create marker 
function createMarker(position, title, content) {
    const marker = new Marker({
        position: position,
        map: null,  // Add later after selecting categories
        title: title,
    });

    const infoWindow = new InfoWindow({ content });

    marker.addListener("click", function () {
        infoWindow.open(map, marker);
    });

    // Add marker to the array
    allMarkers.push(marker);  
    return marker;
}

// Show array of the markers
function showMarkers(markerArray) {
    markerArray.forEach(marker => marker.setMap(map));
}


function hideAllMarkers() {
    allMarkers.forEach(marker => marker.setMap(null));
}
}

// // https://www.saveecobot.com/station/24340
    // let marker1 = new Marker({
    //     position: { lat: 50.434029821469814, lng: 30.545483455483158 },
    //     map: map,
    //     title: "Kniaziv Ostrozkykh St, 37, Kyiv, Ukraine, 01015",
    // });
    // let infoMarker1  = new InfoWindow({ content: contentMarker1 });
    // marker1.addListener("click", function() { infoMarker1.open(map, marker1) });


    // // https://www.saveecobot.com/station/24181
    // let marker2 = new Marker({
    //     position: { lat:  50.433494221605294, lng: 30.546773340141495 },
    //     map: map,
    //     title: "Kniaziv Ostrozkykh St, 39А, Kyiv, Ukraine, 02000",
    // });

    // let infoMarker2  = new InfoWindow({ content: contentMarker2 });
    // marker2.addListener("click", function() { infoMarker2.open(map, marker2) }); 


    // // https://www.saveecobot.com/station/24151
    // let marker3 = new Marker({
    //     position: { lat:  50.42265320492365, lng: 30.40500063851317 },
    //     map: map,
    //     title: "Pshenychna St, 2А, Kyiv, Ukraine, 03680",
    // });
    // let infoMarker3  = new InfoWindow({ content: contentMarker3 });
    // marker3.addListener("click", function() { infoMarker3.open(map, marker3) }); 

    // // https://www.saveecobot.com/station/4230
    // let marker4 = new Marker({
    //     position: { lat:  50.466205239891224, lng: 30.34436691153281 },
    //     map: map,
    //     title: "Akademika Yefremova St, 10, Kyiv, Ukraine, 02000",
    // });
    // let infoMarker4  = new InfoWindow({ content: contentMarker4 });
    // marker4.addListener("click", function() { infoMarker4.open(map, marker4) }); 


    // let marker5 = new Marker({
    //     position: { lat:  50.47462835721761, lng: 30.439475396189376 },
    //     map: map,
    //     title: "Shchusieva St, 21, Kyiv, Ukraine, 02000",
    // });
    // let infoMarker5  = new InfoWindow({ content: contentMarker5 });
    // marker5.addListener("click", function() { infoMarker5.open(map, marker5) }); 

    // let marker6 = new Marker({
    //     position: { lat:  50.44253672918231, lng: 30.62666903851487 },
    //     map: map,
    //     title: "Darnitskaya Square, Kyiv, Ukraine, 02000",
    // });
    // let infoMarker6  = new InfoWindow({ content: contentMarker6 });
    // marker6.addListener("click", function() { infoMarker6.open(map, marker6) }); 

    // let marker7 = new Marker({
    //     position: { lat:  50.35904081370877, lng: 30.621417562282403 },
    //     map: map,
    //     title: "Uyutnaya St, Kyiv, Ukraine, 02000",
    // });
    // let infoMarker7  = new InfoWindow({ content: contentMarker7 });
    // marker7.addListener("click", function() { infoMarker7.open(map, marker7) }); 

    // let marker8 = new Marker({
    //     position: { lat:  50.38225256999784, lng: 30.636823000653347 },
    //     map: map,
    //     title: "Zhk H2O, Kyiv, Ukraine, 02000",
    // });
    // let infoMarker8  = new InfoWindow({ content: contentMarker8 });
    // marker8.addListener("click", function() { infoMarker8.open(map, marker8) }); 

    // let marker9 = new Marker({
    //     position: { lat:  50.42342592539638, lng: 30.389092103648007 },
    //     map: map,
    //     title: "Vasylia Domanytskoho St, 12, Kyiv, Ukraine, 03148",
    // });
    // let infoMarker9  = new InfoWindow({ content: contentMarker9 });
    // marker9.addListener("click", function() { infoMarker9.open(map, marker9) }); 

    // let marker10 = new Marker({
    //     position: { lat:  50.378179630976376, lng: 30.459638982689626 },
    //     map: map,
    //     title: "Vasylia Kasiiana St, 1, Kyiv, Ukraine, 03191",
    // });
    // let infoMarker10  = new InfoWindow({ content: contentMarker10 });
    // marker10.addListener("click", function() { infoMarker10.open(map, marker10) }); 
    