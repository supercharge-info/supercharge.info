import EventBus from "../../../util/EventBus";
import MapEvents from "../MapEvents";
import MarkerFactory from "../MarkerFactory";
import rangeModel from "../RangeModel";
import userConfig from "../../../common/UserConfig";

export default class ChangeMarkerTypeAction {

    constructor(mapApi) {
        this.mapApi = mapApi;
        this.markerFactory = new MarkerFactory(mapApi);
        EventBus.addListener("marker-type-changed-event", this.changeMarkerType, this);
        EventBus.addListener("marker-split-event", this.splitMarker, this);
    }

    changeMarkerType() {
        var newMarkerType = rangeModel.getMarkerType();
        if (newMarkerType !== userConfig.markerType) {
            EventBus.dispatch("viewport-changed-event");
        }
    };

    splitMarker(event, data) {
        data.superchargers[0].marker.remove();
        for (var s in data.superchargers) {
            data.superchargers[s].clusterMaxZoom = data.zoom - 1;
            this.markerFactory.createMarker(data.superchargers[s], "L");
        }
    }
}