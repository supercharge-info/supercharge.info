import Analytics from "../../util/Analytics";
import $ from 'jquery';

/**
 * Convenience class for dealing with <input type='range'/>
 *
 * @constructor
 */
const RangeInput = function (inputSelectorString, labelSelectorString, min, max, step, value) {
    this.label = $(labelSelectorString);
    this.sliderDiv = $(inputSelectorString);

    this.setMin(min);
    this.setMax(max);
    this.setStep(step);
    this.setValue(value);

    this.sliderDiv.change($.proxy(internalHandleSliderMoved, this));
    this.label.change($.proxy(labelValueChanged, this));
};

//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// Event methods that delegate to jquery object for triggering/observing custom events.
//
// range-change-event          [newValue]
//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

RangeInput.prototype.on = function (eventName, callback) {
    this.sliderDiv.on(eventName, callback);
};

RangeInput.prototype.trigger = function (eventName, customData) {
    this.sliderDiv.trigger(eventName, customData);
};

//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//
//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

RangeInput.prototype.setMin = function (newValue) {
    this.sliderDiv.attr('min', newValue);
};

RangeInput.prototype.getMin = function () {
    return this.sliderDiv.attr('min');
};

RangeInput.prototype.setMax = function (newValue) {
    this.sliderDiv.attr('max', newValue);
};

RangeInput.prototype.getMax = function () {
    return this.sliderDiv.attr('max');
};

RangeInput.prototype.setStep = function (newValue) {
    this.sliderDiv.attr('step', newValue);
};

/**
 * Update the range value represented by this class.
 */
RangeInput.prototype.setValue = function (newValue) {
    this.sliderDiv.val(newValue);
    this.setLabelText(newValue);
};

RangeInput.prototype.setLabelText = function (newValue) {
    this.label.val(newValue);
};

RangeInput.prototype.notifyListeners = function (newValue) {
    const control = this;
    $.doTimeout("rangeTimerId", 200, function () {
        control.trigger("range-change-event", newValue);
    });
};

//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//
//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

/**
 * Update the range text display value.
 */
function internalHandleSliderMoved() {
    const newValue = this.sliderDiv.val();
    this.setLabelText(newValue);
    this.notifyListeners(newValue);
    Analytics.sendEvent("map", "adjust-range", "slider")
}

/**
 * Update the range slider value;
 */
function labelValueChanged() {
    let newValue = parseInt(this.label.val());
    if (newValue < this.getMin()) {
        newValue = this.getMin();
        this.setLabelText(newValue);
    } else if (newValue > this.getMax()) {
        newValue = this.getMax();
        this.setLabelText(newValue);
    }
    this.notifyListeners(newValue);
    Analytics.sendEvent("map", "adjust-range", "text")
}

export default RangeInput;
