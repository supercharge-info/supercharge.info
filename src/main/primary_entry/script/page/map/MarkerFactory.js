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
 * Sets up click listener to display info-window or zoom in when marker clicked.
 *
 * We create only one instance of this class for the entire application.
 */
export default class MarkerFactory {

    constructor(mapApi) {
        this.mapApi = mapApi;
    };

    createMarker(supercharger, markerSize) {
        supercharger.markerSize = markerSize;
        const markerOptions = {
            radius: markerSize,
            stroke: false,
            fillColor: supercharger.status.getFill(supercharger),
            fillOpacity: 1
        };
        const marker = L.circleMarker(supercharger.location, markerOptions);
        supercharger.marker = marker;
        marker.on('click', $.proxy(this._handleMarkerClick, this, marker, supercharger));
        marker.bindTooltip(supercharger.getMarkerTitle(), { className: "tooltip " + supercharger.status.className, opacity: 0.92 });
        mapLayers.addToLayer(supercharger.status, marker);
    };

    createMarkerCluster(superchargers, zoom) {
        if (superchargers.length === 1) return this.createMarker(superchargers[0], 8);
        var lat = 0, lng = 0, numStalls = 0;
        var sc = superchargers.sort((a,b) => ((b.numStalls || 1) * (b.powerKilowatt || 72)) - ((a.numStalls || 1) * (a.powerKilowatt || 72) ));
        for (var s in sc) {
            lat += superchargers[s].location.lat;
            lng += superchargers[s].location.lng;
            numStalls += superchargers[s].numStalls;
        }

        // Click to zoom in 2-4 steps based on how many locations the cluster marker represents
        // 2-9 => +2 || 10-49 => +3 || 50-999 => +4
        var zoomIncrement = superchargers.length < 10 ? 2 : superchargers.length < 50 ? 3 : 4
        // Alternate formula: 2-6 => +1 || 7-19 => +2 || 20-53 => +3 || 54-999 --> +4
        //var zoomIncrement = Math.min(Math.floor(Math.log(superchargers.length + 1)), 4);

        var markerTitle = `${superchargers.length} locations (${superchargers[0].status.displayName}</span>) - ${numStalls} total stalls:<br/>`;
        for (var i = 0; i < 3 && i < sc.length; i++) {
            markerTitle += sc[i].getShortMarkerTitle() + "<br/>";
        }
        markerTitle += (sc.length == 4 ? sc[3].getShortMarkerTitle() : sc.length > 4 ? "• ..." : "") + `<br/>Click to zoom +${zoomIncrement}`;

        const markerOptions = {
            icon: L.divIcon({
                iconSize: 16,
                iconAnchor: [8, 8],
                className: "cluster-marker " + superchargers[0].status.className,
                html: '<div>' + superchargers.length + '</div>'
            }),
            riseOnHover: true
        };
        const markerLocation = L.latLng(lat / superchargers.length, lng / superchargers.length)
        const marker = L.marker(markerLocation, markerOptions);
        marker.on('click', $.proxy(this._handleClusterZoom, this, superchargers, zoom + zoomIncrement));
        marker.bindTooltip(markerTitle, { className: "tooltip " + superchargers[0].status.className, opacity: 0.92 });
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

        MarkerFactory.CloseAllOpenUnpinnedInfoWindows();

        // show if necessary.
        if(!marker.infoWindow.isShown()) {
            marker.infoWindow.showWindow();
        }
    };

    _handleClusterZoom(superchargers, newZoom) {
        //MarkerFactory.CloseAllOpenUnpinnedInfoWindows();
        var marker = superchargers[0].marker;
        EventBus.dispatch(MapEvents.pan_zoom, {latLng: marker.getLatLng(), zoom: newZoom})
    };

    static CloseAllOpenUnpinnedInfoWindows() {
        new SiteIterator()
            .withPredicate(SitePredicates.HAS_SHOWN_UNPINNED_INFO_WINDOW)
            .iterate((s) => s.marker.infoWindow.closeWindow());
    }
}
