import L from "leaflet";
import Status from "../../site/SiteStatus";
import MapBox from './MapBox'

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

const permitLayer = L.layerGroup([]);
const constructionLayer = L.layerGroup([]);
const openLayer = L.layerGroup([]);
const tempClosedLayer = L.layerGroup([]);
const permClosedLayer = L.layerGroup([]);
const userLayer = L.layerGroup([]);

const baseMaps = {
    "Satellite": satelliteLayer,
    "Street": streetsLayer
};

const overlayMaps = {
    '<img src="/images/blue_dot_16.png"/> Permit': permitLayer,
    '<img src="/images/construction-cone_16.png"/> Construction': constructionLayer,
    '<img src="/images/red_dot_16.png"/> Open': openLayer,
    '<img src="/images/gray_dot_16.png"/> Temporarily Closed' : tempClosedLayer,
    '<img src="/images/black_dot_16.png"/> Permanently Closed' : permClosedLayer,
    '<img src="/images/green_dot_16.png"/> Custom': userLayer
};

class MapLayers {

    constructor() {
    }

    // Note that Satellite layer is NOT here so that its tiles are not loaded until when/if user requests.
    // Also excluding Permanently Closed by default as those locations should be irrelevant in most cases.
    getInitialLayers() {
        return [streetsLayer, permitLayer, constructionLayer, openLayer, tempClosedLayer, userLayer];
    }

    getBaseMaps() {
        return baseMaps;
    }

    getOverlayMaps() {
        return overlayMaps;
    }

    addToLayer(siteStatus, marker) {
        if (siteStatus === Status.OPEN) {
            marker.addTo(openLayer)
        } else if (siteStatus === Status.PERMIT) {
            marker.addTo(permitLayer)
        } else if (siteStatus === Status.CONSTRUCTION) {
            marker.addTo(constructionLayer)
        } else if (siteStatus === Status.CLOSED_TEMP) {
            marker.addTo(tempClosedLayer);
        } else if (siteStatus === Status.CLOSED_PERM) {
            marker.addTo(permClosedLayer);
        } else if (siteStatus === Status.USER_ADDED) {
            marker.addTo(userLayer)
        }
    }
}

export default new MapLayers();