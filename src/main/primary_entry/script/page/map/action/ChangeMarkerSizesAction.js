import EventBus from "../../../util/EventBus";
import MapEvents from "../MapEvents";
import MarkerFactory from "../MarkerFactory";
import rangeModel from "../RangeModel";
import userConfig from "../../../common/UserConfig";

export default class ChangeMarkerSizesAction {

    constructor(mapApi) {
        this.mapApi = mapApi;
        this.markerFactory = new MarkerFactory(mapApi);
        EventBus.addListener("marker-sizes-changed-event", this.changeMarkerSizes, this);
        EventBus.addListener("marker-split-event", this.splitMarker, this);
    }

    changeMarkerSizes() {
        var newMarkerSize = rangeModel.getMarkerSizes();
        if (newMarkerSize !== userConfig.markerSizes) {
            EventBus.dispatch("remove-all-markers-event");
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