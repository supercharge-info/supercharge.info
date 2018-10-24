import EventBus from "../../util/EventBus";
import Analytics from "../../util/Analytics";
import Units from "../../util/Units";
import RangeInput from "./RangeInput";
import controlVisibleModel from "./ControlVisibleModel";
import $ from 'jquery';
import rangeModel from './RangeModel';

/**
 * View class for the range slider and label.
 *
 * @constructor
 */
const RangeControlView = function () {

    this.miUnitLabel = $("#range-unit-mi-label");
    this.kmUnitLabel = $("#range-unit-km-label");

    this.initRangeSlider();
    this.initRangeUnit();
    this.updateRangeUnit();
    this.handleVisibilityModelChange();

    EventBus.addListener("range-model-range-changed-event", this.handleRangeChange, this);
    EventBus.addListener("range-model-unit-changed-event", this.handleRangeUnitChange, this);
    EventBus.addListener("control-visible-model-changed-event", this.handleVisibilityModelChange, this);
};

/**
 * Initialize range control.
 */
RangeControlView.prototype.initRangeSlider = function () {
    this.rangeSlider = new RangeInput("#range-slider", "#range-number-text",
        rangeModel.getMin(),
        rangeModel.getMax(),
        5,
        rangeModel.getCurrent());

    this.rangeSlider.on("range-change-event", function (event, newRange) {
        rangeModel.setCurrent(newRange);
    });
};

RangeControlView.prototype.initRangeUnit = function () {
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
};

RangeControlView.prototype.updateRangeUnit = function () {
    if (rangeModel.getDisplayUnit().isMiles()) {
        this.miUnitLabel.addClass("active");
        this.kmUnitLabel.removeClass("active");
    } else {
        this.miUnitLabel.removeClass("active");
        this.kmUnitLabel.addClass("active");
    }
};

RangeControlView.prototype.updateRangeSlider = function () {
    this.rangeSlider.setMin(rangeModel.getMin());
    this.rangeSlider.setMax(rangeModel.getMax());
    this.rangeSlider.setValue(rangeModel.getCurrent());
};

RangeControlView.prototype.handleRangeChange = function () {
    this.rangeSlider.setValue(rangeModel.getCurrent());
};

RangeControlView.prototype.handleRangeUnitChange = function () {
    this.updateRangeSlider();
    this.updateRangeUnit();
};

RangeControlView.prototype.handleVisibilityModelChange = function () {
    $("#control-row-range").toggle(controlVisibleModel.rangeControlVisible);
};

export default RangeControlView;

