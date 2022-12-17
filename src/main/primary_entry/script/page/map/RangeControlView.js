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
    this.markerLabels = {
        "Z": $("#marker-z-label"),
        "C": $("#marker-c-label"),
        "F": $("#marker-f-label"),
        "S": $("#marker-s-label"),
        "M": $("#marker-m-label"),
        "L": $("#marker-l-label")
    };

    this.initRangeSlider();
    this.initRangeUnit();
    this.initMarkerType();
    this.updateRangeUnit();
    this.handleVisibilityModelChange();
    this.initDensitySlider();

    EventBus.addListener("range-model-range-changed-event", this.handleRangeChange, this);
    EventBus.addListener("range-model-unit-changed-event", this.handleRangeUnitChange, this);
    EventBus.addListener("marker-type-changed-event", this.handleMarkerTypeChange, this);
    EventBus.addListener("range-model-density-changed-event", this.handleDensityChange, this);
    EventBus.addListener("control-visible-model-changed-event", this.handleVisibilityModelChange, this);
};

/**
 * Initialize range control.
 */
RangeControlView.prototype.initRangeSlider = function () {
    this.rangeSlider = new RangeInput("#range-slider", "#range-number-text",
        rangeModel.getMinRange(),
        rangeModel.getMaxRange(),
        5,
        rangeModel.getCurrentRange());

    this.rangeSlider.on("range-change-event", function (event, newRange) {
        rangeModel.setCurrentRange(newRange);
    });
};

RangeControlView.prototype.initDensitySlider = function () {
    this.densitySlider = new RangeInput("#density-slider", "#density-number-text",
        rangeModel.getMinDensity(),
        rangeModel.getMaxDensity(),
        1,
        rangeModel.getCurrentDensity());

    this.densitySlider.on("range-change-event", function (event, newDensity) {
        rangeModel.setCurrentDensity(newDensity);
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

RangeControlView.prototype.initMarkerType = function () {
    const control = this;
    for (var markerLabel in this.markerLabels) {
        const ml = markerLabel;
        this.markerLabels[ml].click(function () {
            rangeModel.setMarkerType(ml);
            control.updateMarkerType();
            Analytics.sendEvent("map", "change-marker-type", ml);
        });
    }
};

RangeControlView.prototype.updateMarkerType = function () {
    var markerType = rangeModel.getMarkerType();
    for (var markerLabel in this.markerLabels) {
        this.markerLabels[markerLabel].removeClass("active");
    }
    this.markerLabels[markerType].addClass("active");
};

RangeControlView.prototype.updateRangeSlider = function () {
    this.rangeSlider.setMin(rangeModel.getMinRange());
    this.rangeSlider.setMax(rangeModel.getMaxRange());
    this.rangeSlider.setValue(rangeModel.getCurrentRange());
};

RangeControlView.prototype.handleRangeChange = function () {
    this.rangeSlider.setValue(rangeModel.getCurrentRange());
};

RangeControlView.prototype.handleRangeUnitChange = function () {
    this.updateRangeSlider();
    this.updateRangeUnit();
};

RangeControlView.prototype.handleMarkerTypeChange = function () {
    this.updateMarkerType();
};

RangeControlView.prototype.updateDensitySlider = function () {
    console.log("updateDensitySlider to " + rangeModel.getCurrentDensity())
    this.densitySlider.setMin(rangeModel.getMinDensity());
    this.densitySlider.setMax(rangeModel.getMaxDensity());
    this.densitySlider.setValue(rangeModel.getCurrentDensity());
    EventBus.dispatch("remove-all-markers-event");
    EventBus.dispatch("viewport-changed-event");
};

RangeControlView.prototype.handleDensityChange = function () {
    console.log("set Density to " + rangeModel.getCurrentDensity())
    this.updateDensitySlider();
};

RangeControlView.prototype.handleVisibilityModelChange = function () {
    $("#control-row-range").toggle(controlVisibleModel.rangeControlVisible);
};

export default RangeControlView;

