import $ from "jquery";
import Events from "../../../util/Events";
import Sites from "../../../site/Sites";
import EventBus from "../../../util/EventBus";
import MapEvents from "../MapEvents";
import Analytics from "../../../util/Analytics";
import RouteEvents from "../route/RouteEvents";
import RoutingWaypoint from "../route/RoutingWaypoint";

function toSite(event) {
    const eventDetail = Events.eventDetail(event);
    const id = parseInt(eventDetail.actionName);
    return Sites.getById(id);
}

class InfoWindowListeners {

    constructor() {
        $(document).on('click', '.details-trigger', (event) => {
            const site = toSite(event);
            const infoWindow = site.marker.infoWindow;

            infoWindow.toggleHistory(false);
            infoWindow.toggleDetails();
            infoWindow.redraw();

        });

        $(document).on('click', '.history-trigger', (event) => {
            const site = toSite(event);
            const infoWindow = site.marker.infoWindow;

            infoWindow.toggleDetails(false);
            infoWindow.toggleHistory();
            infoWindow.redraw();

        });

        $(document).on('click', '.pin-marker-trigger', (event) => {
            const site = toSite(event);
            const infoWindow = site.marker.infoWindow;
            infoWindow.togglePin();
        });

        $(document).on('click', '.zoom-to-site-trigger', (event) => {
            const site = toSite(event);
            EventBus.dispatch("zoom-to-site-event", {site: site});
        });

        $(document).on('click', '.circle-toggle-trigger', (event) => {
            const eventDetail = Events.eventDetail(event);
            const site = toSite(event);

            var newLinkText = "off", sendEvent = "on";
            if (site.circle) {
                newLinkText = "on";
                sendEvent = "off";
            }
            eventDetail.link.attr("title", `circle ${newLinkText}`);
            eventDetail.link.attr("alt", `circle ${newLinkText}`);
            Analytics.sendEvent("map", `turn-${sendEvent}-single-circle`);
            EventBus.dispatch(MapEvents.toggle_circle, site);
        });

        $(document).on('click', '.add-to-route-trigger', (event) => {
            const site = toSite(event);
            EventBus.dispatch(RouteEvents.add_waypoint, new RoutingWaypoint(site.location, site.displayName));
            Analytics.sendEvent("route", "add-marker-to-route", "pop up");
        });

        $(document).on('click', '.direct-link-trigger', (event) => {
            const site = toSite(event);

            const linkDialog = $("#link-dialog");
            const linkInput = $("#create-link-input");
            const goButton = $("#go-to-button");

            $("#link-dialog .modal-title").html("Link to Current Site");
            linkInput.val(`${window.location.href.split('?')[0]}?siteID=${site.id}`);
        
            // Go to URL when "Go to! button is pressed"
            goButton.on('click', function () {
                window.location.href = linkInput.val();
            });
            goButton.attr('disabled', false);

            // Focus on input field after dialog is shown
            // and select its contents for quick copy & paste
            linkDialog.on('shown.bs.modal', function (e) {
                linkInput.focus().select();
            });
            // Clear input field after any type of dialog close
            linkDialog.on('hidden.bs.modal', function (e) {
                linkInput.val("");
            });
        
            linkDialog.modal();
        });
    }

}

export default new InfoWindowListeners();
