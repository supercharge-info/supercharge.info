import SiteIterator from "./SiteIterator";
import SitePredicates from "./SitePredicates";
import $ from 'jquery';


/**
 *
 * @constructor
 */
const SiteCount = function () {
};

function sort(mapOne, mapTwo) {

    // Sort by number open
    const openCount1 = mapOne.open;
    const openCount2 = mapTwo.open;
    if (openCount1 !== openCount2) {
        return (openCount2 - openCount1);
    }

    // Then by open + construction
    const openAndConstruct1 = openCount1 + mapOne.construction;
    const openAndConstruct2 = openCount2 + mapTwo.construction;
    if (openAndConstruct1 !== openAndConstruct2) {
        return (openAndConstruct2 - openAndConstruct1);
    }

    // Then by open + construction + permit
    const count1 = openAndConstruct1 + mapOne.permit;
    const count2 = openAndConstruct2 + mapTwo.permit;
    if (count1 !== count2) {
        return (count2 - count1);
    }

    // Finally by country name.
    return mapOne.key.localeCompare(mapTwo.key);
}

/**
 * Site count.
 *
 * RETURNED ARRAY:
 *
 *  [
 *   { key: 'USA',    open: 3, construction: 7, permit: 2  },
 *   { key: 'Germany',open: 3, construction: 4, permit: 1   }
 *  ]
 *
 * REFERENCE MAP:
 *
 * { us : arrayRef,
     *   de: arrayRef
     * }
 */
SiteCount.getCountListImpl = function (siteIterator, aggregateKey, sortFunction, countStalls = false) {
    const referenceMap = {},
        returnedArray = [];
    let totalOpen = 0,
        totalConstruction = 0,
        totalPermit = 0,
        totalClosed = 0,
        totalUnknown = 0;

    siteIterator.iterate(function (supercharger) {
            const aggregateKeyValue = supercharger.address[aggregateKey];
            if (!referenceMap[aggregateKeyValue]) {
                const newEntry = {key: aggregateKeyValue, open: 0, construction: 0, permit: 0, closed: 0};
                referenceMap[aggregateKeyValue] = newEntry;
                returnedArray.push(newEntry);
            }
            var incr = countStalls ? supercharger.numStalls : 1;
            if (supercharger.isOpen()) {
                referenceMap[aggregateKeyValue].open += incr;
                totalOpen += incr;
            }
            else if (supercharger.isConstruction()) {
                referenceMap[aggregateKeyValue].construction += incr;
                totalConstruction += incr;
            }
            else if (supercharger.isPermit()) {
                referenceMap[aggregateKeyValue].permit += incr;
                totalPermit += incr;
            }
            else if (supercharger.isClosedTemp() || supercharger.isClosedPerm()) {
                referenceMap[aggregateKeyValue].closed += incr;
                totalClosed += incr;
            } else {
                console.log("invalid status: " + supercharger.status);
                referenceMap[aggregateKeyValue].unknown += incr;
                totalUnknown += incr;
            }
        }
    );

    returnedArray.push({key: 'World', open: totalOpen, construction: totalConstruction, permit: totalPermit, closed: totalClosed, unknown: totalUnknown});
    returnedArray.sort(sortFunction);
    return returnedArray;
};

// - - - - - - By Country

SiteCount.getCountListByCountry = function () {

    const siteIterator = new SiteIterator()
        .withPredicate(SitePredicates.NOT_USER_ADDED)
        .withPredicate(SitePredicates.IS_COUNTED);

    return SiteCount.getCountListImpl(siteIterator, 'country', sort, false);
};

SiteCount.getStallCountListByCountry = function () {

    const siteIterator = new SiteIterator()
        .withPredicate(SitePredicates.NOT_USER_ADDED)
        .withPredicate(SitePredicates.IS_COUNTED);

    return SiteCount.getCountListImpl(siteIterator, 'country', sort, true);
};

SiteCount.getCountMapByCountry = function () {
    const list = SiteCount.getCountListByCountry();
    const map = {};
    $.each(list, function (index, entry) {
        const country = entry.key;
        map[country] = entry;
    });
    return map;
};

// - - - - - - By State

SiteCount.getCountListByState = function (country) {

    const siteIterator = new SiteIterator()
        .withPredicate(SitePredicates.NOT_USER_ADDED)
        .withPredicate(SitePredicates.IS_COUNTED)
        .withPredicate(function (site) {
            return country === site.address.country;
        });

    return SiteCount.getCountListImpl(siteIterator, 'state', sort, false);
};

// - - - - - - By Region

SiteCount.getCountListByRegion = function () {

    const siteIterator = new SiteIterator()
        .withPredicate(SitePredicates.NOT_USER_ADDED)
        .withPredicate(SitePredicates.IS_COUNTED);

    return SiteCount.getCountListImpl(siteIterator, 'region', sort, false);
};

SiteCount.getCountMapByRegion = function () {
    const list = SiteCount.getCountListByRegion();
    const map = {};
    $.each(list, function (index, entry) {
        const region = entry.key;
        map[region] = entry;
    });
    return map;
};

export default SiteCount;


