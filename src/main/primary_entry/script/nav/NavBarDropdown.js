import $ from "jquery";
import EventBus from "../util/EventBus";
import Analytics from "../util/Analytics";
import Events from "../util/Events";


export default class NavBarDropdown {

    constructor() {
        this.rangeControlMenuItem = $("#range-menu-item").find(".glyphicon");
        this.statusControlMenuItem = $("#status-menu-item").find(".glyphicon");
        this.renderControlMenuItem = $("#rendering-menu-item").find(".glyphicon");
        EventBus.addListener("control-visible-model-changed-event", this.handleControlVisibilityChange, this);
    }

    handleAction(event) {
        const eventDetail = Events.eventDetail(event);

        if (eventDetail.actionName === "range-menu-item") {
            EventBus.dispatch("toggle-range-control-event");
            Analytics.sendEvent("control", "toggle-range-control");
        }
        else if (eventDetail.actionName === "status-menu-item") {
            EventBus.dispatch("toggle-status-control-event");
            Analytics.sendEvent("control", "toggle-status-control");
        }
        else if (eventDetail.actionName === "rendering-menu-item") {
            EventBus.dispatch("toggle-render-control-event");
            Analytics.sendEvent("control", "toggle-render-control");
        }
        else if (eventDetail.actionName === "range-circles-all-off") {
            EventBus.dispatch("circles-all-off-event");
            Analytics.sendEvent("map", "turn-off-all-circles");
        }
        else if (eventDetail.actionName === "range-circles-all-on") {
            EventBus.dispatch("circles-all-on-event");
            Analytics.sendEvent("map", "turn-on-all-circles");
        }
        else if (eventDetail.actionName === "create-link-menu-item") {
            EventBus.dispatch("create-link-event");
            Analytics.sendEvent("map", "create-link");
        }
        else if (eventDetail.actionName === "way-back-menu-item") {
            EventBus.dispatch("way-back-trigger-event");
            Analytics.sendEvent("map", "way-back");
        }
    };

    handleControlVisibilityChange(event, controlVisibilityModel) {
        NavBarDropdown.checkboxUpdate(this.rangeControlMenuItem, controlVisibilityModel.rangeControlVisible);
        NavBarDropdown.checkboxUpdate(this.statusControlMenuItem, controlVisibilityModel.statusControlVisible);
        NavBarDropdown.checkboxUpdate(this.renderControlMenuItem, controlVisibilityModel.renderControlVisible);
    };

    static checkboxUpdate(menuItem, checked) {
        if (checked && !menuItem.hasClass("glyphicon-check")) {
            menuItem.addClass("glyphicon-check");
            menuItem.removeClass("glyphicon-unchecked");
        }
        if (!checked && !menuItem.hasClass("glyphicon-unchecked")) {
            menuItem.addClass("glyphicon-unchecked");
            menuItem.removeClass("glyphicon-check");
        }
    }

}