import Objects from "../../../util/Objects";
import Analytics from "../../../util/Analytics";
import rangeModel from "../RangeModel";
import $ from "jquery";
import ServiceURL from "../../../common/ServiceURL";
import EventBus from "../../../util/EventBus";
import buildDetailsDiv from "./DetailsTableRenderer";
import "./InfoWindowListeners";

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
        this.showDetails = supercharger.isUserAdded();
        this.showHistory = false;
        this.pinned = false;

        // Download history
        if (supercharger.historyLoaded !== true) {
            $.getJSON(ServiceURL.SITE_HISTORY, { siteId: supercharger.id })
                .done((h) => {
                    if (!h || !h.length) {
                        return;
                    } else if (Objects.isNullOrUndef(supercharger.history) || supercharger.history.length < 1) {
                        ;
                    } else if (supercharger.history[0].siteStatus != h[0].siteStatus && new Date(supercharger.history[0].date) < new Date(h[0].date)) {
                        h.unshift(supercharger.history[0]);
                    } else if (supercharger.history[0].siteStatus != h[h.length - 1].siteStatus && new Date(supercharger.history[0].date) > new Date(h[h.length - 1].date)) {
                        h.push(supercharger.history[0]);
                    }
                    supercharger.history = h;
                    supercharger.historyLoaded = true;
                });
        }
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
        if (Objects.isNotNullOrUndef(showDetails)) {
            this.showDetails = showDetails;
        } else {
            this.showDetails = !this.showDetails;
        }

        if (this.showDetails) {
            Analytics.sendEvent("map", "view-marker-details");
        }
    };

    toggleHistory(showHistory) {
        if (Objects.isNotNullOrUndef(showHistory)) {
            this.showHistory = showHistory;
        } else {
            this.showHistory = !this.showHistory;
        }

        if (this.showHistory) {
            Analytics.sendEvent("map", "view-marker-history");
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
        // Street Address
        //
        if (Objects.isNotNullOrUndef(site.address.street)) {
            popupContent += site.address.street;
        }

        if (!site.isUserAdded()) {
            popupContent += "<div class='statusLine'>";

            //
            // Number of charging stalls
            //
            if (Objects.isNotNullOrUndef(site.numStalls)) {
                popupContent += `${site.numStalls} stalls`;
            }

            //
            // Power
            //
            if (Objects.isNotNullOrUndef(site.powerKilowatt) && site.powerKilowatt > 0) {
                if (Objects.isNotNullOrUndef(site.numStalls)) {
                    popupContent += " • "
                }
                popupContent += `${site.powerKilowatt} kW`;
            }

            //
            // Construction/Permit/Closed/Limited Hours
            //
            if (site.isConstruction() || site.isPermit() || site.isClosedTemp() || site.isClosedPerm()) {
                popupContent += ` • <span class='${site.status.className}'><img src='${site.status.getIcon()}' title='${site.status.displayName}'/> ${site.statusDays} days</span>`;
            } else if (Objects.isNotNullOrUndef(site.hours)) {
                popupContent += " • <span class='construction'>LIMITED HOURS</span>";
            }
            popupContent += "</div>";
        }

        popupContent += "<hr/>";

        if (this.showDetails) {
            popupContent += buildDetailsDiv(site, rangeModel.getDisplayUnit());
        }

        if (this.showHistory) {
            popupContent += _buildHistoryDiv(site);
        }

        popupContent += _buildLinksDiv(site, this.showDetails);

        popupContent += "</div>";
        return popupContent;
    };

};


/**
 * This is the content in the InfoWindow that shows up when the user clicks 'details'.
 */
function _buildHistoryDiv(supercharger) {
    let div = "";
    div += `<div class='info-window-details' id='nearby-details-${supercharger.id}'>`;
    div += `<a style='position:absolute; right: 19px;' class='history-trigger' href='#${supercharger.id}'>(hide)</a>`;
    div += "<table style='width:100%;'>";

    div += "<tr style='font-weight:bold;'><td>Date</td><td>Status</td></tr>";

    if (!supercharger.history.length) {
        div += `<tr><td>Unknown</td><td class='${supercharger.status.value.toLowerCase().replace('_','-')}'>${supercharger.status.value}</td></tr>`;
    } else {
        div += supercharger.history.map(a => `<tr><td>${a.date}</td><td class='${a.siteStatus.toLowerCase().replace('_','-')}'>${a.siteStatus}</td></tr>`).join('');
    }

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

        // links that are NOT always present.
        buildLinkDetailsOrHistory(supercharger, showDetails),
        buildLinkMapURL(supercharger),
        buildLinkDiscussURL(supercharger),
        buildLinkURL(supercharger),
        buildLinkRemoveMarker(supercharger),
        buildLinkRemoveAllMarkers(supercharger)
    ];

    let count = 1;
    $.each(linkList, function (index, value) {
        if (value !== null) {
            content += value + "";
            if (count++ == 3) {
                content += "<br/>";
            }
        }
    });
    content += "</div>";
    return content;
}

function buildLinkZoom(supercharger) {
    return `<a class='zoom-to-site-trigger' href='${supercharger.id}'>zoom</a>`;
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
        return `<a target='_blank' href='${ServiceURL.TESLA_WEB_PAGE + supercharger.locationId}'>tesla.com</a>`;
    }
    return null;
}

function buildLinkDiscussURL(supercharger) {
    if (supercharger.urlDiscuss) {
        return `<a target='_blank' href='${ServiceURL.DISCUSS}?siteId=${supercharger.id}'>forum</a>`;
    }
    return null;
}

function buildLinkMapURL(supercharger) {
    if (Objects.isNotNullOrUndef(supercharger.address.street)) {
        const addr = supercharger.address;
        const query = encodeURI(`${addr.street||''} ${addr.city||''} ${addr.state||''} ${addr.zip||''} ${addr.country||''}`);
        return `<a target='_blank' href='https://www.google.com/maps/search/?api=1&query=${query}'>gmap</a>`;
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

function buildLinkDetailsOrHistory(supercharger, showDetails) {
    if (!showDetails) {
        return `<a class='details-trigger' href='#${supercharger.id}'>details</a>`;
    } else if (Objects.isNotNullOrUndef(supercharger.history)) {
        return `<a class='history-trigger' href='#${supercharger.id}'>history</a>`;
    }
    return null;
}

function buildPinMarker(supercharger, isPinned) {
    let pinClass = isPinned ? 'unpin' : 'pin';
    return `<a class='pin-marker-trigger pull-right ${pinClass} glyphicon glyphicon-pushpin' title='pin this window' href='#${supercharger.id}'></a>`;
}
