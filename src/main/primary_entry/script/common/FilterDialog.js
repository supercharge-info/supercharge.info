import $ from "jquery";
import SiteFilterControl from "./SiteFilterControl";
import userConfig from "./UserConfig";

export default class FilterDialog {

    constructor() {
        this.dialog = $("#filter-dialog");
        this.filterControl = new SiteFilterControl($("#common-filter"), this.filterControlCallback.bind(this), true);
        this.visibilityInputs = $("#common-filter .show-always input");
        this.dialog.on('show.bs.modal', () => this.show());
        $("#filter-dialog button.apply").on("click", () => this.apply());
        $("#filter-dialog button.cancel").on("click", () => this.cancel());
        $("#filter-dialog button.reset-visibility").on("click", () => {
            userConfig.initShowAlways();
            this.init();
            this.filterControlCallback();
        });
        this.init();
    }

    init() {
        this.filterControl.init();
        this.visibilityInputs.each((i) => {
            const viid = this.visibilityInputs[i].id, vi = $("#" + viid);
            const viField = viid.split("-")[0];
            vi.on("change", () => {
                userConfig.showAlways[viField] = vi.prop("checked");
            });
            vi.prop("checked", userConfig.showAlways[viField]);
        });
    }

    show() {
        this.changed = false;
        this.prevUserConfig = JSON.stringify(userConfig);
        this.init();
    }

    apply() {
        userConfig.save();
        this.dialog.modal('hide');
    }

    cancel() {
        this.changed = false;
        userConfig.initFilters();
        userConfig.initShowAlways();
        userConfig.fromJSON(JSON.parse(this.prevUserConfig));
        this.init();
        this.dialog.modal('hide');
    }

    getFilterControl() {
        return this.filterControl;
    }

    filterControlCallback() {
        // avoid saving while the filter dialog is open by setting fields directly instead of using setter functions
        this.changed = true;
        userConfig.filter.regionId = this.filterControl.getRegionId();
        userConfig.filter.countryId = this.filterControl.getCountryId();
        userConfig.filter.state = this.filterControl.getState();
        userConfig.filter.status = this.filterControl.getStatus();
        userConfig.filter.stalls = this.filterControl.getStalls();
        userConfig.filter.power = this.filterControl.getPower();
        userConfig.filter.stallType = this.filterControl.getStallType();
        userConfig.filter.plugType = this.filterControl.getPlugType();
        userConfig.filter.parking = this.filterControl.getParking();
        userConfig.filter.otherEVs = this.filterControl.getOtherEVs();
        userConfig.filter.solar = this.filterControl.getSolar();
        userConfig.filter.battery = this.filterControl.getBattery();
        userConfig.filter.search = this.filterControl.getSearch();
        this.init();
    }
}