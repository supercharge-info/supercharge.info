import EventBus from "../../util/EventBus";
import controlVisibleModel from "./ControlVisibleModel";
import SiteFilterControl from "../../common/SiteFilterControl";
import userConfig from "../../common/UserConfig";
import $ from "jquery";

export default class FilterControlView {

    constructor() {
        EventBus.addListener("control-visible-model-changed-event", this.handleVisibilityModelChange, this);

        this.filterControl = new SiteFilterControl(
            $("#control-row-filter"),
            this.filterControlCallback.bind(this),
            true
        );
    
        this.syncFilters();
    }
    
    syncFilters() {
        this.filterControl.init(userConfig);
    }

    filterControlCallback() {
        userConfig.setRegionId(this.filterControl.getRegionId());
        userConfig.setCountryId(this.filterControl.getCountryId());
        userConfig.setState(this.filterControl.getState());
        userConfig.setStatus(this.filterControl.getStatus());
        userConfig.setStalls(this.filterControl.getStalls());
        userConfig.setPower(this.filterControl.getPower());
        EventBus.dispatch("remove-all-markers-event");
        EventBus.dispatch("viewport-changed-event");
    }
    
    //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // Handlers for various UI component changes
    //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    handleVisibilityModelChange() {
        $("#control-row-filter").toggle(controlVisibleModel.filterControlVisible);
    };

}