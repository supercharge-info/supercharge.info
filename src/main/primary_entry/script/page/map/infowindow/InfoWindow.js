import Objects from "../../../util/Objects";
import Analytics from "../../../util/Analytics";
import rangeModel from "../RangeModel";
import $ from "jquery";
import ServiceURL from "../../../common/ServiceURL";
import EventBus from "../../../util/EventBus";
import buildDetailsDiv from './DetailsTableRenderer'
import './InfoWindowListeners'

/**
 * One of these is created each time a marker is clicked.
 */
export default class InfoWindow {

    constructor(mapApi, marker, supercharger) {

        // reference fields
        this.marker = marker;
        this.supercharger = supercharger;
        this.mapApi = mapApi;

        // state fields
        this.popup = null;
        this.showDetails = true;
        this.showNearby = false;
        this.pinned = false;
    }

    isPinned() {
        return this.pinned;
    }

    isShown() {
        return this.popup !== null;
    }

    showWindow() {
        if (this.popup === null) {
            this._initializePopup();
        }
    };

    closeWindow() {
        if (this.popup !== null) {
            this.popup.remove();
        }
        this._resetStateToClosed();
    };

    redraw() {
        this.popup.setContent(this._buildHtmlContent());
    }

    toggleDetails(showDetails) {
        if (!Objects.isNullOrUndef(showDetails)) {
            this.showDetails = showDetails;
        } else {
            this.showDetails = !this.showDetails;
        }

        if (this.showDetails) {
            Analytics.sendEvent("map", "view-marker-details");
        }
    };

    toggleNearby(showNearby) {
        if (!Objects.isNullOrUndef(showNearby)) {
            this.showNearby = showNearby;
        } else {
            this.showNearby = !this.showNearby;
        }

        if (this.showNearby) {
            Analytics.sendEvent("map", "view-marker-nearby");
        }
    };

    togglePin() {
        this.pinned = !this.pinned;
        if (this.isPinned()) {
            $(event.target).removeClass('pin');
            $(event.target).addClass('unpin');
        } else {
            $(event.target).removeClass('unpin');
            $(event.target).addClass('pin');
        }
        if (this.pinned) {
            Analytics.sendEvent("map", "pin-marker");
        }
    };

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // private
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    _resetStateToClosed() {
        this.popup = null;
        this.pinned = false;
    }

    _initializePopup() {
        // Ideally we would add the popup to a layer group here instead of a map so that it
        // appears and disappears when changing layers. Doesn't seem possible currently through
        // leaflet API.
        this.popup = L.popup({autoClose: false, closeOnClick: false})
            .setLatLng(this.supercharger.location)
            .setContent(this._buildHtmlContent())
            .openOn(this.mapApi);
        this.mapApi.on('popupclose', this._handleMapApiPopupCloseEvent, this);
        this.marker.popup = this.popup;
    }

    _handleMapApiPopupCloseEvent(event) {
        if (event.popup === this.popup) {
            this._resetStateToClosed();
        }
    }

    _buildHtmlContent() {
        const site = this.supercharger;
        let popupContent = "<div class='info-window-content'>";
        //
        // Title/Supercharger-name
        //
        popupContent += `<div class='title'>${site.displayName} ${buildPinMarker(site, this.pinned)}</div>`;

        //
        // Status: Construction/Permit/Closed
        //
        if (site.isConstruction()) {
            popupContent += `<div class='construction'>Status: ${site.status.displayName} - ${site.statusDays} days</div>`;
        } else if (site.isPermit()) {
            popupContent += `<div class='permit'>Status: ${site.status.displayName} - ${site.statusDays} days</div>`;
        } else if (site.isClosedTemp()) {
            popupContent += `<div class='closed-temp'>Status: ${site.status.displayName} - ${site.statusDays} days</div>`;
        } else if (site.isClosedPerm()) {
            popupContent += `<div class='closed-perm'>Status: ${site.status.displayName} - ${site.statusDays} days</div>`;
        }


        //
        // Street Address
        //
        popupContent += site.address.street + "<br/>";

        //
        // Limited Hours
        //
        if (!Objects.isNullOrUndef(site.hours)) {
            popupContent += "<div class='construction' >LIMITED HOURS</div>";
        }


        if (this.showDetails) {
            popupContent += buildDetailsDiv(site, rangeModel.getDisplayUnit());
        }

        if (this.showNearby) {
            popupContent += _buildNearbyDiv(site);
        }

        popupContent += _buildLinksDiv(site, this.showDetails);

        popupContent += "</div>";
        return popupContent;
    };

};


