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
        "F": $("#marker-f-label")
    };
    this.markerSliders = {
        "C": $("#marker-c-slider"),
        "F": $("#marker-f-slider")
    };

    this.initRangeSlider();
    this.initRangeUnit();
    this.initMarkerType();
    this.updateRangeUnit();
    this.handleVisibilityModelChange();
    this.initClusterSizeSlider();
    this.initMarkerSizeSlider();

    EventBus.addListener("range-model-range-changed-event", this.handleRangeChange, this);
    EventBus.addListener("range-model-unit-changed-event", this.handleRangeUnitChange, this);
    EventBus.addListener("marker-type-changed-event", this.handleMarkerTypeChange, this);
    EventBus.addListener("range-model-clustersize-changed-event", this.handleClusterSizeChange, this);
    EventBus.addListener("range-model-markersize-changed-event", this.handleMarkerSizeChange, this);
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

RangeControlView.prototype.initClusterSizeSlider = function () {
    this.clusterSizeSlider = new RangeInput("#clustersize-slider", "#clustersize-number-text",
        rangeModel.getMinClusterSize(),
        rangeModel.getMaxClusterSize(),
        1,
        rangeModel.getCurrentClusterSize());

    this.clusterSizeSlider.on("range-change-event", function (event, newSize) {
        rangeModel.setCurrentClusterSize(newSize);
    });
};

RangeControlView.prototype.initMarkerSizeSlider = function () {
    this.markerSizeSlider = new RangeInput("#markersize-slider", "#markersize-number-text",
        rangeModel.getMinMarkerSize(),
        rangeModel.getMaxMarkerSize(),
        1,
        rangeModel.getCurrentMarkerSize());

    this.markerSizeSlider.on("range-change-event", function (event, newSize) {
        rangeModel.setCurrentMarkerSize(newSize);
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
        this.markerLabels[markerLabel]?.removeClass("active");
    }
    this.markerLabels[markerType]?.addClass("active");

    for (var markerSlider in this.markerSliders) {
        this.markerSliders[markerSlider]?.removeClass("active");
    }
    this.markerSliders[markerType]?.addClass("active");
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

RangeControlView.prototype.updateClusterSizeSlider = function () {
    this.clusterSizeSlider.setMin(rangeModel.getMinClusterSize());
    this.clusterSizeSlider.setMax(rangeModel.getMaxClusterSize());
    this.clusterSizeSlider.setValue(rangeModel.getCurrentClusterSize());
    EventBus.dispatch("remove-all-markers-event");
    EventBus.dispatch("viewport-changed-event");
};

RangeControlView.prototype.handleClusterSizeChange = function () {
    //console.log("set ClusterSize to " + rangeModel.getCurrentClusterSize())
    this.updateClusterSizeSlider();
};

RangeControlView.prototype.updateMarkerSizeSlider = function () {
    this.markerSizeSlider.setMin(rangeModel.getMinMarkerSize());
    this.markerSizeSlider.setMax(rangeModel.getMaxMarkerSize());
    this.markerSizeSlider.setValue(rangeModel.getCurrentMarkerSize());
    var z = rangeModel.getCurrentMarkerSize() * 2;
    document.getElementsByClassName("sample-marker").forEach(function (e) { e.width = z; e.height = z; })
    EventBus.dispatch("remove-all-markers-event");
    EventBus.dispatch("viewport-changed-event");
};

RangeControlView.prototype.handleMarkerSizeChange = function () {
    //console.log("set MarkerSize to " + rangeModel.getCurrentMarkerSize())
    this.updateMarkerSizeSlider();
};

RangeControlView.prototype.handleVisibilityModelChange = function () {
    $("#control-row-range").toggle(controlVisibleModel.rangeControlVisible);
};

export default RangeControlView;

