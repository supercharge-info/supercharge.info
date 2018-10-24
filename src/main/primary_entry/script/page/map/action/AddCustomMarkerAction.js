import $ from 'jquery';
import EventBus from "../../../util/EventBus";
import Analytics from "../../../util/Analytics";
import Sites from "../../../site/Sites";
import userConfig from "../../../common/UserConfig";


let initialized = false;

/**
 * Display dialog for entering new custom marker to map.
 *
 * @constructor
 */
const Action = function (mapView) {
    this.mapView = mapView;
    EventBus.addListener("context-menu-add-marker-event", $.proxy(this.showDialog, this));
};

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// init
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

Action.prototype.init = function () {
    this.initDom();
    this.initListeners();
    initialized = true;
};

Action.prototype.initDom = function () {
    this.markerDialog = $("#new-marker-dialog");
    this.markerNameInput = $("#new-marker-name-input");
    this.markerAddButton = this.markerDialog.find(".btn-primary");
};

Action.prototype.initListeners = function () {
    const markerAddButton = this.markerAddButton;
    const markerNameInput = this.markerNameInput;

    this.markerNameInput.on("keypress", function (e) {
        if (e.keyCode === 13) {
            /* enter pressed */
            markerAddButton.click();
        }
    });

    // Focus on input field after dialog is shown.
    this.markerDialog.on('shown.bs.modal', function (e) {
        markerNameInput.focus();
    });

    // Clear input field after any type of dialog close
    this.markerDialog.on('hidden.bs.modal', function (e) {
        markerNameInput.val("");
        markerAddButton.unbind();
    });

};

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

Action.prototype.handleAddClicked = function () {
    this.markerDialog.modal('hide');
    const markerName = this.markerNameInput.val();
    const newCharger = Sites.addCustomSite(markerName, this.currentLatLng);
    this.mapView.markerFactory.createMarker(newCharger);
    new google.maps.event.trigger(newCharger.marker, 'click');
    Analytics.sendEvent("route", "add-custom-marker");
    userConfig.addCustomMarker({name: markerName, lat: this.currentLatLng.lat(), lng: this.currentLatLng.lng()})
};

Action.prototype.showDialog = function (event, currentLatLng) {
    if (!initialized) {
        this.init();
    }
    // Not sure why, but this listener has to be re-initialized every time, can't be in initListeners method.
    this.markerAddButton.on('click', $.proxy(this.handleAddClicked, this));

    this.currentLatLng = currentLatLng;
    this.markerDialog.modal('show');
};

export default Action;

