import EventBus from "../../util/EventBus";
import controlVisibleModel from "./ControlVisibleModel";
import SiteFilterControl from "../../common/SiteFilterControl";
import userConfig from "../../common/UserConfig";
import $ from "jquery";

export default class FilterControlView {

    constructor(filterDialog) {
        this.filterControl = new SiteFilterControl(
            $("#control-row-filter"),
            this.filterControlCallback.bind(this),
            filterDialog
        );

        EventBus.addListener("control-visible-model-changed-event", this.handleVisibilityModelChange, this);
        EventBus.addListener("reset-filters", this.filterControl.handleFilterReset, this.filterControl);
        filterDialog.dialog.on("hidden.bs.modal", () => { EventBus.dispatch("viewport-changed-event"); });

        this.syncFilters();
    }
    
    syncFilters() {
        this.filterControl.init();
        EventBus.dispatch("remove-all-markers-event");
        EventBus.dispatch("viewport-changed-event");
    }

    filterControlCallback() {
        userConfig.setRegionId(this.filterControl.getRegionId());
        userConfig.setCountryId(this.filterControl.getCountryId());
        userConfig.setState(this.filterControl.getState());
        userConfig.setStatus(this.filterControl.getStatus());
        userConfig.setStalls(this.filterControl.getStalls());
        userConfig.setPower(this.filterControl.getPower());
        userConfig.setOtherEVs(this.filterControl.getOtherEVs());
        this.filterControl.updateVisibility();
        EventBus.dispatch("remove-all-markers-event");
        EventBus.dispatch("viewport-changed-event");
    }
    
    //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // Handlers for various UI component changes
    //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    handleVisibilityModelChange() {
        $("#control-row-filter").toggle(controlVisibleModel.filterControlVisible);
    }

}
