import $ from "jquery";
import renderModel from "./RenderModel";
import rangeModel from "./RangeModel";
import statusModel from "./StatusModel";
import InfoWindowRender from "./infowindow/InfoWindowRender";

/**
 * Contains logic for creating the google map "marker" associated with a given site.
 *
 * We create only one instance of this class for the entire application.
 */
export default class MarkerFactory {

    constructor(googleMap) {
        this.googleMap = googleMap;
        this.openWindows = [];
    };

    /**
     * Creates a new marker for the given supercharger. Sets up click listener to display info-window when clicked.
     */
    createMarker(supercharger) {
        //
        // Create the marker.
        //
        const markerOptions = {
            position: supercharger.location,
            map: this.googleMap,
            title: supercharger.displayName,
            icon: {
                url: supercharger.status.getIconUrl(supercharger),
                anchor: supercharger.isConstruction() ? null : {x: 8, y: 8}
            }
        };
        const marker = new google.maps.Marker(markerOptions);
        google.maps.event.addListener(marker, 'click', $.proxy(this.handleMarkerClick, this, marker, supercharger));

        //
        // Create the circle.
        //
        const rangeCircleOptions = this.buildRangeCircleOptions();
        rangeCircleOptions.center = supercharger.location;
        supercharger.circle = new google.maps.Circle(rangeCircleOptions);
        supercharger.circle.setVisible(supercharger.circleOn);
        supercharger.marker = marker;

        if (!MarkerFactory.shouldBeVisible(supercharger)) {
            supercharger.circle.setVisible(false);
            supercharger.marker.setVisible(false);
        }
    };

    buildRangeCircleOptions() {
        return {
            strokeColor: renderModel.borderColor,
            strokeOpacity: renderModel.borderOpacity,
            strokeWeight: 1,
            fillColor: renderModel.fillColor,
            fillOpacity: renderModel.fillOpacity,
            map: this.googleMap,
            radius: rangeModel.getRangeMeters(),
            clickable: false
        };
    };

    handleMarkerClick(marker, supercharger) {
        // close all open unpinned windows
        for (let i = this.openWindows.length - 1; i >= 0; i--) {
            if (!this.openWindows[i].isPinned) {
                this.openWindows[i].closeWindow();
                this.openWindows.splice(i, 1);
            }
        }

        const newWindow = new InfoWindowRender(this.googleMap, marker, supercharger);
        newWindow.showWindow();
        this.openWindows.push(newWindow);

    }

    static shouldBeVisible(supercharger) {
        return (supercharger.isOpen() && statusModel.showOpen) ||
            (supercharger.isConstruction() && statusModel.showConstruction) ||
            (supercharger.isPermit() && statusModel.showPermit) ||
            ((supercharger.isClosedTemp() || supercharger.isClosedPerm()) && statusModel.showClosed) ||
            supercharger.isUserAdded();
    };


}