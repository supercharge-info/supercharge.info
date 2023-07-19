import EventBus from "../../util/EventBus";
import Analytics from "../../util/Analytics";
import Units from "../../util/Units";
import RangeInput from "./RangeInput";
import controlVisibleModel from "./ControlVisibleModel";
import $ from 'jquery';
import rangeModel from './RangeModel';
import "spectrum-colorpicker";

/**
 * View class for the range slider and label.
 *
 * @constructor
 */
export default class RangeControlView {

    constructor() {

        this.miUnitLabel = $("#range-unit-mi-label");
        this.kmUnitLabel = $("#range-unit-km-label");

        this.initRangeSlider();
        this.initRangeUnit();
        this.updateRangeUnit();
        this.initOpacitySliders();
        this.initColorInputs();
        this.handleVisibilityModelChange();

        EventBus.addListener("range-model-range-changed-event", this.handleRangeChange, this);
        EventBus.addListener("range-model-unit-changed-event", this.handleRangeUnitChange, this);
        EventBus.addListener("control-visible-model-changed-event", this.handleVisibilityModelChange, this);
        $(".range-circle-control button").on("click", this.handleRangeCircleButton.bind(this));
        $(".range-circle-control button").tooltip({ placement: "top" });
    }

    //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // Initialization
    //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    initOpacitySliders() {
        this.fillOpacitySlider = new RangeInput("#fill-opacity-slider", "#fill-opacity-number-text",
            0.0, 1.0, 0.1, rangeModel.fillOpacity);

        this.borderOpacitySlider = new RangeInput("#border-opacity-slider", "#border-opacity-number-text",
            0.0, 1.0, 0.1, rangeModel.borderOpacity);

        this.fillOpacitySlider.on("range-change-event", function (event, newOpacity) {
            rangeModel.fillOpacity = newOpacity;
            rangeModel.fireRangeChangedEvent();
        });
        this.borderOpacitySlider.on("range-change-event", function (event, newOpacity) {
            rangeModel.borderOpacity = newOpacity;
            rangeModel.fireRangeChangedEvent();
        });
    }

    initColorInputs() {
        $("#fill-color-input").spectrum({
            color: rangeModel.fillColor,
            change: $.proxy(this.handleFillColorChange, this)
        });

        $("#border-color-input").spectrum({
            color: rangeModel.borderColor,
            change: $.proxy(this.handleBorderColorChange, this)
        });
    }

    initRangeSlider() {
        this.rangeSlider = new RangeInput("#range-slider", "#range-number-text",
            rangeModel.getMinRange(),
            rangeModel.getMaxRange(),
            5,
            rangeModel.getCurrentRange());

        this.rangeSlider.on("range-change-event", function (event, newRange) {
            rangeModel.setCurrentRange(newRange);
        });
    }

    initRangeUnit() {
        const control = this;
        this.miUnitLabel.click(function () {
            rangeModel.setDisplayUnit(Units.MI);
            control.updateRangeSlider();
            Analytics.sendEvent("map", "change-range-unit", "mi");
        });
        this.kmUnitLabel.click(function () {
            rangeModel.setDisplayUnit(Units.KM);
            control.updateRangeSlider();
            Analytics.sendEvent("map", "change-range-unit", "km");
        });
    }

    updateRangeUnit() {
        if (rangeModel.getDisplayUnit().isMiles()) {
            this.miUnitLabel.addClass("active");
            this.kmUnitLabel.removeClass("active");
        } else {
            this.miUnitLabel.removeClass("active");
            this.kmUnitLabel.addClass("active");
        }
    }

    updateRangeSlider() {
        this.rangeSlider.setMin(rangeModel.getMinRange());
        this.rangeSlider.setMax(rangeModel.getMaxRange());
        this.rangeSlider.setValue(rangeModel.getCurrentRange());
    }

    handleRangeChange() {
        this.rangeSlider.setValue(rangeModel.getCurrentRange());
    }

    handleRangeUnitChange() {
        this.updateRangeSlider();
        this.updateRangeUnit();
    }

    handleRangeCircleButton(event) {
        if (event.currentTarget.id === "range-circles-all-off") {
            EventBus.dispatch("circles-all-off-event");
        }
        else if (event.currentTarget.id === "range-circles-all-on") {
            EventBus.dispatch("circles-all-on-event");
        }
    }

    /**
     * Handle fill color change.
     */
    handleFillColorChange(newColorEvent) {
        rangeModel.fillColor =  newColorEvent.toHexString();
        rangeModel.fireRangeChangedEvent();
    }

    /**
     * Handle border color change.
     */
    handleBorderColorChange(newColorEvent) {
        rangeModel.borderColor = newColorEvent.toHexString();
        rangeModel.fireRangeChangedEvent();
    }

    handleVisibilityModelChange() {
        $("#control-row-range").toggle(controlVisibleModel.rangeControlVisible);
    }
}