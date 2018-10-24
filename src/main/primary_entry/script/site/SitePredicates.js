import Objects from "../util/Objects";


const SitePredicates = {

    IS_OPEN: (site) => site.isOpen(),

    IS_CONSTRUCTION: (site) => site.isConstruction(),

    IS_PERMIT: (site) =>  site.isPermit(),

    IS_COUNTED: (site) => site.count,

    NOT_USER_ADDED: (site) => !site.isUserAdded(),

    USER_ADDED: (site) => site.isUserAdded(),

    IS_OPEN_AND_COUNTED: (site) => SitePredicates.IS_OPEN(site) && SitePredicates.IS_COUNTED(site),

    HAS_NO_MARKER: (site) => Objects.isNullOrUndef(site.marker),

    HAS_MARKER: (site) => Objects.isNotNullOrUndef(site.marker),

    buildInViewPredicate: function (bounds) {
        return (site) => {
            return bounds.contains(site.location);
        };
    },

    buildRegionPredicate: (regionId) => {
        return (site) => regionId === null || site.address.regionId === regionId;
    },

    buildCountryPredicate: (countryId) => {
        return (site) => countryId === null || site.address.countryId === countryId;
    },

    not: function (predicate) {
        return (site) => {
            return !predicate(site);
        };
    },

    or: function (predicate1, predicate2) {
        return (site) => {
            return predicate1(site) || predicate2(site);
        };
    }

};


export default SitePredicates;
