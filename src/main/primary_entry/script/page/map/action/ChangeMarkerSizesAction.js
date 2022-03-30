import EventBus from "../../../util/EventBus";
import rangeModel from "../RangeModel";
import userConfig from "../../../common/UserConfig";
import SiteIterator from "../../../site/SiteIterator";
import SitePredicates from "../../../site/SitePredicates";

export default class ChangeMarkerSizesAction {

    constructor(mapApi) {
        this.mapApi = mapApi;
        EventBus.addListener("marker-sizes-changed-event", this.changeMarkerSizes, this);
    }

    changeMarkerSizes() {
        var newMarkerSize = rangeModel.getMarkerSizes();
        if (newMarkerSize !== userConfig.markerSizes) {
            EventBus.dispatch("remove-all-markers-event");
            EventBus.dispatch("viewport-changed-event");
        }
    };

}