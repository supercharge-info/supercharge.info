import $ from 'jquery';
import 'bootstrap-select';
import Sites from '../site/Sites';
import Status from '../site/SiteStatus';
import userConfig from './UserConfig';

export default class SiteFilterControl {

    /**
     * Constructor just does basic DOM reference and event handler setup.
     *
     * @param controlParent
     * @param changeCallback
     */
    constructor(controlParent, changeCallback, filterDialog) {
        this.controlParent = controlParent;
        this.changeCallback = changeCallback;
        this.modal = null;
        if (typeof filterDialog?.getFilterControl === 'function') {
            this.modal = filterDialog;
            this.modal.dialog.on("hide.bs.modal", () => {
                 this.init();
                 if (this.modal.changed) this.changeCallback();
            });
        }
        this.isModal = this.modal === null;
        this.sel = {}, this.clear = {};
        this.filters = ['changetype', 'region', 'country', 'state', 'status', 'stalls', 'power', 'otherEVs', 'search'];
        for (const field of this.filters) {
            this.sel[field] = controlParent.find(`select.${field}-select, input.${field}-input`);
            this.sel[field].change(this.changeCallback.bind(this));
            // TODO: do we want shortcut "x" buttons next to each field to clear them?
            /*
            this.clear[field] = controlParent.find(`button.${field}-clear`);
            this.clear[field]?.on("click", () => {
                this.setField(field, "");
                this.updateVisibility();
            });
            */
        }
        // can't handle region or country changes generically, so override those
        this.sel['region'].change(this.handleRegionChange.bind(this));
        this.sel['country'].change(this.handleCountryChange.bind(this));

        // special handling for text input
        this.sel['search'].keypress((event) => { if (event?.originalEvent?.code === 'Enter') event.preventDefault(); });
        this.sel['search'].keyup(this.handleSearchInput.bind(this));

        this.resetButton = controlParent.find(".reset");
        this.resetButton.on("click", this.handleFilterReset.bind(this));

		// select searchbox text after making a change to a searchable dropdown -
		// this facilitates multi-select or consecutive searches
        controlParent.find("[data-live-search]").on("changed.bs.select", (e) => {
            $(".dropdown.open .bs-searchbox input")[0]?.select();
        });
    }


    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // initialization
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    /**
     * We can't select an option element until all of the elements of both selects are populated,
     * and we can't do that until a remote call completes.
     *
     * Users of this component probably don't want to take further action until this init method
     * completes (else calls go getRegionId() and getCountryId() will not return the right thing)
     * so it returns a promise.  Constructor cannot return promise, thus this must exist outside
     * of the constructor.
     */
    init() {
        this.populateChangeTypeOptions();
        this.setChangeType(userConfig?.filter.changeType);

        this.populateRegionOptions();
        this.setRegionId(userConfig?.filter.regionId);

        this.populateCountryOptions();
        this.setCountryId(userConfig?.filter.countryId);

        this.populateStateOptions();
        this.setState(userConfig?.filter.state);

        this.populateStatusOptions();
        this.setStatus(userConfig?.filter.status || []);

        this.populateStallCountOptions();
        this.setStalls(userConfig?.filter.stalls);

        this.populatePowerOptions();
        this.setPower(userConfig?.filter.power);

        this.populateOtherEVsOptions();
        this.setOtherEVs(userConfig?.filter.otherEVs);

        this.setSearch(userConfig?.filter.search);

        if (!this.isModal) {
            this.modal.getFilterControl().init();
            this.updateVisibility();
        }

        $("button.filter").tooltip();
        // Add extra context to the Status filter
        $("div.form-control.status-select").tooltip({ title: 'Permanently Closed sites hidden by default on map - see About page for details', placement: 'top', container: 'body' });
        $("div.form-control.status-select").on("shown.bs.tooltip", () => {
            if (typeof window.sst !== "undefined") clearTimeout(window.sst);
            window.sst = setTimeout(() => $("div.form-control.status-select").tooltip('hide'), 5000);
        });
        $("div.form-control.status-select").on("hide.bs.tooltip", () => {
            if (typeof window.sst !== "undefined") clearTimeout(window.sst);
        });
    }

