import Asserts from "../util/Asserts";
import Supercharger from "./Supercharger";
import ServiceURL from "../common/ServiceURL";
import $ from "jquery";


const LIST = [];

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

    /**
     * Load all sites data.  This method must be called before any other in this class.
     */
    static load() {
        return $.getJSON(ServiceURL.SITES).done(
            (siteList) => {
                siteList.forEach((site) => {
                    LIST.push(Supercharger.fromJSON(site));
                });
            }
        );

    };


}









