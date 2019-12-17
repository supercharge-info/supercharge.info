const MapEvents = {

    /**
     * User login check was successful. User login data is passed with this event.
     *
     * event data = integer siteId to show
     */
    show_location: "map-show-location-event",

    /**
     * Will cause the map to pan to the specified location/zoom.
     *
     * event data= { latlng: L.latLng  zoom :int }
     */
    pan_zoom: "map-pan-zoom-event",

    /**
     * Toggle circle on/off at for one marker
     */
    toggle_circle: "map-toggle-circle-single",

    /**
     * Fired when the user selects "add marker" from context menu.
     */
    context_menu_add_marker: "context-menu-add-marker-event",
    
};

export default MapEvents;