    updateVisibility() {
        this.setVisible("region",   userConfig?.showAlways?.region   || this.getRegionId()  !== null);
        this.setVisible("country",  userConfig?.showAlways?.country  || this.getCountryId() !== null);
        this.setVisible("state",    userConfig?.showAlways?.state    || (this.getState()    !== null && this.getState().length > 0));
        this.setVisible("status",   userConfig?.showAlways?.status   || (this.getStatus()   !== null && this.getStatus().length > 0));
        this.setVisible("stalls",   userConfig?.showAlways?.stalls   || this.getStalls()    !== null);
        this.setVisible("power",    userConfig?.showAlways?.power    || this.getPower()     !== null);
        this.setVisible("otherEVs", userConfig?.showAlways?.otherEVs || this.getOtherEVs()  !== null);
        this.setVisible("search",   userConfig?.showAlways?.search   || this.getSearch()    !== null);

        // show Reset button if any field is populated
        for (var f in userConfig?.filter) {
            if (!(userConfig?.filter[f] === null || userConfig?.filter[f] === "" || userConfig?.filter[f]?.length === 0)) {
                this.resetButton.removeClass("hidden");
                return;
            }
        }
        this.resetButton.addClass("hidden");
    }

    setVisible(field, isVisible) {
        var selectDiv = this.controlParent.find(`div.${field}-select, input.${field}-input`);
        if (isVisible) {
            selectDiv.removeClass("hidden");
            //this.clear[field].removeClass("hidden");
        } else {
            selectDiv.addClass("hidden");
            //this.clear[field].addClass("hidden");
        }
    }

    /**
     * When a user selects REGION then:
     *  (1) De-select country and state, if any.
     *  (2) Update the list of possible countries, possibly setting it to all countries if they have de-selected a region.
     *  (3) Invoke handleChangeFunction.
     */
    handleRegionChange() {
        this.sel['country'].selectpicker("val", "");
        this.sel['state'].selectpicker("val", "");
        this.populateCountryOptions();
        this.populateStateOptions();
        this.changeCallback();
    }

    /**
     * When a user selects COUNTRY then:
     *  (1) De-select state, if any.
     *  (2) Update the list of possible states, possibly setting it to all states if they have de-selected a country.
     *  (1) Invoke handleChangeFunction.
     */
    handleCountryChange() {
        this.sel['state'].selectpicker("val", "");
        this.populateStateOptions();
        this.changeCallback();
    }

    handleFilterReset() {
        userConfig.initFilters();
        this.init();
        this.changeCallback();
    }

    handleSearchInput() {
        if (this.textCallback) window.clearTimeout(this.textCallback);
        this.textCallback = window.setTimeout(() => {
            if (this.getSearch() !== this.lastSearch) this.changeCallback();
            this.lastSearch = this.getSearch();
        }, 1000);
    }

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // UI update methods
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    populateChangeTypeOptions() {
        this.sel['changetype'].html("<option value=''>Any Change</option>");
        this.sel['changetype'].append("<option value='ADD'>Add</option>");
        this.sel['changetype'].append("<option value='UPDATE'>Update</option>");
        this.sel['changetype'].selectpicker("refresh");
    }

    populateRegionOptions() {
        this.sel['region'].html("<option value=''>Any Region</option>");
        var regions = [...Sites.getRegions()].sort((a,b) => a[0].localeCompare(b[0]));
        regions.forEach(r => {
            this.sel['region'].append(`<option value='${r[1]}'>${r[0]}</option>`);
        });
        this.sel['region'].selectpicker("refresh");
    }

    populateCountryOptions() {
        var newRegionId = this.getRegionId();
        var countries = null;
        if (newRegionId !== null) {
            countries = [...Sites.getCountriesByRegion(newRegionId)];
        } else {
            countries = [...Sites.getCountries()];
        }

        this.sel['country'].html("<option value=''>Any Country</option>");
        countries.sort((a,b) => a[0].localeCompare(b[0])).forEach(c => {
            this.sel['country'].append(`<option value='${c[1]}'>${c[0]}</option>`);
        });
        this.sel['country'].selectpicker("refresh");
    }

