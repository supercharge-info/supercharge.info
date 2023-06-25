import L from "leaflet";
import MapBox from './MapBox';

// Wikimedia maps provide single-language names regardless of location, but aren't allowed to be used by third-party projects unless they directly support Wikimedia.
// https://foundation.wikimedia.org/wiki/Maps_Terms_of_Use
//const wmUrl = 'https://maps.wikimedia.org/osm-intl/{z}/{x}/{y}.png?lang=en';
//const wmAtribution = '?'

// OpenTopoMap is free to use but not particularly helpful for supercharging
//const otmUrl = 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png';
//const otmAtribution = 'Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, SRTM | Map display &copy; <a href="http://opentopomap.org/">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)';

const streetsLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 19,
    minZoom: 0
});

const satelliteLayer = L.tileLayer(MapBox.url, {
    attribution: MapBox.attributionText,
    maxZoom: 20,
    minZoom: 15,
    id: 'mapbox.satellite',
    accessToken: MapBox.accessToken
});

const usgsLayer = L.tileLayer('https://basemap.nationalmap.gov/arcgis/rest/services/USGSImageryTopo/MapServer/tile/{z}/{y}/{x}', {
	maxZoom: 16,
    minZoom: 0,
	attribution: 'Tiles courtesy of the <a href="https://usgs.gov/">U.S. Geological Survey</a>'
});
usgsLayer.on('tileerror', function (e) {
    this._map.setMaxZoom(8);
});


const openTopoLayer = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: 'map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org/">SRTM</a> | map style &copy; <a href="http://opentopomap.org/">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)',
    maxZoom: 17,
    minZoom: 2
});

const mundialisLayer = L.tileLayer.wms('http://ows.mundialis.de/services/service?', {
	maxZoom: 14,
    minZoom: 0,
    layers: 'TOPO-OSM-WMS',
	attribution: 'Contains modified SRTM data (2014)/NASA, processed by <a href="https://www.mundialis.de">mundialis</a> and vector data by <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors (2020)'
});

const markerLayer = L.layerGroup([]);

const baseMaps = {
    "Street": streetsLayer,
    "Satellite": satelliteLayer,
    "Topographic": openTopoLayer,
    "USGS Imagery+Topo": usgsLayer,
    "Mundialis Topo": mundialisLayer
};

const overlayMaps = {
    'Markers': markerLayer
};

class MapLayers {

    constructor() {
    }

    // Note that Satellite layer is NOT here so that its tiles are not loaded until when/if user requests.
    // Also excluding Permanently Closed by default as those locations should be irrelevant in most cases.
    getInitialLayers() {
        return [streetsLayer, markerLayer];
    }

    getBaseMaps() {
        return baseMaps;
    }

    getOverlayMaps() {
        return overlayMaps;
    }

    addToOverlay(marker) {
        marker.addTo(markerLayer);
    }

    addGroupToOverlay(group) {
        L.featureGroup(group).addTo(markerLayer);
    }
}

export default new MapLayers();