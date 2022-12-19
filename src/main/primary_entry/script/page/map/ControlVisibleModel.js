import EventBus from "../../util/EventBus";
import QueryStrings from "../../common/QueryStrings";

class ControlVisibleModel {

    constructor() {
        const controlsParameter = QueryStrings.getControls();
        this.rangeControlVisible = controlsParameter.indexOf("range") >= 0;
        this.renderControlVisible = controlsParameter.indexOf("render") >= 0;
    }

    fireChangeEvent() {
        EventBus.dispatch("control-visible-model-changed-event", this);
    };

    toggleRangeControlVisible() {
        this.setRangeControlVisible(!this.rangeControlVisible);
    };

    toggleRenderControlVisible() {
        this.setRenderControlVisible(!this.renderControlVisible);
    };

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    setRangeControlVisible(visible) {
        this.rangeControlVisible = visible;
    };

    setRenderControlVisible(visible) {
        this.renderControlVisible = visible;
    };

}

export default new ControlVisibleModel();
