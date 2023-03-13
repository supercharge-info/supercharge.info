import L from "leaflet";
import MapBox from './MapBox';

const osmUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const osmAttribution = '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>';

// Wikimedia maps provide single-language names regardless of location, but aren't allowed to be used by third-party projects unless they directly support Wikimedia.
// https://foundation.wikimedia.org/wiki/Maps_Terms_of_Use
//const wmUrl = 'https://maps.wikimedia.org/osm-intl/{z}/{x}/{y}.png?lang=en';
//const wmAtribution = '?'

// OpenTopoMap is free to use but not particularly helpful for supercharging
//const otmUrl = 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png';
//const otmAtribution = 'Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, SRTM | Map display &copy; <a href="http://opentopomap.org/">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)';

//
// Mapbox maps are nicer, but usage was exceeding free tier.
//
const useMapBox = false;

const mapUrl = useMapBox ? MapBox.url : osmUrl;

const mapOptions = useMapBox ? {
    attribution: MapBox.attributionText,
    id: 'mapbox.streets',
    maxZoom: 19,
    accessToken: MapBox.accessToken
} : {
    attribution: osmAttribution,
    maxZoom: 19,
};

const streetsLayer = L.tileLayer(mapUrl, mapOptions);

const satelliteLayer = L.tileLayer(MapBox.url, {
    attribution: MapBox.attributionText,
    maxZoom: 19,
    minZoom: 15,
    id: 'mapbox.satellite',
    accessToken: MapBox.accessToken
});

const markerLayer = L.layerGroup([]);

const baseMaps = {
    "Satellite": satelliteLayer,
    "Street": streetsLayer
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
}

export default new MapLayers();