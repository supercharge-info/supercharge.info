import Sites from "./Sites";


export default class SiteIterator {

    constructor() {
        this.predicates = [];
        this.sortFunction = null;
    }

    /* All predicates must return true for a given element to apply. */
    withPredicate(predicateFunction) {
        this.predicates.push(predicateFunction);
        return this;
    }

    withSort(sortFunction) {
        this.sortFunction = sortFunction;
        return this;
    }

    count() {
        const sitesList = Sites.getAll();
        const LENGTH = sitesList.length;
        let i = 0, result = 0;
        for (; i < LENGTH; i++) {
            const site = sitesList[i];
            if (this.predicates.length === 0 || this.predicatesApply(site)) {
                result++;
            }
        }
        return result;
    }

    iterate(applyFunction) {
        const sitesList = Sites.getAll();
        const LENGTH = sitesList.length;
        let i = 0;

        if (this.sortFunction !== null) {
            sitesList.sort(this.sortFunction);
        }

        for (; i < LENGTH; i++) {
            const site = sitesList[i];
            if (this.predicates.length === 0 || this.predicatesApply(site)) {
                applyFunction(site);
            }
        }
    }

    predicatesApply(site) {
        let i = 0;
        for (; i < this.predicates.length; i++) {
            if (!this.predicates[i](site)) {
                return false;
            }
        }
        return true;
    }

    toArray() {
        const superchargers = [];
        this.iterate(function (supercharger) {
            superchargers.push(supercharger);
        });
        return superchargers;
    }


}


