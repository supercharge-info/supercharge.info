import EventBus from "../../../util/EventBus";
import controlVisibilityModel from "../ControlVisibleModel";

/**
 * Handles toggling visibility of map controls.
 *
 * @constructor
 */
const Action = function () {
    EventBus.addListener("toggle-range-control-event", this.rangeToggle, this);
    EventBus.addListener("toggle-status-control-event", this.statusToggle, this);
    EventBus.addListener("toggle-render-control-event", this.renderToggle, this);
    EventBus.addListener("hide-all-control-event", this.hideAll, this);
};

Action.prototype.rangeToggle = function () {
    controlVisibilityModel.toggleRangeControlVisible();
    controlVisibilityModel.fireChangeEvent();
};
Action.prototype.statusToggle = function () {
    controlVisibilityModel.toggleStatusControlVisible();
    controlVisibilityModel.fireChangeEvent();
};
Action.prototype.renderToggle = function () {
    controlVisibilityModel.toggleRenderControlVisible();
    controlVisibilityModel.fireChangeEvent();
};
Action.prototype.hideAll = function () {
    controlVisibilityModel.setRangeControlVisible(false);
    controlVisibilityModel.setStatusControlVisible(false);
    controlVisibilityModel.setRenderControlVisible(false);
    controlVisibilityModel.fireChangeEvent();
};

export default Action;

