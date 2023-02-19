import $ from 'jquery';
//import countryClient from './CountryClient';
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

        this.changeTypeSelect.change($.proxy(this.handleChangeTypeChange, this));
        this.regionSelect.change($.proxy(this.handleRegionChange, this));
        this.countrySelect.change($.proxy(this.handleCountryChange, this));
        this.stateSelect.change($.proxy(this.handleStateChange, this));
        this.statusSelect.change($.proxy(this.handleStatusChange, this));
        this.stallsSelect.change($.proxy(this.handleStallsChange, this));
        this.powerSelect.change($.proxy(this.handlePowerChange, this));
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
    init(initialRegionId, initialCountryId) {
        this.populateChangeTypeOptions();
        this.populateRegionOptions();
        this.setRegionId(initialRegionId);
        this.populateCountryOptions();
        this.setCountryId(initialCountryId);
        this.populateStateOptions();
        this.populateStatusOptions();
        this.populateStallCountOptions();
        this.populatePowerOptions();
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
        this.changeTypeSelect.append("<option value=''>-- Any Change --</option>");
        this.changeTypeSelect.append("<option value='ADD'>Add</option>");
        this.changeTypeSelect.append("<option value='UPDATE'>Update</option>");
    }

    populateRegionOptions() {
        this.regionSelect.append("<option value=''>-- Any Region --</option>");
        var regions = [...Sites.getRegions()].sort((a,b) => a[0].localeCompare(b[0]));
        regions.forEach(r => {
            this.regionSelect.append(`<option value='${r[1]}'>${r[0]}</option>`);
        });
    };

    populateCountryOptions() {
        var newRegionId = this.getRegionId();
        var countries = null;
        if (newRegionId !== null) {
            countries = [...Sites.getCountriesByRegion(newRegionId)];
        } else {
            countries = [...Sites.getCountries()];
        }

        this.countrySelect.html("");
        this.countrySelect.append("<option value=''>-- Any Country --</option>");
        countries.sort((a,b) => a[0].localeCompare(b[0])).forEach(c => {
            this.countrySelect.append(`<option value='${c[1]}'>${c[0]}</option>`);
        });
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
        this.stateSelect.html("");
        this.stateSelect.append(`<option value=''>${states.length === 0 ? "n/a" : "-- Any State --"}</option>`);
        states.forEach(s => {
            this.stateSelect.append(`<option value='${s}'>${s}</option>`);
        });
    };

    populateStatusOptions() {
        this.statusSelect.append("<option value=''>-- Any Status --</option>");
        Status.ALL.forEach(s => {
            this.statusSelect.append(`<option value='${s.value}'>${s.displayName}</option>`);
        });
    };

    populateStallCountOptions() {
        this.stallsSelect.append("<option value=''>-- No Min. Stalls --</option>");
        var stallCounts = new Int16Array([...Sites.getStallCounts()]).sort();
        stallCounts.forEach(s => {
            this.stallsSelect.append(`<option value='${s}'>&ge; ${s} stalls</option>`);
        });
    };

    populatePowerOptions() {
        this.powerSelect.append("<option value=''>-- No Min. Power --</option>");
        var power = new Int16Array([...Sites.getPowers()]).sort();
        $.each(power, (index, p) => {
            this.powerSelect.append(`<option value='${p}'>&ge; ${p} kW</option>`);
        });

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