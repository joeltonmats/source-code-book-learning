const QUAKE_URL = 'http://earthquake.usgs.gov/earthquakes/feed/v1.0/' + 'summary/all_day.geojsonp';


function loadJSONP(url) {
    const script = document.createElement('script');
    script.src = url;

    const head = document.getElementsByTagName('head')[0];
    head.appendChild(script);
}

const map = L.map('map').setView([33.858631, -118.279602], 7);
L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png').addTo(map);