import $ from 'jquery';
import 'bootstrap-select';
import Sites from '../site/Sites';
import Status from '../site/SiteStatus';

export default class SiteFilterControl {

    /**
     * Constructor just does basic DOM reference and event handler setup.
     *
     * @param controlParentDiv
     * @param changeCallback
     */
    constructor(controlParentDiv, changeCallback, includeCustomStatus) {
        this.changeCallback = changeCallback;
        this.includeCustomStatus = includeCustomStatus || false;

        this.changeTypeSelect = controlParentDiv.find(".changetype-select");
        this.regionSelect = controlParentDiv.find(".region-select");
        this.countrySelect = controlParentDiv.find(".country-select");
        this.stateSelect = controlParentDiv.find(".state-select");
        this.statusSelect = controlParentDiv.find(".status-select");
        this.stallsSelect = controlParentDiv.find(".stalls-select");
        this.powerSelect = controlParentDiv.find(".power-select");
        this.otherEVsSelect = controlParentDiv.find(".other-evs-select");
        this.resetButton = controlParentDiv.find(".reset");

        this.changeTypeSelect.change(this.changeCallback.bind(this));
        this.regionSelect.change(this.handleRegionChange.bind(this));
        this.countrySelect.change(this.handleCountryChange.bind(this));
        this.stateSelect.change(this.changeCallback.bind(this));
        this.statusSelect.change(this.changeCallback.bind(this));
        this.stallsSelect.change(this.changeCallback.bind(this));
        this.powerSelect.change(this.changeCallback.bind(this));
        this.otherEVsSelect.change(this.changeCallback.bind(this));
        this.resetButton.on("click", this.handleFilterReset.bind(this));
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
     * so it return a promise.  Constructor cannot return promise, thus this must exist outside
     * of the constructor.
     */
    init(userConfig) {
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
    };

    /**
     * When a user selects REGION then:
     *  (1) De-select country and state, if any.
     *  (2) Update the list of possible countries, possibly setting it to all countries if they have de-selected a region.
     *  (3) Invoke handleChangeFunction.
     */
    handleRegionChange() {
        this.countrySelect.selectpicker("val", "");
        this.stateSelect.selectpicker("val", "");
        this.populateCountryOptions();
        this.populateStateOptions();
        this.changeCallback();
    };

    /**
     * When a user selects COUNTRY then:
     *  (1) De-select state, if any.
     *  (2) Update the list of possible states, possibly setting it to all states if they have de-selected a country.
     *  (1) Invoke handleChangeFunction.
     */
    handleCountryChange() {
        this.stateSelect.selectpicker("val", "");
        this.populateStateOptions();
        this.changeCallback();
    };

    handleFilterReset() {
        this.init(null);
        this.changeCallback();
    };

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // UI update methods
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    populateChangeTypeOptions() {
        this.changeTypeSelect.html("<option value=''>Any Change</option>");
        this.changeTypeSelect.append("<option value='ADD'>Add</option>");
        this.changeTypeSelect.append("<option value='UPDATE'>Update</option>");
        this.changeTypeSelect.selectpicker("refresh");
    }

    populateRegionOptions() {
        this.regionSelect.html("<option value=''>Any Region</option>");
        var regions = [...Sites.getRegions()].sort((a,b) => a[0].localeCompare(b[0]));
        regions.forEach(r => {
            this.regionSelect.append(`<option value='${r[1]}'>${r[0]}</option>`);
        });
        this.regionSelect.selectpicker("refresh");
    };

    populateCountryOptions() {
        var newRegionId = this.getRegionId();
        var countries = null;
        if (newRegionId !== null) {
            countries = [...Sites.getCountriesByRegion(newRegionId)];
        } else {
            countries = [...Sites.getCountries()];
        }

        this.countrySelect.html("<option value=''>Any Country</option>");
        countries.sort((a,b) => a[0].localeCompare(b[0])).forEach(c => {
            this.countrySelect.append(`<option value='${c[1]}'>${c[0]}</option>`);
        });
        this.countrySelect.selectpicker("refresh");
    };

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
        this.stateSelect.html("");
        states.forEach(s => {
            var sName = Sites.StateAbbreviations[s] || "";
            this.stateSelect.append(`<option data-tokens='${sName}' value='${s}' data-subtext="${sName}">${s}</option>`);
        });
        this.stateSelect.selectpicker("refresh");
    };

