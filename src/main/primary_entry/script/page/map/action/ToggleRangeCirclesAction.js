import EventBus from "../../../util/EventBus";
import rangeModel from "../RangeModel";

/**
 *
 * @constructor
 */
const Action = function (mapView) {
    this.mapView = mapView;

    EventBus.addListener("circles-all-on-event", this.circlesAllOn, this);
    EventBus.addListener("circles-all-off-event", this.circlesAllOff, this);

};

Action.prototype.circlesAllOn = function () {
    if (rangeModel.getCurrent() === 0) {
        rangeModel.setCurrent(50);
    }
    this.mapView.setAllRangeCircleVisibility(true);
};

Action.prototype.circlesAllOff = function () {
    this.mapView.setAllRangeCircleVisibility(false);
};

export default Action;

