import Objects from "../util/Objects";


const SiteSorting = {};

/**
 * @return {number}
 */
SiteSorting.BY_OPENED_DATE = function (siteOne, siteTwo) {
    const oneNull = Objects.isNullOrUndef(siteOne.dateOpened);
    const twoNull = Objects.isNullOrUndef(siteTwo.dateOpened);
    if (oneNull && twoNull) {
        return 0;
    }
    if (oneNull) {
        return -1;
    }
    if (twoNull) {
        return 1;
    }
    if (siteOne.dateOpened < siteTwo.dateOpened) {
        return -1;
    }
    if (siteOne.dateOpened > siteTwo.dateOpened) {
        return 1;
    }
    return 0;
};

/**
 * @return {number}
 */
SiteSorting.BY_OPENED_DATE_DESC = function (siteOne, siteTwo) {
    return -1 * SiteSorting.BY_OPENED_DATE(siteOne, siteTwo);
};

/**
 * @return {number}
 */
SiteSorting.BY_STATUS_DAYS = function (siteOne, siteTwo) {
    const statusSortOne = siteOne.status.sort;
    const statusSortTwo = siteTwo.status.sort;
    if (statusSortOne === statusSortTwo) {
        return siteOne.statusDays - siteTwo.statusDays;
    }
    return statusSortOne - statusSortTwo;
};

export default SiteSorting;

