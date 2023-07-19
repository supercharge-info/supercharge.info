import EventBus from "../../util/EventBus";
import QueryStrings from "../../common/QueryStrings";

class ControlVisibleModel {

    constructor() {
        const controlsParameter = QueryStrings.getControls();
        this.rangeControlVisible = controlsParameter.indexOf("range") >= 0;
        this.renderControlVisible = controlsParameter.indexOf("render") >= 0;
        this.filterControlVisible = controlsParameter.indexOf("filter") >= 0;
    }

    fireChangeEvent() {
        EventBus.dispatch("control-visible-model-changed-event", this);
    }

    toggleRangeControlVisible() {
        this.setRangeControlVisible(!this.rangeControlVisible);
    }

    toggleRenderControlVisible() {
        this.setRenderControlVisible(!this.renderControlVisible);
    }

    toggleFilterControlVisible() {
        this.setFilterControlVisible(!this.filterControlVisible);
    }

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    setRangeControlVisible(visible) {
        this.rangeControlVisible = visible;
    }

    setRenderControlVisible(visible) {
        this.renderControlVisible = visible;
    }

    setFilterControlVisible(visible) {
        this.filterControlVisible = visible;
    }

}

export default new ControlVisibleModel();
