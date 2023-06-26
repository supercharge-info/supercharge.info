import $ from "jquery";
import EventBus from "../util/EventBus";
import Events from "../util/Events";


export default class NavBarOptions {

    constructor() {
        this.rangeControlMenuItem = $("#range-menu-item");
        this.renderControlMenuItem = $("#rendering-menu-item");
        this.filterControlMenuItem = $("#filter-menu-item");
        EventBus.addListener("control-visible-model-changed-event", this.handleControlVisibilityChange, this);
        $(".control-view-buttons button").on("click", this.handleButton.bind(this));
    }

    handleButton(event) {
        if (event.currentTarget.id === "range-menu-item") {
            EventBus.dispatch("toggle-range-control-event");
        }
        else if (event.currentTarget.id === "rendering-menu-item") {
            EventBus.dispatch("toggle-render-control-event");
        }
        else if (event.currentTarget.id === "filter-menu-item") {
            EventBus.dispatch("toggle-filter-control-event");
        }
        else if (event.currentTarget.id === "create-link-menu-item") {
            EventBus.dispatch("create-link-event");
        }
        else if (event.currentTarget.id === "way-back-menu-item") {
            EventBus.dispatch("way-back-trigger-event");
        }
    };

    handleControlVisibilityChange(event, controlVisibilityModel) {
        NavBarOptions.checkboxUpdate(this.rangeControlMenuItem, controlVisibilityModel.rangeControlVisible);
        NavBarOptions.checkboxUpdate(this.renderControlMenuItem, controlVisibilityModel.renderControlVisible);
        NavBarOptions.checkboxUpdate(this.filterControlMenuItem, controlVisibilityModel.filterControlVisible);
    };

    static checkboxUpdate(menuItem, checked) {
        if (checked) {
            menuItem.addClass("active");
        } else {
            menuItem.removeClass("active");
        }
    }

}