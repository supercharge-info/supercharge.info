import EventBus from "../../util/EventBus";
import SiteStatus from "../../site/SiteStatus";
import controlVisibleModel from "../map/ControlVisibleModel";
import $ from 'jquery';

/**
 *
 * @constructor
 */
const Control = function () {
    this.statusPermitCheckbox = $("#status-permit-check");
    this.statusOpenCheckbox = $("#status-open-check");
    this.statusConstructionCheckbox = $("#status-construction-check");

    this.statusOpenCheckbox.click($.proxy(this.openClicked, this));
    this.statusConstructionCheckbox.click($.proxy(this.constructionClicked, this));
    this.statusPermitCheckbox.click($.proxy(this.permitClicked, this));

    this.handleVisibilityModelChange();

    EventBus.addListener("status-model-changed-event", this.handleStatusModelChange, this);
    EventBus.addListener("control-visible-model-changed-event", this.handleVisibilityModelChange, this)
};

Control.prototype.openClicked = function (event) {
    EventBus.dispatch("status-selection-change-event", SiteStatus.OPEN);
};
Control.prototype.constructionClicked = function (event) {
    EventBus.dispatch("status-selection-change-event", SiteStatus.CONSTRUCTION);
};
Control.prototype.permitClicked = function (event) {
    EventBus.dispatch("status-selection-change-event", SiteStatus.PERMIT);
};


function toggleCheckbox(enclosingDiv, newCheckState) {
    const imageSpan = enclosingDiv.find(".glyphicon");
    imageSpan.toggleClass("glyphicon-unchecked", !newCheckState);
    imageSpan.toggleClass("glyphicon-check", newCheckState);
}

Control.prototype.handleStatusModelChange = function (event, statusModel) {
    toggleCheckbox(this.statusOpenCheckbox, statusModel.showOpen);
    toggleCheckbox(this.statusConstructionCheckbox, statusModel.showConstruction);
    toggleCheckbox(this.statusPermitCheckbox, statusModel.showPermit);
};

Control.prototype.handleVisibilityModelChange = function () {
    $("#control-row-status").toggle(controlVisibleModel.statusControlVisible);
};

export default Control;


