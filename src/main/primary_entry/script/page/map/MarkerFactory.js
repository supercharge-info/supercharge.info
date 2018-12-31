import $ from "jquery";
import InfoWindow from "./infowindow/InfoWindow";
import SiteIterator from "../../site/SiteIterator";
import SitePredicates from "../../site/SitePredicates";
import mapLayers from './MapLayers'

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

    createMarker(supercharger) {
        const markerOptions = {
            title: supercharger.displayName,
            icon: supercharger.status.getIcon(supercharger),
        };
        const marker = L.marker(supercharger.location, markerOptions);
        supercharger.marker = marker;
        marker.on('click', $.proxy(this._handleMarkerClick, this, marker, supercharger));
        mapLayers.addToLayer(supercharger.status, marker);
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