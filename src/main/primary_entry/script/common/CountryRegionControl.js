import $ from 'jquery';
import countryClient from './CountryClient'

export default class CountryRegionControl {

    /**
     * Constructor just does basic DOM reference and event handler setup.
     *
     * @param controlParentDiv
     * @param changeCallback
     */
    constructor(controlParentDiv, changeCallback) {
        this.changeCallback = changeCallback;

        this.regionSelect = controlParentDiv.find(".region-select");
        this.countrySelect = controlParentDiv.find(".country-select");

        this.countrySelect.change($.proxy(this.handleCountryChange, this));
        this.regionSelect.change($.proxy(this.handleRegionChange, this));
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
        const t = this;
        return countryClient.load().done(() => {
            t.populateRegionOptions();
            t.setRegionId(initialRegionId);
            t.populateCountryOptions();
            t.setCountryId(initialCountryId);
        });
    };

    /**
     * When a user selects REGION then:
     *  (1) De-select country, if any.
     *  (2) update the list of possible countries, possibly setting it to all countries if they have de-selected a region.
     *  (3) Invoke handleChangeFunction.
     */
    handleRegionChange() {
        this.countrySelect.val("");
        this.populateCountryOptions();
        // careful, only call listener after resetting selected country.
        this.changeCallback("region", this.getRegionId());
    };

    /**
     * When a user selects COUNTRY then:
     *  (1) Invoke handleChangeFunction.
     */
    handleCountryChange() {
        this.changeCallback("country", this.getCountryId());
    };

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // UI update methods
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    populateCountryOptions() {
        const newRegionId = this.getRegionId();
        if (newRegionId !== null) {
            const countryList = countryClient.getCountriesForRegion(newRegionId);
            this._populateCountryOptions(countryList);
        } else {
            this._populateCountryOptions(countryClient.getCountries());
        }
    }
    
    _populateCountryOptions(countries) {
        this.countrySelect.html("");
        this.countrySelect.append("<option value=''>-- Any Country --</option>");
        const countrySelect = this.countrySelect;
        $.each(countries, function (index, country) {
            countrySelect.append(`<option value='${country.id}'>${country.name}</option>`);
        });
    };

    populateRegionOptions() {
        const regionSelect = this.regionSelect;
        this.regionSelect.append("<option value=''>-- Any Region --</option>");
        $.each(countryClient.getRegions(), (index, r) => {
            regionSelect.append(`<option value='${r.regionId}'>${r.region}</option>`);
        });
    };

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // getters/setters
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    getCountryId() {
        const id = parseInt(this.countrySelect.val());
        return isNaN(id) ? null : id;
    };

    getRegionId() {
        const id = parseInt(this.regionSelect.val());
        return isNaN(id) ? null : id;
    };

    setCountryId(countryId) {
        this.countrySelect.val(countryId);
    };

    setRegionId(regionId) {
        this.regionSelect.val(regionId);
    };

}