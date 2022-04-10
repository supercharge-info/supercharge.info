import $ from "jquery";
import InfoWindow from "./infowindow/InfoWindow";
import SiteIterator from "../../site/SiteIterator";
import SitePredicates from "../../site/SitePredicates";
import EventBus from "../../util/EventBus";
import MapEvents from "./MapEvents";
import mapLayers from "./MapLayers";

/**
 * Contains logic for creating the marker associated with a given site.
 *
 * Sets up click listener to display info-window when marker clicked.
 *
 * We create only one instance of this class for the entire application.
 */
export default class MarkerFactory {

    constructor(mapApi) {
        this.mapApi = mapApi;
    };

    createMarker(supercharger, markerSize) {
        const markerOptions = {
            title: supercharger.getMarkerTitle(),
            icon: supercharger.status.getIcon(supercharger, markerSize)
        };
        const marker = L.marker(supercharger.location, markerOptions);
        supercharger.marker = marker;
        marker.on('click', $.proxy(this._handleMarkerClick, this, marker, supercharger));
        mapLayers.addToLayer(supercharger.status, marker);
    };

    createMarkerCluster(superchargers, zoom) {
        if (superchargers.length === 1) return this.createMarker(superchargers[0], "L");
        var lat = 0, lng = 0, numStalls = 0;
        for (var s in superchargers) {
            lat += superchargers[s].location.lat;
            lng += superchargers[s].location.lng;
            numStalls += superchargers[s].numStalls;
        }
        var markerTitle = `${superchargers.length} locations (${superchargers[0].status.displayName}) - ${numStalls} total stalls:\r\n` +
            superchargers[0].getShortMarkerTitle() +
            (superchargers.length === 2
                ? `\r\n${superchargers[1].getShortMarkerTitle()}`
                : ` + ...`
            ) + `\r\n\r\nClick to split into individual markers`;
        const markerOptions = {
            title: markerTitle,
            icon: L.divIcon({
                iconSize: 16,
                iconAnchor: [8, 8],
                className: "cluster-marker " + superchargers[0].status.className,
                html: '<div>' + superchargers.length + '</div>'
            })
        };
        const markerLocation = L.latLng(lat / superchargers.length, lng / superchargers.length)
        const marker = L.marker(markerLocation, markerOptions);
        marker.on('click', $.proxy((event) => EventBus.dispatch("marker-split-event", { superchargers: superchargers, zoom: zoom })));
        for (var s in superchargers) {
            superchargers[s].marker = marker;
        }
        mapLayers.addToLayer(superchargers[0].status, marker);
    };

    _handleMarkerClick(marker, supercharger) {
        // create if necessary
        if (!marker.infoWindow) {
            marker.infoWindow = new InfoWindow(this.mapApi, marker, supercharger);
        }

        // If we click one that is already open, close it.
        if(marker.infoWindow.isShown()) {
            marker.infoWindow.closeWindow();
            return;
        }

        MarkerFactory._closeAllOpenInfoWindows();

        // show if necessary.
        if(!marker.infoWindow.isShown()) {
            marker.infoWindow.showWindow();
        }
    }

    static _closeAllOpenInfoWindows() {
        new SiteIterator()
            .withPredicate(SitePredicates.HAS_SHOWN_UNPINNED_INFO_WINDOW)
            .iterate((s) => s.marker.infoWindow.closeWindow());
    }
}
