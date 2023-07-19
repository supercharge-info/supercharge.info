import EventBus from "../../../util/EventBus";
import Analytics from "../../../util/Analytics";
import $ from "jquery";
import RouteEvents from "./RouteEvents";

/**
 * This represents the user INPUT to routing, not the server generated route.
 */
class RouteInputModel {

    constructor() {
        this.waypointList = [];
        // these will be non-null if we are currently working on a saved route.
        this.routeId = null;
        this.routeName = null;
    }

    static fireChangeEvent() {
        EventBus.dispatch(RouteEvents.input_model_changed);
    }

    getWaypoints() {
        return this.waypointList;
    }

    updateRoute(routeId, routeName, waypointList) {
        this.routeId = routeId;
        this.routeName = routeName;
        this.waypointList = waypointList.slice();
        RouteInputModel.fireChangeEvent();
    }

    addWaypoint(waypoint) {
        this.waypointList.push(waypoint);
        RouteInputModel.fireChangeEvent();
    }

    clearWaypoints() {
        this.waypointList = [];
        this.routeId = null;
        this.routeName = null;
        RouteInputModel.fireChangeEvent();
        Analytics.sendEvent("route", "clear-waypoints");
    }

    removeWaypoint(index) {
        this.waypointList.splice(index, 1);
        if(this.isEmpty()) {
            this.routeId = null;
            this.routeName = null;
        }
        RouteInputModel.fireChangeEvent();
        Analytics.sendEvent("route", "remove-waypoint-from-route");
    }

    moveWaypoint(beginIdx, endIdx) {
        const waypoint = this.waypointList[beginIdx];
        this.waypointList.splice(beginIdx, 1);
        this.waypointList.splice(endIdx, 0, waypoint);
        RouteInputModel.fireChangeEvent();

        Analytics.sendEvent("route", "move-waypoint");
    }

    size() {
        return this.waypointList.length;
    }

    isEmpty() {
        return this.size() === 0;
    }

    isFull() {
        /* Google directory service can only do up to 25 waypoints. */
        return this.size() === 25;
    }

    getFirstLatLng() {
        return this.waypointList[0];
    }

    getLastLatLng() {
        return this.waypointList[this.size() - 1];
    }

    getBetweenLatLngList() {
        const wayPointLatLngList = [];
        const INDEX_LAST = this.waypointList.length - 1;
        const INDEX_FIRST = 0;
        $.each(this.waypointList, function (index, value) {
            if ((index !== INDEX_FIRST) && (index !== INDEX_LAST)) {
                wayPointLatLngList.push({location: value.latLng, stopover: true});
            }
        });
        return wayPointLatLngList;
    }

}

export default new RouteInputModel();

