import Asserts from "../util/Asserts";
import Supercharger from "./Supercharger";
import ServiceURL from "../common/ServiceURL";
import $ from "jquery";

const LIST = [];
const Regions = new Map();
const Countries = new Map();
const CountriesByRegion = new Map();
const StatesByRegion = new Map();
const StatesByCountry = new Map();
const States = new Set();
const Parking = new Map();
var loaded = Date.now();

export default class Sites {

    static loading = true;
    static reloadCallback = null;

    static getById(id) {
        Asserts.isInteger(id, "id must be an integer");
        const list = Sites.getAll();
        for (let i = 0; i < list.length; i++) {
            const supercharger = list[i];
            if (supercharger.id === id) {
                return supercharger;
            }
        }
        // force a reload check if we can't find a site by its id, as that likely means data in the browser is stale
        Sites.checkReload();
        return null;
    }

    static removeById(id) {
        Asserts.isInteger(id, "id must be an integer");
        const list = Sites.getAll();
        for (let index = 0; index < list.length; index++) {
            const supercharger = list[index];
            if (supercharger.id === id) {
                list.splice(index, 1);
                break;
            }
        }
    }

    static addCustomSite(displayName, location) {
        const list = Sites.getAll();
        const charger = Supercharger.buildNewCustom(list.length + 25000, displayName, location);
        list.push(charger);
        return charger;
    }

    static getAll() {
        return LIST;
    }
    static getRegions() {
        return Regions;
    }
    static getCountries() {
        return Countries;
    }
    static getCountriesByRegion(regionId) {
        return CountriesByRegion.get(regionId);
    }
    static getStatesByRegion(regionId) {
        return StatesByRegion.get(regionId);
    }
    static getStatesByCountry(countryId) {
        return StatesByCountry.get(countryId);
    }
    static getStates() {
        return States;
    }
    static getParking() {
        return Parking;
    }

/*
Regions: Map(name, id)
Countries: Map(name, id)
States: Set
C-by-R: Map(rid, Map(cname, cid))
S-br-R: Map(rid, Set(sname))
S-by-C: Map(cid, Set(sname))
*/

    /**
     * Load all sites data.  This method must be called before any other in this class.
     */
    static load() {
        Sites.loading = true;
        $.getJSON(ServiceURL.PARKING).done(
            (parkingList) => { parkingList.forEach((p) => Parking.set(p.parkingId, p)); }
        );

        return $.getJSON(ServiceURL.SITES).done(
            (siteList) => {
                siteList.forEach((site) => {
                    var s = Supercharger.fromJSON(site);
                    LIST.push(s);
                    if (!Regions.has(s.address.region)) {
                        Regions.set(s.address.region, s.address.regionId);
                        CountriesByRegion.set(s.address.regionId, new Map());
                        StatesByRegion.set(s.address.regionId, new Set());
                    }
                    if (!Countries.has(s.address.country)) {
                        Countries.set(s.address.country, s.address.countryId);
                        StatesByCountry.set(s.address.countryId, new Set());
                    }
                    CountriesByRegion.get(s.address.regionId).set(s.address.country, s.address.countryId);
                    StatesByRegion.get(s.address.regionId).add(s.address.state);
                    StatesByCountry.get(s.address.countryId).add(s.address.state);
                    States.add(s.address.state);
                });
                Sites.loading = false;
            }
        );
    }

    static checkReload() {
        console.log(`checkReload loading=${Sites.loading}`);
        if (Sites.loading) return false;
        const prevLoaded = loaded;
        return $.getJSON(ServiceURL.DB_INFO).done(
            (dbInfo) => {
                console.log(`checkReload loaded=${loaded} lastModified=${dbInfo.lastModified} reload=${loaded <= dbInfo.lastModified}`);
                if (!dbInfo || loaded > dbInfo.lastModified) return;
                Sites.loading = true;
                loaded = Date.now();
                console.log(`reloading all sites @ ${loaded}`);
                LIST.length = 0;
                Regions.clear();
                Countries.clear();
                CountriesByRegion.clear();
                StatesByRegion.clear();
                StatesByCountry.clear();
                States.clear();
                Sites.load().then(() => {
                    // to avoid callback loops, don't call reloadCallback more than once per 10 seconds
                    console.log(`reloaded ${LIST.length} sites t=${Date.now() - loaded} p=${loaded - prevLoaded}`);
                    console.log(Sites.reloadCallback);
                    if (Sites.reloadCallback && loaded - prevLoaded > 10000) Sites.reloadCallback();
                });
            }
        );
    }

    static StateAbbreviations = {
        "AB": "Alberta",
        "ACT": "Australian Capital Territory",
        "AK": "Alaska",
        "AL": "Alabama",
        "AR": "Arkansas",
        "AS": "American Samoa",
        "AZ": "Arizona",
        "BC": "British Columbia",
        "CA": "California",
        "CO": "Colorado",
        "CT": "Connecticut",
        "DC": "District Of Columbia",
        "DE": "Delaware",
        "FL": "Florida",
        "FM": "Federated States Of Micronesia",
        "GA": "Georgia",
        "GU": "Guam",
        "HI": "Hawaii",
        "IA": "Iowa",
        "ID": "Idaho",
        "IL": "Illinois",
        "IN": "Indiana",
        "JBT": "Jervis Bay Territory",
        "KS": "Kansas",
        "KY": "Kentucky",
        "LA": "Louisiana",
        "MA": "Massachusetts",
        "MB": "Manitoba",
        "MD": "Maryland",
        "ME": "Maine",
        "MH": "Marshall Islands",
        "MI": "Michigan",
        "MN": "Minnesota",
        "MO": "Missouri",
        "MP": "Northern Mariana Islands",
        "MS": "Mississippi",
        "MT": "Montana",
        "NB": "New Brunswick",
        "NC": "North Carolina",
        "ND": "North Dakota",
        "NE": "Nebraska",
        "NH": "New Hampshire",
        "NJ": "New Jersey",
        "NL": "Newfoundland and Labrador",
        "NM": "New Mexico",
        "NS": "Nova Scotia",
        "NSW": "New South Wales",
        "NT": "Northern Territory | Northwest Territories",
        "NU": "Nunavut",
        "NV": "Nevada",
        "NY": "New York",
        "OH": "Ohio",
        "OK": "Oklahoma",
        "ON": "Ontario",
        "OR": "Oregon",
        "PA": "Pennsylvania",
        "PR": "Puerto Rico",
        "PW": "Palau",
        "QC": "Quebec",
        "Qld": "Queensland",
        "RI": "Rhode Island",
        "SA": "South Australia",
        "SC": "South Carolina",
        "SD": "South Dakota",
        "SK": "Saskatchewan",
        "Tas": "Tasmania",
        "TN": "Tennessee",
        "TX": "Texas",
        "UT": "Utah",
        "VA": "Virginia",
        "VI": "Virgin Islands",
        "Vic": "Victoria",
        "VT": "Vermont",
        "WA": "Washington | Western Australia",
        "WI": "Wisconsin",
        "WV": "West Virginia",
        "WY": "Wyoming",
        "YT": "Yukon"
    };
}
