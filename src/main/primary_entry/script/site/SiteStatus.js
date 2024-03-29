import Strings from "../util/Strings";

const Status = {
    CLOSED_PERM: {
        value: 'CLOSED_PERM',
        sort: 0,
        displayName: "Permanently Closed",
        shortName: "Closed",
        className: "closed-perm",
        getIcon: (site) => "/images/black_dot_x.svg",
        getFill: (site) => "url(#black_dot_x)",
        getTitle: (site) => "Permanently Closed"
    },
    CLOSED_TEMP: {
        value: 'CLOSED_TEMP',
        sort: 1,
        displayName: "Temporarily Closed",
        shortName: "Closed",
        className: "closed-temp",
        getIcon: (site) => "/images/gray_dot_x.svg",
        getFill: (site) => "url(#gray_dot_x)",
        getTitle: (site) => "Temporarily Closed"
    },
    VOTING: {
        value: 'VOTING',
        sort: 2,
        displayName: "Voting",
        shortName: "Voting",
        className: "voting",
        getIcon: (site) => "/images/vote.svg",
        getFill: (site) => "url(#vote)",
        getTitle: (site) => "Voting"
    },
    PLAN: {
        value: 'PLAN',
        sort: 3,
        displayName: "Plan",
        shortName: "Plan",
        className: "plan",
        getIcon: (site) => "/images/plan.svg",
        getFill: (site) => "url(#plan)",
        getTitle: (site) => "Plan"
    },
    PERMIT: {
        value: 'PERMIT',
        sort: 4,
        displayName: "Permit",
        shortName: "Permit",
        className: "permit",
        getIcon: (site) => "/images/blue_triangle.svg",
        getFill: (site) => "url(#blue_triangle)",
        getTitle: (site) => "Permit"
    },
    CONSTRUCTION: {
        value: 'CONSTRUCTION',
        sort: 5,
        displayName: "Construction",
        shortName: "Constr",
        className: "construction",
        getIcon: (site) => "/images/orange_triangle.svg",
        getFill: (site) => "url(#orange_triangle)",
        getTitle: (site) => "Construction"
    },
    EXPANDING: {
        value: 'EXPANDING',
        sort: 6,
        displayName: "Expanding",
        shortName: "Expand",
        className: "expanding",
        getIcon: (site) => "/images/red_expand.svg",
        getFill: (site) => "url(#red_expand)",
        getTitle: (site) => "Expanding"
    },
    OPEN: {
        value: 'OPEN',
        sort: 7,
        displayName: "Open",
        shortName: "Open",
        className: "open",
        getIcon: (site) => "/images/" + (Strings.isNotEmpty(site?.hours) ? "red_dot_limited.svg" : "red_dot.svg"),
        getFill: (site) => (Strings.isNotEmpty(site?.hours) ? "url(#red_dot_limited)" : "url(#red_dot)"),
        getTitle: (site) => (Strings.isNotEmpty(site?.hours) ? "Open - limited hours" : "Open")
    },
    USER_ADDED: {
        value: 'USER_ADDED',
        displayName: "Custom",
        shortName: "Custom",
        className: "user",
        getIcon: (site) => "/images/custom_pin.svg",
        getFill: (site) => "url(#custom_pin)",
        getTitle: (site) => "Custom"
    },
    UNKNOWN: {
        value: 'UNKNOWN',
        displayName: "Unknown",
        shortName: "Unknown",
        className: "unknown",
        getIcon: (site) => "/images/OTHER.svg",
        getFill: (site) => "#aa0",
        getTitle: (site) => "Unknown"
    }
};

Status.ALL = [Status.OPEN, Status.EXPANDING, Status.CONSTRUCTION, Status.PERMIT, Status.PLAN, Status.VOTING, Status.CLOSED_TEMP, Status.CLOSED_PERM];

Status.getImg = function (site, status, extraClasses) {
    return '' +
        `<span class='${status.value} status-select ${extraClasses ?? ''}'>` +
            `<img src='${status.getIcon(site)}' title='${status.getTitle(site)}' alt='${status.getTitle(site)}'/>` +
        `</span>`;
};

Status.fromString = function (string) {
    const s = string.trim();
    if (s === 'OPEN') {
        return Status.OPEN;
    } else if (s === 'EXPANDING') {
        return Status.EXPANDING;
    } else if (s === 'CONSTRUCTION') {
        return Status.CONSTRUCTION;
    } else if (s === 'PERMIT') {
        return Status.PERMIT;
    } else if (s === 'PLAN') {
        return Status.PLAN;
    } else if (s === 'VOTING') {
        return Status.VOTING;
    } else if (s === 'CLOSED_TEMP') {
        return Status.CLOSED_TEMP;
    } else if (s === 'CLOSED_PERM') {
        return Status.CLOSED_PERM;
    } else if (s === 'USER_ADDED') {
        return Status.USER_ADDED;
    }
    console.log("invalid status: " + string);
    return Status.UNKNOWN;
};

Status.matches = function (status, search) {
    if (Status.ALL.indexOf(status) < 0) return false;
    return status.displayName.toLowerCase().indexOf(search) >= 0;
};

export default Status;

