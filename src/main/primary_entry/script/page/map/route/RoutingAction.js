import EventBus from "../../../util/EventBus";
import RoutingWaypoint from "./RoutingWaypoint";
import RouteEvents from "./RouteEvents";
import L from 'leaflet';
import mbxDirections from '@mapbox/mapbox-sdk/services/directions';
import MapBox from '../MapBox'
import routeInputModel from './RouteInputModel'
import routeResultModel from './RouteResultModel';

export default class RoutingAction {

    constructor(mapApi) {
        this.mapApi = mapApi;
        this.directionsClient = mbxDirections({accessToken: MapBox.accessToken});

        EventBus.addListener(RouteEvents.input_model_changed, this.handleInputModelChange, this);
        EventBus.addListener(RouteEvents.add_waypoint, this.handleAddWaypointEvent, this);
        EventBus.addListener(RouteEvents.route_selected_for_load, this.handleRouteSelectedForLoad, this);
    }

    handleAddWaypointEvent(event, routingWaypoint) {
        if (!routeInputModel.isFull()) {
            routeInputModel.addWaypoint(routingWaypoint);
        }
    };

    handleRouteSelectedForLoad(event, route) {
        // convert route waypoints to supercharger type
        const routeWaypoints = [];
        route.waypoints.forEach((waypoint) => {
            routeWaypoints.push(new RoutingWaypoint(L.latLng(waypoint.lat, waypoint.lng), waypoint.name));
        });

        if(!routeResultModel.isEmpty()) {
            routeResultModel.setResult(null);
        }
        routeInputModel.updateRoute(route.id, route.name, routeWaypoints);
    };

    handleInputModelChange() {
        if (routeInputModel.size() > 1) {
            const wp = routeInputModel.getWaypoints().map((e) => {
                    return {'coordinates': [e.latLng.lng, e.latLng.lat]}
                }
            );

            this.directionsClient.getDirections(
                {
                    profile: 'driving',
                    alternatives: false, // Don't return alternative routes as we don't currently use.
                    overview: 'full', // Returned geometry valid for best zoom.
                    waypoints: wp,
                    steps: true // Return turn-by-turn instructions.
                })
                .send()
                .then(response => {
                    const directions = response.body;
                    routeResultModel.setResult(directions);
                })
        }
    };

};