import Asserts from "../util/Asserts";
import Supercharger from "./Supercharger";
import ServiceURL from "../common/ServiceURL";
import $ from "jquery";

const LIST = [];
const Regions = new Map();
const Countries = new Map();
const CountriesByRegion = new Map();
const StatesByCountry = new Map();
const States = new Set();
const Powers = new Set();
const StallCounts = new Set();

export default class Sites {

    static getById(id) {
        Asserts.isInteger(id, "id must be an integer");
        const list = Sites.getAll();
        for (let i = 0; i < list.length; i++) {
            const supercharger = list[i];
            if (supercharger.id === id) {
                return supercharger;
            }
        }
        return null;
    };

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
    };

    static addCustomSite(displayName, location) {
        const list = Sites.getAll();
        const charger = Supercharger.buildNewCustom(list.length + 25000, displayName, location);
        list.push(charger);
        return charger;
    };

    static getAll() {
        return LIST;
    };
    static getRegions() {
        return Regions;
    };
    static getCountries() {
        return Countries;
    };
    static getCountriesByRegion(regionId) {
        return CountriesByRegion.get(regionId);
    }
    static getStatesByCountry(countryId) {
        return StatesByCountry.get(countryId);
    };
    static getStates() {
        return States;
    }
    static getPowers() {
        return Powers;
    };
    static getStallCounts() {
        return StallCounts;
    };

/*
Regions: Map(name, id)
Countries: Map(name, id)
States: Set
C-by-R: Map(rid, Set(cname))
S-by-C: Map(cid, Set(sname))
*/

    /**
     * Load all sites data.  This method must be called before any other in this class.
     */
    static load() {
        return $.getJSON(ServiceURL.SITES).done(
            (siteList) => {
                siteList.forEach((site) => {
                    var s = Supercharger.fromJSON(site);
                    LIST.push(s);
                    if (!Regions.has(s.address.region)) {
                        Regions.set(s.address.region, s.address.regionId);
                        CountriesByRegion.set(s.address.regionId, new Map());
                    }
                    if (!Countries.has(s.address.country)) {
                        Countries.set(s.address.country, s.address.countryId);
                        StatesByCountry.set(s.address.countryId, new Set());
                    }
                    CountriesByRegion.get(s.address.regionId).set(s.address.country, s.address.countryId);
                    StatesByCountry.get(s.address.countryId).add(s.address.state);
                    States.add(s.address.state);
                    Powers.add(s.powerKilowatt);
                    StallCounts.add(s.numStalls);
                });
            }
        );
    };

}
