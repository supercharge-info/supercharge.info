import EventBus from "../../../util/EventBus";
import MapEvents from "../MapEvents";

export default class PanZoomAction {

    constructor(googleMap) {
        this.googleMap = googleMap;
        EventBus.addListener(MapEvents.pan_zoom, this.zoomToLocation, this);
    }

    zoomToLocation(event, data) {
        this.googleMap.panTo(data.latLng);
        this.googleMap.setZoom(data.zoom);
    };


};