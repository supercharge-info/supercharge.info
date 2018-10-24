const RouteEvents = {

    /**
     * Indicates that the user selected a route to display/load. Data is the selected route.
     */
    route_selected_for_load: "route-selected-for-load-event",

    /**
     * Data in the route model has changed.
     */
    model_changed: "route-model-changed-event",

    /**
     * Fired when a new waypoint should be added to the current route.  Data is the waypoint to add.
     */
    add_waypoint : "route-add-waypoint-event"

};

export default RouteEvents;
