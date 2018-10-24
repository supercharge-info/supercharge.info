import EventBus from "../../util/EventBus";
import RangeInput from "./RangeInput";
import renderModel from "./RenderModel";
import controlVisibleModel from "./ControlVisibleModel";
import $ from "jquery";
import "spectrum-colorpicker";

export default class RenderView {

    constructor() {
        this.initOpacitySliders();
        this.initColorInputs();
        this.handleVisibilityModelChange();
        EventBus.addListener("control-visible-model-changed-event", this.handleVisibilityModelChange, this);
    }

//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// Initialization
//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    initOpacitySliders() {

        this.fillOpacitySlider = new RangeInput("#fill-opacity-slider", "#fill-opacity-number-text",
            0.0, 1.0, 0.1, renderModel.fillOpacity);

        this.borderOpacitySlider = new RangeInput("#border-opacity-slider", "#border-opacity-number-text",
            0.0, 1.0, 0.1, renderModel.borderOpacity);

        this.fillOpacitySlider.on("range-change-event", function (event, newOpacity) {
            renderModel.fillOpacity = newOpacity;
            renderModel.fireRenderModelChangeEvent();
        });
        this.borderOpacitySlider.on("range-change-event", function (event, newOpacity) {
            renderModel.borderOpacity = newOpacity;
            renderModel.fireRenderModelChangeEvent();
        });

    };

    initColorInputs() {
        $("#fill-color-input").spectrum({
            color: renderModel.fillColor,
            change: $.proxy(this.handleFillColorChange, this)
        });

        $("#border-color-input").spectrum({
            color: renderModel.borderColor,
            change: $.proxy(this.handleBorderColorChange, this)
        });
    };


//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// Handlers for various UI component changes
//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    /**
     * Handle fill color change.
     */
    handleFillColorChange(newColorEvent) {
        renderModel.fillColor =  newColorEvent.toHexString();
        renderModel.fireRenderModelChangeEvent();
    };

    /**
     * Handle border color change.
     */
    handleBorderColorChange(newColorEvent) {
        console.log("INFO: handleBorderColorChange");
        renderModel.borderColor = newColorEvent.toHexString();
        renderModel.fireRenderModelChangeEvent();
    };

//- - - - - - - - - - - - - - - -- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//
//- - - - - - - - - - - - - -  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    handleVisibilityModelChange() {
        $("#control-row-rendering").toggle(controlVisibleModel.renderControlVisible);
    };

}