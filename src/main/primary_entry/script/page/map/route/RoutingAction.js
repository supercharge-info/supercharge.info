import EventBus from "../../../util/EventBus";
import routingModel from "./RoutingModel";
import RoutingWaypoint from "./RoutingWaypoint";
import $ from "jquery";
import RouteEvents from "./RouteEvents";
import userConfig from "../../../common/UserConfig"

export default class RoutingAction {

    constructor(googleMap) {
        this.googleMap = googleMap;
        this.directionsService = new google.maps.DirectionsService();
        this.directionsPanel = $("#route-directions-panel");

        this.directionsRenderer = new google.maps.DirectionsRenderer({
            map: googleMap,
            panel: this.directionsPanel.get(0),
            preserveViewport: true,
            draggable: true
        });

        EventBus.addListener(RouteEvents.model_changed, this.handleModelChange, this);
        EventBus.addListener(RouteEvents.add_waypoint, this.handleAddWaypointEvent, this);
        EventBus.addListener(RouteEvents.route_selected_for_load, this.handleRouteSelectedForLoad, this);
    }

    handleAddWaypointEvent(event, routingWaypoint) {
        if (!routingModel.isFull()) {
            routingModel.addWaypoint(routingWaypoint);
        }
    };

    handleRouteSelectedForLoad(event, route) {
        // convert route waypoints to supercharger type
        const routeWaypoints = [];
        route.waypoints.forEach((waypoint) => {
            routeWaypoints.push(new RoutingWaypoint(new google.maps.LatLng(waypoint.lat, waypoint.lng), waypoint.name));
        });

        routingModel.updateRoute(route.id, route.name, routeWaypoints);
    };

    handleModelChange() {
        if (!routingModel.isEmpty()) {
            this.directionsRenderer.setMap(this.googleMap);

            const routeUnit = userConfig.getUnit().isMetric() ? google.maps.UnitSystem.METRIC :
                google.maps.UnitSystem.IMPERIAL;

            const directionsRequest = {
                origin: routingModel.getFirstLatLng().latLng,
                destination: routingModel.getLastLatLng().latLng,
                waypoints: routingModel.getBetweenLatLngList(),
                travelMode: google.maps.TravelMode.DRIVING,
                unitSystem: routeUnit

            };
            this.directionsService.route(directionsRequest, $.proxy(this.handleRouteResponse, this));
        } else {
            this.directionsRenderer.setMap(null);
        }
    };

    handleRouteResponse(response, status) {
        if (status === google.maps.DirectionsStatus.OK) {
            // hide the panel first to avoid unwanted effects visual during modification
            this.hideDirectionPanel();

            this.directionsRenderer.setDirections(response);

            const routingAction = this;

            // use timeout to wait for the panel to finish rendering
            setTimeout(function () {
                routingAction.addDetailedStepsLink();

                $(".adp-directions").hide(); // hide all directions

                routingAction.showDirectionPanel();
            }, 300);
        }
    };

    addDetailedStepsLink() {
        const adpSummaries = this.directionsPanel.find(".adp-summary").toArray();

        adpSummaries.forEach((adpSummary) => {
            const lastSummarySpan = $(adpSummary).find("span:last");
            if (lastSummarySpan.find("a").length === 0) {
                const showDetailsLink = $("<a class='pull-right' href='#'>Detailed Steps</a>");
                lastSummarySpan.append(showDetailsLink);
            }
            lastSummarySpan.show();
        });

        $(".adp-summary a").on("click", (event) => {
            event.preventDefault();
            $(event.target).parents(".adp-summary").next().find(".adp-directions").toggle();
        });
    };

    showDirectionPanel() {
        this.directionsPanel.show();
    };

    hideDirectionPanel() {
        this.directionsPanel.hide();
    };

};


