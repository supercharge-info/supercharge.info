import EventBus from "../../../util/EventBus";
import MapEvents from "../MapEvents";

export default class PanZoomAction {

    constructor(mapApi) {
        this.mapApi = mapApi;
        EventBus.addListener(MapEvents.pan_zoom, this.zoomToLocation, this);
    }

    zoomToLocation(event, data) {
        this.mapApi.setZoom(data.zoom);
        this.mapApi.panTo(data.latLng);
    };

};