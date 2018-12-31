import EventBus from "../../../util/EventBus";
import $ from "jquery";
import Sortable from "sortablejs";
import routeInputModel from "./RouteInputModel";
import routeResultModel from "./RouteResultModel";
import RouteEvents from "./RouteEvents";
import RouteSaveDialog from "./RouteSaveDialog";
import userConfig from '../../../common/UserConfig'
import unitConversion from '../../../util/UnitConversion'
import Units from "../../../util/Units";

export default class RoutingPanel {

    constructor() {
        this.routingPanel = $("#routing-panel");
        this.waypointsPanel = $("#route-waypoints-panel");
        this.directionPanel = $("#route-directions-panel");
        this.panelToggleButton = $("#routing-panel-toggle-button");

        this.routeSaveDialog = new RouteSaveDialog();

        this.panelToggleButton.click($.proxy(this.toggleRoutingPanel, this));

        $("#route-panel-close-trigger").click($.proxy(this.hide, this));

        $("#clear-route-trigger").click((event) => {
            event.preventDefault();
            routeInputModel.clearWaypoints();
            routeResultModel.setResult(null);
        });

        $("#save-route-trigger").click((event) => {
            event.preventDefault();
            this.routeSaveDialog.show()
        }).tooltip();

        const waypointsList = document.getElementById('route-waypoints-list');

        //TODO 2017/5/25 - quick fix for existing tesla browser.  Need to see how the site behaves after the next browser update and determine if a long term fix is needed
        if (navigator.userAgent.indexOf('AppleWebKit/534.34') === -1) {
            Sortable.create(waypointsList, {
                onEnd: function (event) {
                    panel.handleSortWaypoint(event);
                }
            });
        }

        EventBus.addListener(RouteEvents.input_model_changed, this.updatePanelView, this);
        EventBus.addListener(RouteEvents.result_model_changed, this.updateDirections, this);
    }

    clearDirections() {
        this.directionPanel.html("");
    };

    toggleRoutingPanel(event) {
        if (this.routingPanel.css("flex-basis") !== "0px") { // is open
            this.hide(event);
        } else {
            this.show();
        }
    };

    show() {
        this.routingPanel.css("flex-basis", "400px");
        this.panelToggleButton.find(".glyphicon-menu-left").show();
        this.panelToggleButton.find(".glyphicon-menu-right").hide();
        this.showToggleButton();
    };

    hide(event) {
        event.preventDefault();
        this.routingPanel.css("flex-basis", "0");
        this.panelToggleButton.find(".glyphicon-menu-left").hide();
        this.panelToggleButton.find(".glyphicon-menu-right").show();
        if (routeInputModel.isEmpty()) {
            this.hideToggleButton();
        }
    };

    hideToggleButton() {
        this.panelToggleButton.css('visibility', 'hidden');
    };

    showToggleButton() {
        this.panelToggleButton.css('visibility', 'visible');
    };

    updatePanelView() {
        const unorderedList = this.waypointsPanel.find("ul");
        unorderedList.html("");

        if (routeInputModel.routeName === null) {
            $("#loaded-route-name").html("").hide();
        } else {
            $("#loaded-route-name").html(`Editing route <b>${routeInputModel.routeName}</b>`).show();
        }

        if (routeInputModel.isEmpty()) {
            this.hide(event);
        } else {
            this.show();
            $.each(routeInputModel.getWaypoints(), (index, routingWaypoint) => {
                unorderedList.append(
                    `<li class='list-group-item'>
                    <button type='button' class='close' data-index='${index}'>&times;</button>
                    <span class='badge pull-left'>${String.fromCharCode(65 + index)}</span>
                    &nbsp;&nbsp;
                    ${routingWaypoint.displayName}
                    </li>`
                );
            });
            unorderedList.find("button").on("click", $.proxy(this.handleRemoveWaypoint, this));
        }
    };

    updateDirections() {
        const convert = unitConversion(Units.M, userConfig.getUnit(), 1);
        const toHourMinSec = (seconds) => new Date(seconds * 1000).toISOString().substr(11, 8);
        const formatDistance = (meters) => (meters === 0) ? '' : `${convert(meters)} ${userConfig.getUnit().code}`;

        this.clearDirections();
        if (!routeResultModel.isEmpty()) {
            const route = routeResultModel.getBestRoute();
            this.directionPanel.append(
                `
                <b>duration</b>: ${toHourMinSec(route.duration)}<br/>
                <b>distance</b>: ${formatDistance(route.distance)}<br/>
                legs: ${route.legs.length}
                <br/>
                <br/>
                `
            );
            route.legs.forEach((leg, index) => {
                // If more than one leg, show a summary for each.
                if (route.legs.length > 1) {
                    this.directionPanel.append(
                        `<div class='route-panel-leg-summary'>
                        Leg ${index + 1}: <br/>${leg.summary} ${leg.steps.length} <br/>
                        <b>${formatDistance(leg.distance)}</b>
                     </div>`
                    );
                }
                this.directionPanel.append('<ol>');
                leg.steps.forEach(step => {
                    this.directionPanel.append(
                        `
                        <li>${step.maneuver.instruction} <b>${formatDistance(step.distance)}</b></li>
                        `
                    );
                });
                this.directionPanel.append('</ol>');
            });
        }
    }

    handleSortWaypoint(event) {
        const beginIdx = event.oldIndex;
        const endIdx = event.newIndex;
        routeInputModel.moveWaypoint(beginIdx, endIdx);
    };

    handleRemoveWaypoint(event) {
        const index = $(event.target).data('index');
        routeInputModel.removeWaypoint(index);
    };

};