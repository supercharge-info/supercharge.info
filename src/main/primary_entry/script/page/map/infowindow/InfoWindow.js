import Objects from "../../../util/Objects";
import Analytics from "../../../util/Analytics";
import rangeModel from "../RangeModel";
import $ from "jquery";
import L from "leaflet";
import ServiceURL from "../../../common/ServiceURL";
import EventBus from "../../../util/EventBus";
import buildDetailsDiv from "./DetailsTableRenderer";
import "./InfoWindowListeners";

/**
 * One of these is created each time a marker is clicked.
 */
export default class InfoWindow {

    constructor(mapApi, marker, site) {

        // reference fields
        this.marker = marker;
        this.site = site;
        this.mapApi = mapApi;

        // state fields
        this.popup = null;
        this.showDetails = site.isUserAdded();
        this.showHistory = false;
        this.pinned = false;

        // Download history
        if (site.historyLoaded !== true) {
            $.getJSON(ServiceURL.SITE_HISTORY, { siteId: site.id })
                .done((h) => {
                    if (!h || !h.length) {
                        return;
                    } else if (Objects.isNullOrUndef(site.history) || site.history.length < 1) {
                        // no adjustment needed if history is null or empty
                    } else if (site.history[0].siteStatus != h[0].siteStatus && new Date(site.history[0].date) < new Date(h[0].date)) {
                        h.unshift(site.history[0]);
                    } else if (site.history[0].siteStatus != h[h.length - 1].siteStatus && new Date(site.history[0].date) > new Date(h[h.length - 1].date)) {
                        h.push(site.history[0]);
                    }
                    site.history = h;
                    site.historyLoaded = true;
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
    }

    closeWindow() {
        if (this.popup !== null) {
            this.popup.remove();
        }
        this._resetStateToClosed();
    }

    redraw() {
        this.popup.setContent(this._buildHtmlContent());
        this.initTooltips();
    }

    initTooltips() {
        $(".tooltip").tooltip("hide");
        $(".info-window-content a, .info-window-content img, .info-window-content span.details").each(function (n, t) {
            $(t).tooltip({ "container": "body" });
        });
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
    }

    toggleHistory(showHistory) {
        if (Objects.isNotNullOrUndef(showHistory)) {
            this.showHistory = showHistory;
        } else {
            this.showHistory = !this.showHistory;
        }

        if (this.showHistory) {
            Analytics.sendEvent("map", "view-marker-history");
        }
    }

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
    }

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
            .setLatLng(this.site.location)
            .setContent(this._buildHtmlContent())
            .openOn(this.mapApi);
        this.mapApi.on('popupclose', this._handleMapApiPopupCloseEvent, this);
        this.marker.popup = this.popup;
        this.initTooltips();
    }

    _handleMapApiPopupCloseEvent(event) {
        if (event.popup === this.popup) {
            this._resetStateToClosed();
        }
    }

    _buildHtmlContent() {
        const site = this.site;
        let popupContent = "<div class='info-window-content'>";
        //
        // Title/site-name
        //
        popupContent += `<div class='title'>${buildPinMarker(site, this.pinned)} ${site.displayName}</div>`;


        //
        // Street Address
        //
        if (Objects.isNotNullOrUndef(site.address.street)) {
            popupContent += site.address.street;
        }

        if (!site.isUserAdded()) {
            popupContent += `<div class='statusLine'>${site.getStallPlugSummary(true)}`;
            popupContent += site.powerKilowatt > 0 ? ` • ${site.powerKilowatt} kW` : '';
    
            //
            // Status, other attributes, limited hours
            //
            var days = site.isOpen() ? Math.floor((Date.now() - new Date(site.dateOpened)) / 86400000): site.statusDays;
            popupContent += ` • <span class='${site.status.className}'><img class="status" src='${site.status.getIcon(site)}' title='${site.status.getTitle(site)}'/> `;
            popupContent += `${days} day${days == 1 ? "" : "s"}</span>`;
    
            if (site.otherEVs || site.solarCanopy || site.battery) popupContent += ' • ';
            if (site.otherEVs)     popupContent += '<img title="other EVs OK" src="/images/car-electric.svg"/>';
            if (site.solarCanopy)  popupContent += '<img title="solar canopy" src="/images/solar-power-variant.svg"/>';
            if (site.battery)      popupContent += '<img title="battery backup" src="/images/battery-charging.svg"/>';

            if (Objects.isNotNullOrUndef(site.hours)) {
                popupContent += `<div class="limited">${site.formatHours()}</div>`; 
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

        popupContent += _buildLinksDiv(site, this.showDetails, this.showHistory);

        popupContent += "</div>";
        return popupContent;
    }

}


/**
 * This is the content in the InfoWindow that shows up when the user clicks 'details'.
 */
function _buildHistoryDiv(site) {
    let div = "";
    div += `<div class='info-window-details' id='nearby-details-${site.id}'>`;
    div += "<table style='width:100%;'>";

    div += "<tr style='font-weight:bold;'><td>Date</td><td>Status</td></tr>";

    if (!site.history.length) {
        div += `<tr><td>Unknown</td><td class='${site.status.value.toLowerCase().replace('_','-')}'>${site.status.value}</td></tr>`;
    } else {
        div += site.history.map(a => `<tr><td>${a.date}</td><td class='${a.siteStatus.toLowerCase().replace('_','-')}'>${a.siteStatus}</td></tr>`).join('');
    }

    div += "</table>";
    div += "<hr/></div>";
    return div;
}

function _buildLinksDiv(site, showDetails, showHistory) {
    return '<div class="links">'
        + buildLinkDetailsOrHistory(site, showDetails, showHistory)

        // links that are always present
        + buildLinkZoom(site)
        + buildLinkCircleToggle(site)
        + buildLinkAddToRoute(site)
        + buildLinkDirectToSite(site)

        // links that are NOT always present.
        + buildLinkGMapURL(site)
        + buildLinkDiscussURL(site)
        + buildLinkTeslaURL(site)
        + buildLinkPSURL(site)
        + buildLinkOSMURL(site)
        + buildLinkRemoveMarker(site)
        + buildLinkRemoveAllMarkers(site)
        + "</div>";
}

function buildLinkZoom(site) {
    return `<a class='zoom-to-site-trigger' href='${site.id}'><img src="/images/zoom-to-site.svg" title="zoom to site" alt="zoom to site"></a>`;
}

function buildLinkCircleToggle(site) {
    // If circles are turned on via the map drop-down menu update the text of our circle on/off label accordingly.
    // We only need one listener for all info windows, not one per info window.
    if (!InfoWindow.circleFlag) {
        EventBus.addListener("circles-all-on-event", function () {
            $("a.circle-toggle-trigger img").attr("title", "circle off");
            $("a.circle-toggle-trigger img").attr("alt", "circle off");
        });
        EventBus.addListener("circles-all-off-event", function () {
            $("a.circle-toggle-trigger img").attr("title", "circle on");
            $("a.circle-toggle-trigger img").attr("alt", "circle on");
        });
        InfoWindow.circleFlag = true;
    }
    const circleOnOffLabel = `circle ${site.circle ? "off" : "on"}`;
    return `<a class='circle-toggle-trigger' href='${site.id}'><img src="/images/circle-center-icon.svg" title="${circleOnOffLabel}" alt="${circleOnOffLabel}"/></a>`;
}

function buildLinkAddToRoute(site) {
    return `<a class='add-to-route-trigger' href='${site.id}'><img src="/images/route.svg" title="add to route" alt="add to route"/></a>`;
}

function buildLinkDirectToSite(site) {
    return `<a class='direct-link-trigger' href='${site.id}'><img src="/images/link-symbol.svg" title="direct link" alt="direct link"/></a>`;
}

function buildLinkTeslaURL(site) {
    if (Objects.isNotNullOrUndef(site.locationId)) {
        return `<a target='_blank' href='${site.getTeslaLink()}'><img src="/images/red_dot_t.svg" title="tesla.${site?.address?.isTeslaCN() ? 'cn' : 'com'}"/></a>`;
    }
    return '';
}

function buildLinkDiscussURL(site) {
    if (site.urlDiscuss) {
        return `<a target='_blank' href='${ServiceURL.DISCUSS}?siteId=${site.id}'><img src="/images/forum.svg" title="forum"/></a>`;
    }
    return '';
}

function buildLinkGMapURL(site) {
    if (Objects.isNotNullOrUndef(site.address.street)) {
        const addr = site.address;
        const query = encodeURI(`${addr.street||''} ${addr.city||''} ${addr.state||''} ${addr.zip||''} ${addr.country||''}`);
        return `<a target="_blank" href="https://www.google.com/maps/search/?api=1&query=${query.replace(/"/g, '%22')}"><img src="/images/gmap.svg" title="Google Map"/></a>`;
    }
    return '';
}

function buildLinkPSURL(site) {
    if (site.plugshareId) {
        return `<a href="https://api.plugshare.com/view/location/${site.plugshareId}" target="_blank"><img src="https://developer.plugshare.com/logo.svg" title="PlugShare"/></a>`;
    }
    return '';
}

function buildLinkOSMURL(site) {
    if (site.osmId) {
        return `<a href="https://www.openstreetmap.org/node/${site.osmId}" target="_blank"><img src="/images/osm.svg" title="OpenStreetMap"/></a>`;
    }
    return '';
}

function buildLinkRemoveMarker(site) {
    if (site.isUserAdded()) {
        return `<a class='marker-toggle-trigger' title='remove this custom marker' href='${site.id}'>remove</a>`;
    }
    return '';
}

function buildLinkRemoveAllMarkers(site) {
    if (site.isUserAdded()) {
        return "<a class='marker-toggle-all-trigger' title='remove all custom markers' href=''>remove all</a>";
    }
    return '';
}

function buildLinkDetailsOrHistory(site, showDetails, showHistory) {
    var content = '';
    if (!showDetails) {
        content = `<a class='details-trigger' href='#${site.id}' title="show details">details</a>`;
    } else if (Objects.isNotNullOrUndef(site.history)) {
        content = `<a class='history-trigger' href='#${site.id}' title="show history">history</a>`;
        content += `<a class='details-trigger' href='#${site.id}' title="hide details">×</a>`;
    }
    if (showHistory) {
        content += `<a class='history-trigger' href='#${site.id}' title="hide history">×</a>`;
    }
    return content;
}

function buildPinMarker(site, isPinned) {
    const pinClass = isPinned ? 'unpin' : 'pin';
    return `<a class='pin-marker-trigger pull-right ${pinClass} glyphicon glyphicon-pushpin' title='pin this window' href='#${site.id}'></a>`;
}
