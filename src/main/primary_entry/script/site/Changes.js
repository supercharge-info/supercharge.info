import Sites from "./Sites";
import ServiceURL from "../common/ServiceURL";
import $ from "jquery";

const SITE_CHANGES = {};

export default class Changes {

    static addToSites() {
        Object.entries(SITE_CHANGES).forEach((changeHistory) => {
            if(changeHistory[1][0].changeType != 'ADD') {
                console.log(changeHistory[0]);
            }
            Sites.getById(Number(changeHistory[0])).history = changeHistory[1]
        });
    }

    static load() {
        return $.getJSON(ServiceURL.CHANGES).done(
            (changeList) => {
                changeList.forEach((change) => {
                    if (!(change.siteId in SITE_CHANGES)) {
                        SITE_CHANGES[change.siteId] = [];
                    }
                    let changeHistory = SITE_CHANGES[change.siteId];
                    let replaceEntries = 0;
                    for (var index = 0; index < changeHistory.length; index++) {
                        if (new Date(changeHistory[index].date) > new Date(change.date)) {
                            // Found older item; we'll insert change entry before it
                            break;
                        } else if (changeHistory[index].date == change.date) {
                            // Found item with same date
                            if (changeHistory[index].id < change.id) {
                                // Our change ID is newer so we'll replace it
                                replaceEntries = 1;
                                break;
                            } else {
                                // Ignore our entry
                                return;
                            }
                        }
                    }
                    changeHistory.splice(index, replaceEntries, change);
                });
            }
        );
    };
}
