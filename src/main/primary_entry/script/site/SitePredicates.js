import Objects from "../util/Objects";


const SitePredicates = {

    IS_OPEN: (site) => site.isOpen(),

    IS_EXPANDING: (site) => site.isExpanding(),

    IS_CONSTRUCTION: (site) => site.isConstruction(),

    IS_PERMIT: (site) =>  site.isPermit(),

    IS_PLAN: (site) =>  site.isPlan(),

    IS_VOTING: (site) =>  site.isVoting(),

    IS_COUNTED: (site) => site.count,

    NOT_USER_ADDED: (site) => !site.isUserAdded(),

    USER_ADDED: (site) => site.isUserAdded(),

    IS_OPEN_AND_COUNTED: (site) => (SitePredicates.IS_OPEN(site) || SitePredicates.IS_EXPANDING(site)) && SitePredicates.IS_COUNTED(site),

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

    buildUserFilterPredicate: function (filter) {
        return (site) => {
            if (site.isUserAdded()) return true; // short circuit to always show user-added markers
            if (filter.regionId !== null && site.address.regionId !== filter.regionId) return false;
            if (filter.countryId !== null && site.address.countryId !== filter.countryId) return false;
            if (filter.state !== null && filter.state.length > 0 && filter.state.indexOf(site.address.state) < 0) return false;
            if (filter.stalls !== null && site.numStalls < filter.stalls) return false;
            if (filter.power !== null && site.powerKilowatt < filter.power) return false;
            if (filter.status !== null && filter.status.length > 0 && filter.status.indexOf(site.status.value) < 0) return false;
            if (filter.otherEVs !== null && String(site.otherEVs) !== filter.otherEVs) return false;
            if ((filter.search) !== null && !site.matches(filter.search, false)) return false;
            if ((filter.status === null || filter.status.length === 0) && site.isClosedPerm()) return false; // for maps only, exclude Permanently Closed sites if "Any Status" is chosen in filters
            return true;
        };
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
