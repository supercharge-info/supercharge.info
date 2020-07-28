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

    HAS_CIRCLE: (site) => Objects.isNotNullOrUndef(site.circle),

    HAS_NO_CIRCLE: (site) => Objects.isNullOrUndef(site.circle),

    HAS_SHOWN_UNPINNED_INFO_WINDOW: (site) =>
        site.marker &&
        site.marker.infoWindow &&
        site.marker.infoWindow.isShown() &&
        !site.marker.infoWindow.isPinned(),

    buildInViewPredicate: function (bounds) {
        return (site) => bounds.contains(site.location);
    },

    buildRegionPredicate: (regionId) => {
        // Use lazy == to match strings with integers
        return (site) => regionId === null || site.address.regionId == regionId;
    },

    buildCountryPredicate: (countryId) => {
        // Use lazy == to match strings with integers
        return (site) => countryId === null || site.address.countryId == countryId;
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
