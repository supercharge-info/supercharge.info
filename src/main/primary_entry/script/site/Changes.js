import Sites from "./Sites";
import ServiceURL from "../common/ServiceURL";
import $ from "jquery";

const SITE_CHANGES = {};

export default class Changes {

    static addToSites() {
        Object.entries(SITE_CHANGES).forEach((changeHistory) => {
            const supercharger = Sites.getById(Number(changeHistory[0]));
            if(supercharger.history[0].siteStatus != changeHistory[1][0].siteStatus && new Date(supercharger.history[0].date) < new Date(changeHistory[1][0].date)) {
                changeHistory[1].unshift(supercharger.history[0]);
            } else if(supercharger.history[0].siteStatus != changeHistory[1][changeHistory[1].length - 1].siteStatus && new Date(supercharger.history[0].date) > new Date(changeHistory[1][changeHistory[1].length - 1].date)) {
                changeHistory[1].push(supercharger.history[0]);
            }
            supercharger.history = changeHistory[1];
        });
    }

    static load() {
        return $.getJSON(ServiceURL.CHANGES).done(
            (changeList) => {
                // Manual fix for missing change entry to accurately reflect this supercharger as open
                let manualFix = {'changeType':'UPDATE','country':'USA','countryId':100,'date':'2016-11-06','dateFormatted':'Sun, Nov 6 2016','id':1688,'region':'North America','regionId':100,'siteId':614,'siteName':'Knoxville, KY','siteStatus':'OPEN'};
                changeList.concat(manualFix).forEach((change) => {
                    if (!(change.siteId in SITE_CHANGES)) {
                        SITE_CHANGES[change.siteId] = [];
                    }
                    let changeHistory = SITE_CHANGES[change.siteId];
                    let replaceEntries = 0;
                    for (var index = 0; index < changeHistory.length; index++) {
                        if (new Date(changeHistory[index].date) > new Date(change.date)) {
                            // Our change entry is older so we'll insert change entry now
                            break;
                        } else if (changeHistory[index].date == change.date) {
                            // Found item with same date
                            if (changeHistory[index].id < change.id) {
                                // Our change entry is newer so we'll replace it
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
