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
    const statusSort = siteOne.status.sort - siteTwo.status.sort;
    if (statusSort === 0) {
        const daysSort = siteOne.statusDays - siteTwo.statusDays;
        if (daysSort === 0) {
            return siteTwo.dateOpened - siteOne.dateOpened;
        }
        return daysSort;
    }
    return statusSort;
};

SiteSorting.BY_STATUS_DAYS_DESC = function (siteOne, siteTwo) {
    const statusSort = siteOne.status.sort - siteTwo.status.sort;
    if (statusSort === 0) {
        const daysSort = siteTwo.statusDays - siteOne.statusDays;
        if (daysSort === 0) {
            return siteOne.dateOpened - siteTwo.dateOpened;
        }
        return daysSort;
    }
    return statusSort;
};
export default SiteSorting;

