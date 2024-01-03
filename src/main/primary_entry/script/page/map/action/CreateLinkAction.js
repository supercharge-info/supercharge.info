import EventBus from "../../../util/EventBus";
import rangeModel from "../RangeModel";
import $ from 'jquery';

/**
 *
 * @constructor
 */
const Action = function (mapApi) {
    this.mapApi = mapApi;
    EventBus.addListener("create-link-event", this.createLink, this);
};

// See notes elsewhere in the codebase where we do the same thing for explanation of why this is necessary.
Action.prototype.getCenter = function () {
    return this.mapApi.getCenter();
};

Action.prototype.createLink = function (event) {
    const zoom = this.mapApi.getZoom();
    const latLng = this.getCenter();
    let linkStr = window.location.href.split('?')[0];
    linkStr += '?Center=' + latLng.lat + ',' + latLng.lng + '&Zoom=' + zoom;
    if (rangeModel.getRangeMeters() !== 0) {
        if (rangeModel.displayUnit.isKilometers()) {
            linkStr += '&RangeKm=' + rangeModel.getCurrentRange();
        }
        else if (rangeModel.displayUnit.isMiles()) {
            linkStr += '&RangeMi=' + rangeModel.getCurrentRange();
        }
    }
    $('#create-link-input').val(linkStr);
    $("#go-to-button").attr('disabled', false);
    $("#link-dialog .modal-title").html("Link to Current View");

    showLinkModal();
};

/**
 * show the modal with a link to the current view.
 */
function showLinkModal() {
    const linkDialog = $("#link-dialog");
    const linkInput = $("#create-link-input");
    const goButton = $("#go-to-button");

    // Go to URL when "Go to! button is pressed"
    goButton.on('click', function () {
        window.location.href = linkInput.val();
    });

    // Focus on input field after dialog is shown
    // and select its contents for quick copy & paste
    linkDialog.on('shown.bs.modal', function (e) {
        linkInput.focus().select();
    });
    // Clear input field after any type of dialog close
    linkDialog.on('hidden.bs.modal', function (e) {
        linkInput.val("");
    });

    linkDialog.modal();
}


export default Action;

