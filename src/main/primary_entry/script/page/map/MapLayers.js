import L from "leaflet";
import Status from "../../site/SiteStatus";
import MapBox from './MapBox'

const osmUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const osmAttribution = '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>';

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
const userLayer = L.layerGroup([]);

const baseMaps = {
    "Satellite": satelliteLayer,
    "Street": streetsLayer
};

const overlayMaps = {
    'Permit': permitLayer,
    'Construction': constructionLayer,
    'Open': openLayer,
    'Temporarily Closed' : tempClosedLayer,
    'Custom': userLayer
};


class MapLayers {

    constructor() {

    }

    // Not that Satellite layer is NOT here so that its tiles are not loaded until when/if user requests.
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
        } else if (siteStatus === Status.USER_ADDED) {
            marker.addTo(userLayer)
        }
    }

}

export default new MapLayers();