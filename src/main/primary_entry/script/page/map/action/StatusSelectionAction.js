import EventBus from "../../../util/EventBus";
import Analytics from "../../../util/Analytics";
import SiteStatus from "../../../site/SiteStatus";
import statusModel from "../StatusModel";

/**
 *
 * @constructor
 */
const Action = function () {
    EventBus.addListener("status-selection-change-event", this.statusSelectionChange, this);
};

Action.prototype.statusSelectionChange = function (event, siteStatus) {
    if (siteStatus === SiteStatus.PERMIT) {
        statusModel.togglePermit();
    }
    if (siteStatus === SiteStatus.CONSTRUCTION) {
        statusModel.toggleConstruction();
    }
    if (siteStatus === SiteStatus.OPEN) {
        statusModel.toggleOpen();
    }
    statusModel.fireModelChangeEvent();
    Analytics.sendEvent("map", "change-status-selection");
};

export default Action;

