import EventBus from "../../../util/EventBus";
import $ from "jquery";
import Sortable from "sortablejs";
import routeInputModel from "./RouteInputModel";
import routeResultModel from "./RouteResultModel";
import RouteEvents from "./RouteEvents";
import RouteSaveDialog from "./RouteSaveDialog";
import directionFormatter from './DirectionFormatter';

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

        Sortable.create(waypointsList, {
            onEnd: (event) => this.handleSortWaypoint(event)
        });

        EventBus.addListener(RouteEvents.input_model_changed, this.updatePanelView, this);
        EventBus.addListener(RouteEvents.result_model_changed, this.updateDirections, this);
    }

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
        this.directionPanel.html(directionFormatter.format());
    }

    handleSortWaypoint(event) {
        const beginIdx = event.oldIndex;
        const endIdx = event.newIndex;
        // clear the route result model (ultimately causing existing render route to be cleared from map).
        routeResultModel.setResult(null);
        routeInputModel.moveWaypoint(beginIdx, endIdx);
    };

    handleRemoveWaypoint(event) {
        const index = $(event.target).data('index');
        // clear the route result model so that exiting lines are removed.
        routeResultModel.setResult(null);
        routeInputModel.removeWaypoint(index);
    };

};