    populateStatusOptions() {
        this.statusSelect.html("");
        Status.ALL.forEach(s => {
            var imgHtml = `<img src='${s.getIcon()}' class='${s.value}' title='${s.displayName}'/>`;
            if (s === Status.OPEN) { imgHtml += `<img src='/images/green_dot_limited.svg' class='OPEN' title='Open - limited hours'/>`; }
            this.statusSelect.append(`<option data-content="${imgHtml}<span>${s.displayName}</span>" value='${s.value}'></option>`);
        });
        /*
        if (this.includeCustomStatus) {
            var imgHtml = `<img src='${Status.USER_ADDED.getIcon()}'/>`;
            this.statusSelect.append(`<option data-content="${imgHtml}<span>${Status.USER_ADDED.displayName}</span>" value='${Status.USER_ADDED.value}'></option>`);
        }
        */
        this.statusSelect.selectpicker("refresh");
    };

    populateStallCountOptions() {
        this.stallsSelect.html("<option value=''>No Min. Stalls</option>");
        var stallCounts = new Int16Array([4, 8, 12, 16, 20, 30, 40, 50]);
        stallCounts.forEach(s => {
            this.stallsSelect.append(`<option value='${s}'>&ge; ${s} stalls</option>`);
        });
        this.stallsSelect.selectpicker("refresh");
    };

    populatePowerOptions() {
        this.powerSelect.html("<option value=''>No Min. Power</option>");
        var power = new Int16Array([72, 120, 150, 250]);
        $.each(power, (index, p) => {
            this.powerSelect.append(`<option value='${p}'>&ge; ${p} kW</option>`);
        });
        this.powerSelect.selectpicker("refresh");
    };

    populateOtherEVsOptions() {
        this.otherEVsSelect.html("<option value=''>No Vehicle Filter</option>");
        this.otherEVsSelect.append(`<option data-content="Teslas Only" value='false'></option>`);
        this.otherEVsSelect.append(`<option data-content="Teslas + Other EVs" value='true'></option>`);
        this.otherEVsSelect.selectpicker("refresh");
    };

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // getters/setters
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    getChangeType() {
        const changeType = this.changeTypeSelect.val();
        return changeType === "" ? null : changeType;
    };

    getCountryId() {
        const id = parseInt(this.countrySelect.val());
        return isNaN(id) ? null : id;
    };

    getRegionId() {
        const id = parseInt(this.regionSelect.val());
        return isNaN(id) ? null : id;
    };

    getState() {
        const state = this.stateSelect.val();
        return state === "" ? null : state;
    };

    getStatus() {
        const status = this.statusSelect.val();
        return status === "" ? null : status;
    };

    getStalls() {
        const stalls = this.stallsSelect.val();
        return isNaN(stalls) ? null : stalls;
    };

    getPower() {
        const power = this.powerSelect.val();
        return isNaN(power) ? null : power;
    };

    getOtherEVs() {
        const otherEVs = this.otherEVsSelect.val();
        return otherEVs === "" ? null : otherEVs;
    };

    setChangeType(changeType) {
        this.changeTypeSelect.selectpicker("val", changeType);
    };

    setCountryId(countryId) {
        this.countrySelect.selectpicker("val", countryId);
    };

    setRegionId(regionId) {
        this.regionSelect.selectpicker("val", regionId);
    };

    setState(state) {
        this.stateSelect.selectpicker("val", state);
    };

    setStatus(status) {
        this.statusSelect.selectpicker("val", status);
    };

    setStalls(stalls) {
        this.stallsSelect.selectpicker("val", stalls);
    };

    setPower(power) {
        this.powerSelect.selectpicker("val", power);
    };

    setOtherEVs(otherEVs) {
        this.otherEVsSelect.selectpicker("val", otherEVs);
    };

}
