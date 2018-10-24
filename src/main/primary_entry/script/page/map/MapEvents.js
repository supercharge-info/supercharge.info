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
     * event data= { latlng: google.maps.LatLng  zoom :int }
     */
    pan_zoom: "map-pan-zoom-event"

};

export default MapEvents;
