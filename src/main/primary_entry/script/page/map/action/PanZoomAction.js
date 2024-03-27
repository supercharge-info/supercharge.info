import EventBus from "../../../util/EventBus";
import MapEvents from "../MapEvents";

export default class PanZoomAction {

    constructor(mapApi) {
        this.mapApi = mapApi;
        EventBus.addListener(MapEvents.pan_zoom, this.zoomToLocation, this);
    }

    zoomToLocation(event, data) {
        var zoom = data.zoom ?? this.mapApi.getZoom();
        if ((data.minZoom ?? 0) > zoom) zoom = data.minZoom;
        if ((data.maxZoom ?? 25) < zoom) zoom = data.maxZoom;
        this.mapApi.setView(data.latLng, zoom);
    }

}