/**
 * This is the content in the InfoWindow that shows up when the user clicks 'details'.
 */
function _buildNearbyDiv(supercharger) {
    let div = "";
    div += `<div class='info-window-details' id='nearby-details-${supercharger.id}'>`;
    div += "<table>";

    div += "<tr><th>Restaurants</th><td><span class='nearby_restaurants'></span></td></tr>";

    div += "<tr><th>Shopping</th><td><span class='nearby_stores'></span></td></tr>";

    div += "<tr><th>Lodging</th><td><span class='nearby_lodgings'></span></td></tr>";

    div += "</table>";
    div += "</div>";
    return div;
}

function _buildLinksDiv(supercharger, showDetails) {
    let content = "<div class='links-container'>";

    const linkList = [

        // links that are always present
        buildLinkZoom(supercharger),
        buildLinkCircleToggle(supercharger),
        buildLinkAddToRoute(supercharger),
        buildLinkDetails(supercharger, showDetails),
        buildLinkNearby(supercharger),

        // links that are NOT always present.
        buildLinkURL(supercharger),
        buildLinkDiscussURL(supercharger),
        buildLinkRemoveMarker(supercharger),
        buildLinkRemoveAllMarkers(supercharger)
    ];

    let count = 1;
    $.each(linkList, function (index, value) {
        if (value !== null) {
            content += value + "";
            if (((count++) % 3 === 0) && (index !== linkList.length - 1)) {
                content += "<br/>";
            }
        }
    });
    content += "</div>";
    return content;
}

function buildLinkZoom(supercharger) {
    return `<a class='zoom-to-site-trigger' href='${supercharger.id}'>zoom in</a>`;
}

function buildLinkCircleToggle(supercharger) {
    // If circles are turned on via the map drop-down menu update the text of our circle on/off label accordingly.
    // We only need one listener for all info windows, not one per info window.
    if (!InfoWindow.circleFlag) {
        EventBus.addListener("circles-all-on-event", function () {
            $("a.circle-toggle-trigger").html("circle off");
        });
        EventBus.addListener("circles-all-off-event", function () {
            $("a.circle-toggle-trigger").html("circle on");
        });
        InfoWindow.circleFlag = true;
    }
    const circleOnOffLabel = (supercharger.circle ? "circle off" : "circle on");
    return `<a class='circle-toggle-trigger' href='${supercharger.id}'>${circleOnOffLabel}</a>`;
}

function buildLinkAddToRoute(supercharger) {
    return `<a class='add-to-route-trigger' href='${supercharger.id}'>add to route</a>`;
}

function buildLinkURL(supercharger) {
    if (Objects.isNotNullOrUndef(supercharger.locationId)) {
        return `<a target='_blank' href='${ServiceURL.TESLA_WEB_PAGE + supercharger.locationId}'>web page</a>`;
    }
    return null;
}

function buildLinkDiscussURL(supercharger) {
    if (supercharger.urlDiscuss) {
        return `<a target='_blank' href='${ServiceURL.DISCUSS}?siteId=${supercharger.id}'>discuss</a>`;
    }
    return null;
}

function buildLinkRemoveMarker(supercharger) {
    if (supercharger.isUserAdded()) {
        return `<a class='marker-toggle-trigger' title='remove this custom marker' href='${supercharger.id}'>remove</a>`;
    }
    return null;
}

function buildLinkRemoveAllMarkers(supercharger) {
    if (supercharger.isUserAdded()) {
        return "<a class='marker-toggle-all-trigger' title='remove all custom markers' href=''>remove all</a>";
    }
    return null;
}

function buildLinkDetails(supercharger, showDetails) {
    return `<a class='details-trigger' href='#${supercharger.id}'>${showDetails ? "hide" : "show"} details</a>`;
}

function buildPinMarker(supercharger, isPinned) {
    let pinClass = isPinned ? 'unpin' : 'pin';
    return `<a class='pin-marker-trigger pull-right ${pinClass} glyphicon glyphicon-pushpin' title='pin this window' href='#${supercharger.id}'></a>`;
}

function buildLinkNearby(supercharger) {
    return `<a class='nearby-trigger' href='#${supercharger.id}'>nearby</a>`;
}
