import $ from 'jquery';
import 'bootstrap-select';
//import 'pretty-dropdowns';
//import 'select2';
//import SlimSelect from 'slim-select';
import Sites from '../site/Sites';
import Status from '../site/SiteStatus';

export default class SiteFilterControl {

    /**
     * Constructor just does basic DOM reference and event handler setup.
     *
     * @param controlParentDiv
     * @param changeCallback
     */
    constructor(controlParentDiv, changeCallback) {
        this.changeCallback = changeCallback;

        this.changeTypeSelect = controlParentDiv.find(".changetype-select");
        this.regionSelect = controlParentDiv.find(".region-select");
        this.countrySelect = controlParentDiv.find(".country-select");
        this.stateSelect = controlParentDiv.find(".state-select");
        this.statusSelect = controlParentDiv.find(".status-select");
        this.stallsSelect = controlParentDiv.find(".stalls-select");
        this.powerSelect = controlParentDiv.find(".power-select");

        this.changeTypeSelect.change(this.handleChangeTypeChange.bind(this));
        this.regionSelect.change(this.handleRegionChange.bind(this));
        this.countrySelect.change(this.handleCountryChange.bind(this));
        this.stateSelect.change(this.handleStateChange.bind(this));
        this.statusSelect.change(this.handleStatusChange.bind(this));
        this.stallsSelect.change(this.handleStallsChange.bind(this));
        this.powerSelect.change(this.handlePowerChange.bind(this));
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
        this.setChangeType(userConfig.filter.changeType);

        this.populateRegionOptions();
        this.setRegionId(userConfig.filter.regionId);

        this.populateCountryOptions();
        this.setCountryId(userConfig.filter.countryId);

        this.populateStateOptions();
        this.setState(userConfig.filter.state);

        this.populateStatusOptions();
        this.setStatus(userConfig.filter.status);

        this.populateStallCountOptions();
        this.setStalls(userConfig.filter.stalls);

        this.populatePowerOptions();
        this.setPower(userConfig.filter.power);
    };

    handleChangeTypeChange() {
        this.changeCallback("changeType", this.getChangeType());
    };

    /**
     * When a user selects REGION then:
     *  (1) De-select country and state, if any.
     *  (2) Update the list of possible countries, possibly setting it to all countries if they have de-selected a region.
     *  (3) Invoke handleChangeFunction.
     */
    handleRegionChange() {
        this.countrySelect.val("");
        this.stateSelect.val("");
        this.populateCountryOptions();
        this.populateStateOptions();
        this.changeCallback("region", this.getRegionId());
    };

    /**
     * When a user selects COUNTRY then:
     *  (1) De-select state, if any.
     *  (2) Update the list of possible states, possibly setting it to all states if they have de-selected a country.
     *  (1) Invoke handleChangeFunction.
     */
    handleCountryChange() {
        this.stateSelect.val("");
        this.populateStateOptions();
        this.changeCallback("country", this.getCountryId());
    };

    handleStateChange() {
        this.changeCallback("state", this.getState());
    };

    handleStatusChange() {
        this.changeCallback("status", this.getStatus());
    };

    handleStallsChange() {
        this.changeCallback("stalls", this.getStalls());
    };

    handlePowerChange() {
        this.changeCallback("power", this.getPower());
    };

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // UI update methods
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    populateChangeTypeOptions() {
        this.changeTypeSelect.html("<option value=''>-- Any Change --</option>");
        this.changeTypeSelect.append("<option value='ADD'>Add</option>");
        this.changeTypeSelect.append("<option value='UPDATE'>Update</option>");
        this.changeTypeSelect.selectpicker("refresh");
    }

    populateRegionOptions() {
        this.regionSelect.html("<option value=''>-- Any Region --</option>");
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

        this.countrySelect.html("<option value=''>-- Any Country --</option>");
        countries.sort((a,b) => a[0].localeCompare(b[0])).forEach(c => {
            this.countrySelect.append(`<option value='${c[1]}'>${c[0]}</option>`);
        });
        this.countrySelect.selectpicker("refresh");
    };

    populateStateOptions() {
        var newCountryId = this.getCountryId();
        var states = null;
        if (newCountryId !== null) {
            states = [...Sites.getStatesByCountry(newCountryId)];
        } else {
            states = [...Sites.getStates()];
        }
        states = states.filter(s => s !== null).sort();
        this.stateSelect.html(`<option value=''>${states.length === 0 ? "n/a" : "-- Any State --"}</option>`);
        states.forEach(s => {
            this.stateSelect.append(`<option value='${s}'>${s}</option>`);
        });
        this.stateSelect.selectpicker("refresh");
    };

    populateStatusOptions() {
        //this.statusSelect.html("<option value=''>-- Any Status --</option>");
        Status.ALL.forEach(s => {
            var imgHtml = `<img src='${s.getIcon()}'/>`;
            this.statusSelect.append(`<option data-content="${imgHtml}<span>${s.displayName}</span>" value='${s.value}'></option>`)
        });
        var imgHtml = `<img src='${Status.USER_ADDED.getIcon()}'/>`;
        this.statusSelect.append(`<option data-content="${imgHtml}<span>${Status.USER_ADDED.displayName}</span>" value='${Status.USER_ADDED.value}'></option>`);
        this.statusSelect.selectpicker("refresh");
    };

    /*
    formatStatus(s) {
        if (!s.id) return s.text;
        var status = Status.fromString(s.id);
        return $(`<span><img src="${status.getIcon()}" class="status-icon"/> ${s.text}</span>`);
    }
    */

    populateStallCountOptions() {
        this.stallsSelect.html("<option value=''>-- No Min. Stalls --</option>");
        var stallCounts = new Int16Array([...Sites.getStallCounts()]).sort();
        stallCounts.forEach(s => {
            this.stallsSelect.append(`<option value='${s}'>&ge; ${s} stalls</option>`);
        });
        this.stallsSelect.selectpicker("refresh");
    };

    populatePowerOptions() {
        this.powerSelect.html("<option value=''>-- No Min. Power --</option>");
        var power = new Int16Array([...Sites.getPowers()]).sort();
        $.each(power, (index, p) => {
            this.powerSelect.append(`<option value='${p}'>&ge; ${p} kW</option>`);
        });
        this.powerSelect.selectpicker("refresh");
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

    setChangeType(changeType) {
        this.changeTypeSelect.val(changeType);
    };

    setCountryId(countryId) {
        this.countrySelect.val(countryId);
    };

    setRegionId(regionId) {
        this.regionSelect.val(regionId);
    };

    setState(state) {
        this.stateSelect.val(state);
    };

    setStatus(status) {
        this.statusSelect.val(status);
    };

    setStalls(stalls) {
        this.stallsSelect.val(stalls);
    };

    setPower(power) {
        this.powerSelect.val(power);
    };

}