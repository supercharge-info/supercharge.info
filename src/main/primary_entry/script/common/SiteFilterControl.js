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
        this.lastSearch = null;
        if (typeof filterDialog?.getFilterControl === 'function') {
            this.modal = filterDialog;
            this.modal.dialog.on("hide.bs.modal", () => {
                 this.init();
                 if (this.modal.changed) this.changeCallback();
            });
        }
        this.isModal = this.modal === null;
        this.sel = {}, this.clear = {};
        this.filters = ['changetype', 'region', 'country', 'state', 'status', 'stalls', 'power', 'openTo', 'stallType', 'plugType', 'parking', 'solar', 'battery', 'search'];
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
        this.minSearchSize = this.sel['search'].attr('size');
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

        this.populateStallTypeOptions();
        this.setStallType(userConfig?.filter.stallType);

        this.populatePlugTypeOptions();
        this.setPlugType(userConfig?.filter.plugType);

        this.populateParkingOptions();
        this.setParking(userConfig?.filter.parking);

        this.populateOpenToOptions();
        this.setOpenTo(userConfig?.filter.openTo);

        this.populateSolarOptions();
        this.setSolar(userConfig?.filter.solar);

        this.populateBatteryOptions();
        this.setBattery(userConfig?.filter.battery);

        this.setSearch(userConfig?.filter.search);
        this.handleSearchInput();

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
        this.setVisible("region",    userConfig?.showAlways?.region    || this.getRegionId()  !== null);
        this.setVisible("country",   userConfig?.showAlways?.country   || this.getCountryId() !== null);
        this.setVisible("state",     userConfig?.showAlways?.state     || this.getState()?.length > 0);
        this.setVisible("status",    userConfig?.showAlways?.status    || this.getStatus()?.length > 0);
        this.setVisible("stalls",    userConfig?.showAlways?.stalls    || this.getStalls()    !== null);
        this.setVisible("power",     userConfig?.showAlways?.power     || this.getPower()     !== null);
        this.setVisible("stallType", userConfig?.showAlways?.stallType || this.getStallType()?.length > 0);
        this.setVisible("plugType",  userConfig?.showAlways?.plugType  || this.getPlugType()?.length > 0);
        this.setVisible("parking",   userConfig?.showAlways?.parking   || this.getParking()?.length > 0);
        this.setVisible("openTo",    userConfig?.showAlways?.openTo    || this.getOpenTo()?.length > 0);
        this.setVisible("solar",     userConfig?.showAlways?.solar     || this.getSolar()     !== null);
        this.setVisible("battery",   userConfig?.showAlways?.battery   || this.getBattery()   !== null);
        this.setVisible("search",    userConfig?.showAlways?.search    || this.getSearch()    !== null);

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
        if (this.getSearch()) this.sel['search'].addClass('filled');
        else this.sel['search'].removeClass('filled');
        const w = Math.max(this.getSearch()?.length ?? this.minSearchSize, this.minSearchSize);
        this.sel['search'].attr('size', w);
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
        const options = `
            <option value="">Any Change</option>
            <option value="ADD">Add</option>
            <option value="UPDATE">Update</option>
        `;
        this.sel['changetype'].html(options);
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

        this.sel['country'].html('<option value="">Any Country</option>');
        countries.sort((a,b) => a[0].localeCompare(b[0])).forEach(c => {
            this.sel['country'].append(`<option value="${c[1]}">${c[0]}</option>`);
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
            this.sel['state'].append(`<option data-tokens="${sName}" value="${s}" data-subtext="${sName}">${s}</option>`);
        });
        this.sel['state'].selectpicker("refresh");
    }

    populateStatusOptions() {
        this.sel['status'].html("");
        Status.ALL.forEach(s => {
            var imgHtml = `<img src="${s.getIcon()}" class="${s.value}" title="${s.displayName}"/>`;
            if (s === Status.OPEN) { imgHtml += `<img src="/images/red_dot_limited.svg" class="OPEN" title="Open - limited hours"/><img src="/images/red_expand.svg" class="EXPANDING" title="Expanding"/>`; }
            this.sel['status'].append(`<option data-content='${imgHtml}<span>${s.displayName}</span>' value="${s.value}"></option>`);
        });
        this.sel['status'].selectpicker("refresh");
    }

    populateStallCountOptions() {
        this.sel['stalls'].html('<option value="">Any # Stalls</option>');
        const stallCounts = [4, 8, 12, 16, 20, 30, 40, 50];
        stallCounts.forEach(s => {
            this.sel['stalls'].append(`<option value="${s}">&ge; ${s} stalls</option>`);
        });
        this.sel['stalls'].selectpicker("refresh");
    }

    populatePowerOptions() {
        this.sel['power'].html("<option value=''>Any Power</option>");
        const power = [72, 120, 150, 250];
        power.forEach(p => {
            this.sel['power'].append(`<option value="${p}">&ge; ${p} kW</option>`);
        });
        this.sel['power'].selectpicker("refresh");
    }

    populateStallTypeOptions() {
        const stallType = {
            'v2': 'V2',
            'v3': 'V3',
            'v4': 'V4',
            'urban': 'Urban',
            'accessible': '<img src="/images/accessible.svg"/><span>Accessible</span>',
            'trailerFriendly': '<img src="/images/trailer.svg"/><span>Trailer-friendly</span>'
        };
        this.sel['stallType'].html("");
        for (var s of Object.keys(stallType)) {
            this.sel['stallType'].append(`<option data-content='${stallType[s]}' value="${s}"></option>`);
        }
        this.sel['stallType'].selectpicker("refresh");
    }

    populatePlugTypeOptions() {
        const plugType = {'TPC': 'Tesla', 'NACS': 'NACS', 'CCS1': 'CCS1', 'CCS2': 'CCS2', 'TYPE2': 'Type2', 'GBT': 'GB/T'};
        this.sel['plugType'].html("");
        for (var p of Object.keys(plugType)) {
            this.sel['plugType'].append(`<option data-content='<img src="/images/${p}.svg" title="${plugType[p]}"/><span>${plugType[p]}</span>' value="${p}"></option>`);
        }
        this.sel['plugType'].selectpicker("refresh");
    }

    populateParkingOptions() {
        const parking = Sites.getParking();
        this.sel['parking'].html('<option value="0">(unknown)</option>');
        parking.forEach(p => {
            this.sel['parking'].append(`<option value="${p.parkingId}" data-subtext='${p.description}'>${p.name}</option>`);
        });
        this.sel['parking'].selectpicker("refresh");
    }

    populateOpenToOptions() {
        const openTo = Sites.getOpenTo();
        this.sel['openTo'].html("");
        openTo.forEach(o => {
            this.sel['openTo'].append(`<option value="${o.openToId}" data-subtext='${o.description}'>${o.name}</option>`);
        });
        this.sel['openTo'].selectpicker("refresh");
    }

    populateSolarOptions() {
        this.sel['solar'].html(`
            <option data-content='Any<img src="/images/solar-power-variant.svg" class="faded" title="with or without solar canopy" alt="with or without solar canopy"/>' value=""></option>
            <option data-content='<img src="/images/solar-power-variant.svg"/><span>Solar Canopy: </span>Yes' value="true"></option>
            <option data-content='<img src="/images/no-solar.svg"/><span>Solar Canopy: </span>No' value="false"></option>
        `);
        this.sel['solar'].selectpicker("refresh");
    }

    populateBatteryOptions() {
        this.sel['battery'].html(`
        <option data-content='Any<img src="/images/battery-charging.svg" class="faded" title="with or without battery backup" alt="with or without battery backup"/>' value=""></option>
        <option data-content='<img src="/images/battery-charging.svg"/><span>Battery Backup: </span>Yes' value="true"></option>
        <option data-content='<img src="/images/no-battery.svg"/><span>Battery Backup: </span>No' value="false"></option>
    `);
        this.sel['battery'].selectpicker("refresh");
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

    getStallType() {
        const stallType = this.sel['stallType'].val();
        return stallType === "" ? null : stallType;
    }

    getPlugType() {
        const plugType = this.sel['plugType'].val();
        return plugType === "" ? null : plugType;
    }

    getParking() {
        const parking = this.sel['parking'].val();
        return parking === "" ? null : parking;
    }

    getOpenTo() {
        const openTo = this.sel['openTo'].val();
        return openTo === "" ? null : openTo;
    }

    getSolar() {
        const solar = this.sel['solar'].val();
        return solar === "" ? null : solar;
    }

    getBattery() {
        const battery = this.sel['battery'].val();
        return battery === "" ? null : battery;
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

    setOpenTo(openTo) {
        this.sel['openTo'].selectpicker("val", openTo);
    }

    setStallType(stallType) {
        this.sel['stallType'].selectpicker("val", stallType);
    }

    setPlugType(plugType) {
        this.sel['plugType'].selectpicker("val", plugType);
    }

    setParking(parking) {
        this.sel['parking'].selectpicker("val", parking);
    }

    setSolar(solar) {
        this.sel['solar'].selectpicker("val", solar);
    }

    setBattery(battery) {
        this.sel['battery'].selectpicker("val", battery);
    }

    setSearch(search) {
        this.sel['search'].val(search);
    }

}