    populateStateOptions() {
        var newCountryId = this.getCountryId();
        var newRegionId = this.getRegionId();
        var states = null;
        if (newCountryId !== null) {
            states = [...Sites.getStatesByCountry(newCountryId)];
        } else if (newRegionId !== null) {
            states = [...Sites.getStatesByRegion(newRegionId)];
        } else {
            states = [...Sites.getStates()];
        }
        states = states.filter(s => s !== null).sort();
        this.sel['state'].html("");
        states.forEach(s => {
            var sName = Sites.StateAbbreviations[s] || "";
            this.sel['state'].append(`<option data-tokens='${sName}' value='${s}' data-subtext="${sName}">${s}</option>`);
        });
        this.sel['state'].selectpicker("refresh");
    }

    populateStatusOptions() {
        this.sel['status'].html("");
        Status.ALL.forEach(s => {
            var imgHtml = `<img src='${s.getIcon()}' class='${s.value}' title='${s.displayName}'/>`;
            if (s === Status.OPEN) { imgHtml += `<img src='/images/red_dot_limited.svg' class='OPEN' title='Open - limited hours'/>`; }
            this.sel['status'].append(`<option data-content="${imgHtml}<span>${s.displayName}</span>" value='${s.value}'></option>`);
        });
        this.sel['status'].selectpicker("refresh");
    }

    populateStallCountOptions() {
        this.sel['stalls'].html("<option value=''>Any # Stalls</option>");
        var stallCounts = [4, 8, 12, 16, 20, 30, 40, 50];
        stallCounts.forEach(s => {
            this.sel['stalls'].append(`<option value='${s}'>&ge; ${s} stalls</option>`);
        });
        this.sel['stalls'].selectpicker("refresh");
    }

    populatePowerOptions() {
        this.sel['power'].html("<option value=''>Any Power</option>");
        var power = [72, 120, 150, 250];
        power.forEach(p => {
            this.sel['power'].append(`<option value='${p}'>&ge; ${p} kW</option>`);
        });
        this.sel['power'].selectpicker("refresh");
    }

    populateOtherEVsOptions() {
        this.sel['otherEVs'].html("<option value=''>Any Vehicle</option>");
        this.sel['otherEVs'].append(`<option data-content="Teslas Only" value='false'></option>`);
        this.sel['otherEVs'].append(`<option data-content="Teslas + Other EVs" value='true'></option>`);
        this.sel['otherEVs'].selectpicker("refresh");
    }

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // getters/setters
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    getChangeType() {
        const changeType = this.sel['changetype'].val();
        return changeType === "" ? null : changeType;
    }

    getCountryId() {
        const id = parseInt(this.sel['country'].val());
        return typeof id === 'number' && Number.isFinite(id) ? id : null;
    }

    getRegionId() {
        const id = parseInt(this.sel['region'].val());
        return typeof id === 'number' && Number.isFinite(id) ? id : null;
    }

    getState() {
        const state = this.sel['state'].val();
        return state === "" ? null : state;
    }

    getStatus() {
        const status = this.sel['status'].val();
        return status === "" ? null : status;
    }

    getStalls() {
        const stalls = parseInt(this.sel['stalls'].val());
        return typeof stalls === 'number' && Number.isFinite(stalls) ? stalls : null;
    }

    getPower() {
        const power = parseInt(this.sel['power'].val());
        return typeof power === 'number' && Number.isFinite(power) ? power : null;
    }

    getOtherEVs() {
        const otherEVs = this.sel['otherEVs'].val();
        return otherEVs === "" ? null : otherEVs;
    }

    getSearch() {
        const search = this.sel['search'].val();
        return search === "" ? null : search;
    }

    setField(field, value) {
        if (field === "search") {
            this.sel[field].val(value);
        } else {
            this.sel[field].selectpicker("val", value);
        }
        this.changeCallback();
    }

    setChangeType(changeType) {
        this.sel['changetype'].selectpicker("val", changeType);
    }

    setCountryId(countryId) {
        this.sel['country'].selectpicker("val", countryId);
    }

    setRegionId(regionId) {
        this.sel['region'].selectpicker("val", regionId);
    }

    setState(state) {
        this.sel['state'].selectpicker("val", state);
    }

    setStatus(status) {
        this.sel['status'].selectpicker("val", status);
    }

    setStalls(stalls) {
        this.sel['stalls'].selectpicker("val", stalls);
    }

    setPower(power) {
        this.sel['power'].selectpicker("val", power);
    }

    setOtherEVs(otherEVs) {
        this.sel['otherEVs'].selectpicker("val", otherEVs);
    }

    setSearch(search) {
        this.sel['search'].val(search);
    }

}
