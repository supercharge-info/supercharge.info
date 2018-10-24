import EventBus from "../../../util/EventBus";
import $ from "jquery";
import Sortable from "sortablejs";
import routingModel from "./RoutingModel";
import RouteEvents from "./RouteEvents";
import RouteSaveDialog from "./RouteSaveDialog";

export default class RoutingPanel {

    constructor() {
        this.routingPanel = $("#routing-panel");
        this.directionPanel = $("#route-directions-panel");
        this.waypointsPanel = $("#route-waypoints-panel");
        this.panelToggleButton = $("#routing-panel-toggle-button");

        this.routeSaveDialog = new RouteSaveDialog();

        this.initListeners();
    }

    initListeners() {
        const panel = this;

        this.panelToggleButton.click($.proxy(this.toggleRoutingPanel, this));
        $("#route-panel-close-trigger").click($.proxy(this.hide, this));
        $("#clear-route-trigger").click(function() {routingModel.clearWaypoints()});
        $("#save-route-trigger").click(() => {
            panel.routeSaveDialog.show();
        }).tooltip();

        const waypointsList = document.getElementById('route-waypoints-list');

        //TODO 2017/5/25 - quick fix for existing tesla browser.  Need to see how the site behaves after the next browser update and determine if a long term fix is needed
        if(navigator.userAgent.indexOf('AppleWebKit/534.34') === -1) {
            Sortable.create(waypointsList, {
                onEnd: function (event) {
                    panel.handleSortWaypoint(event);
                }
            });
        }

        EventBus.addListener(RouteEvents.model_changed, this.updatePanelView, this);
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
        if (routingModel.isEmpty()) {
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
        // clear any existing visual state, we re-draw each time model changes
        this.clearDirections();
        const unorderedList = this.waypointsPanel.find("ul");
        unorderedList.html("");

        if(routingModel.routeName === null) {
            $("#loaded-route-name").html("").hide();
        } else {
            $("#loaded-route-name").html(`Editing route <b>${routingModel.routeName}</b>`).show();
        }

        if (routingModel.isEmpty()) {
            this.hide(event);
        }
        else {
            this.show();
            $.each(routingModel.getWaypoints(), function (index, routingWaypoint) {
                unorderedList.append(
                    "<li class='list-group-item'>" +
                    "<button type='button' class='close' data-index='" + index + "'>&times;</button>" +
                    "<span class='badge pull-left'>" + String.fromCharCode(65 + index) + "</span>" +
                    "&nbsp;&nbsp;" +
                    routingWaypoint.displayName +
                    "</li>"
                );
            });
            unorderedList.find("button").on("click", $.proxy(this.handleRemoveWaypoint, this));
        }
    };

    handleSortWaypoint(event) {
        const beginIdx = event.oldIndex;
        const endIdx = event.newIndex;
        routingModel.moveWaypoint(beginIdx, endIdx);
    };

    handleRemoveWaypoint(event) {
        const index = $(event.target).data('index');
        routingModel.removeWaypoint(index);
    };

};