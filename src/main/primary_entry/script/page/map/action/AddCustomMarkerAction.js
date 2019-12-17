import $ from 'jquery';
import EventBus from "../../../util/EventBus";
import Analytics from "../../../util/Analytics";
import Sites from "../../../site/Sites";
import userConfig from "../../../common/UserConfig";
import MapEvents from '../MapEvents'

export default class AddCustomMarkerAction {

    constructor(mapView) {
        this.mapView = mapView;
        EventBus.addListener(MapEvents.context_menu_add_marker, $.proxy(this.showDialog, this));
        this.initialized = false;
    }

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // init
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    init() {
        this.initDom();
        this.initListeners();
        this.initialized = true;
    }

    initDom() {
        this.markerDialog = $("#new-marker-dialog");
        this.markerNameInput = $("#new-marker-name-input");
        this.markerAddButton = this.markerDialog.find(".btn-primary");
    };

    initListeners() {
        this.markerNameInput.on("keypress", (e) => {
            if (e.keyCode === 13) {
                /* enter pressed */
                this.markerAddButton.click();
            }
        });

        // Focus on input field after dialog is shown.
        this.markerDialog.on('shown.bs.modal', (e) => {
            this.markerNameInput.focus();
        });

        // Clear input field after any type of dialog close
        this.markerDialog.on('hidden.bs.modal', (e) => {
            this.markerNameInput.val("");
            this.markerAddButton.unbind();
        });

    };

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    //
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    handleAddClicked() {
        this.markerDialog.modal('hide');
        const markerName = this.markerNameInput.val();
        const newCharger = Sites.addCustomSite(markerName, this.currentLatLng);
        this.mapView.markerFactory.createMarker(newCharger);
        // TODO: show info window by default: new google.maps.event.trigger(newCharger.marker, 'click');
        Analytics.sendEvent("route", "add-custom-marker");
        userConfig.addCustomMarker({name: markerName, lat: this.currentLatLng.lat, lng: this.currentLatLng.lng})
    };

    showDialog(event, currentLatLng) {
        if (!this.initialized) {
            this.init();
        }
        // Not sure why, but this listener has to be re-initialized every time, can't be in initListeners method.
        this.markerAddButton.on('click', $.proxy(this.handleAddClicked, this));

        this.currentLatLng = currentLatLng;
        this.markerDialog.modal('show');
    };
}