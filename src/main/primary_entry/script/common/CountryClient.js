import ServiceURL from './ServiceURL';
import $ from "jquery";

/**
 * Client for the /country service.  Happens to return country AND region info.
 *
 * {
 * "id":116,
 * "name":"Australia",
 * "code":"AU",
 * "region":"Asia Pacific",
 * "regionId":102
 * }
 */
class CountryClient {

    constructor() {
        /* all countries */
        this.countries = [];

        /* map of regionId to array of country objects for that region */
        this.regionMap = {};

        /* one (random) distinct country for each region, sorted by name ascending */
        this.regions = [];

    }

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // getters
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    /* Countries sorted  by name ascending. */
    getCountries() {
        return this.countries;
    }

    /* Regions sorted  by name ascending. */
    getRegions() {
        return this.regions;
    }

    getCountriesForRegion(regionId) {
        return this.regionMap[regionId];
    }

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // getters
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    /* Returns a promise */
    load() {
        if (this.countries.length === 0) {
            return $.getJSON(ServiceURL.COUNTRY).done($.proxy(this.countriesServiceCallback, this))
        }
        else {
            return $.when();
        }
    }

    countriesServiceCallback(allCountries) {
        this.countries = allCountries;

        const regionMap = this.regionMap;
        const allRegionList = this.regions;

        $.each(allCountries, (index, country) => {
            let countryList = regionMap[country.regionId];
            if (!countryList) {
                countryList = [];
                regionMap[country.regionId] = countryList;
                allRegionList.push(country);
            }
            countryList.push(country);
        });

        // sort by region ascending
        this.regions.sort((a, b) => {
            return a.region > b.region
        });
    };

}

export default new CountryClient()