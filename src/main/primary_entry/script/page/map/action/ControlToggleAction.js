import EventBus from "../../../util/EventBus";
import controlVisibilityModel from "../ControlVisibleModel";


/**
 * Handles toggling visibility of map controls.
 */
export default class ControlToggleAction {

    constructor() {
        EventBus.addListener("toggle-range-control-event", this.rangeToggle, this);
        EventBus.addListener("toggle-render-control-event", this.renderToggle, this);
        EventBus.addListener("toggle-filter-control-event", this.filterToggle, this);
        EventBus.addListener("hide-all-control-event", this.hideAll, this);
        EventBus.addListener("restore-all-control-event", this.restoreControls, this);
        this.wasRangeControlVisible = controlVisibilityModel.rangeControlVisible;
        this.wasRenderControlVisible = controlVisibilityModel.renderControlVisible;
        this.wasFilterControlVisible = controlVisibilityModel.filterControlVisible;
    }

    rangeToggle() {
        controlVisibilityModel.toggleRangeControlVisible();
        controlVisibilityModel.fireChangeEvent();
    }

    renderToggle() {
        controlVisibilityModel.toggleRenderControlVisible();
        controlVisibilityModel.fireChangeEvent();
    }

    filterToggle() {
        controlVisibilityModel.toggleFilterControlVisible();
        controlVisibilityModel.fireChangeEvent();
    }

    hideAll() {
        this.wasRangeControlVisible = controlVisibilityModel.rangeControlVisible;
        this.wasRenderControlVisible = controlVisibilityModel.renderControlVisible;
        this.wasFilterControlVisible = controlVisibilityModel.filterControlVisible;

        controlVisibilityModel.setRangeControlVisible(false);
        controlVisibilityModel.setRenderControlVisible(false);
        controlVisibilityModel.setFilterControlVisible(false);
        controlVisibilityModel.fireChangeEvent();
    }

    restoreControls() {
        controlVisibilityModel.setRangeControlVisible(this.wasRangeControlVisible);
        controlVisibilityModel.setRenderControlVisible(this.wasRenderControlVisible);
        controlVisibilityModel.setFilterControlVisible(this.wasFilterControlVisible);
        controlVisibilityModel.fireChangeEvent();
    }

}