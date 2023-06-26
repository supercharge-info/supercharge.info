import $ from "jquery";
import SiteFilterControl from "./SiteFilterControl";
import userConfig from "./UserConfig";
import ServiceURL from "./ServiceURL";

export default class FilterDialog {

    constructor() {
        this.dialog = $("#filter-dialog");
        this.filterControl = new SiteFilterControl($("#common-filter"), this.filterControlCallback.bind(this), true);
        this.visibilityLabels = $("#common-filter label.btn");
        this.dialog.on('show.bs.modal', () => this.show());
        $("#filter-dialog button.apply").on("click", () => this.apply());
        $("#filter-dialog button.cancel").on("click", () => this.cancel());
        this.init();
    }

    init() {
        this.filterControl.init();
        this.visibilityLabels.each((l) => {
            const vlid = this.visibilityLabels[l].id, vl = $("#" + vlid);
            const vlField = vlid.split("-")[0], vlAction = vlid.split("-")[1];
            vl.on("click", () => {
                userConfig.showAlways[vlField] = (vlAction === "show");
            });
            if (vlAction === "show" && userConfig.showAlways[vlField]) {
                vl.addClass("active");
            } else if (vlAction === "hide" && !userConfig.showAlways[vlField]) {
                vl.addClass("active");
            } else {
                vl.removeClass("active");
            }
        });
    }

    show() {
        this.changed = false;
        this.prevUserConfig = JSON.stringify(userConfig);
        console.log(this.prevUserConfig);
        this.init();
    }

    apply() {
        userConfig.save();
        this.dialog.modal('hide');
    }

    cancel() {
        this.changed = false;
        userConfig.initFilters(true);
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
        userConfig.filter.otherEVs = this.filterControl.getOtherEVs();
        this.init();
    }
}