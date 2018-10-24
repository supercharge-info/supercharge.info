import EventBus from "../../util/EventBus";

class RenderModel {

    constructor() {
        this.fillOpacity = 0.15;
        this.fillColor = "#86c4ec";

        this.borderOpacity = 0.3;
        this.borderColor = "#181fe7";

    }

    fireRenderModelChangeEvent() {
        EventBus.dispatch("render-model-changed-event");
    }
}

export default new RenderModel();