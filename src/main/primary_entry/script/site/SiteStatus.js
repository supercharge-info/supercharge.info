import Strings from "../util/Strings";

const Status = {
    CLOSED_PERM: {
        value: 'CLOSED_PERM',
        sort: 0,
        displayName: "Permanently Closed",
        className: "closed-perm",
        getIcon: (supercharger) => "/images/black_dot_x.svg",
        getFill: (supercharger) => "url(#black_dot_x)",
        getTitle: (supercharger) => "Permanently Closed"
    },
    CLOSED_TEMP: {
        value: 'CLOSED_TEMP',
        sort: 1,
        displayName: "Temporarily Closed",
        className: "closed-temp",
        getIcon: (supercharger) => "/images/gray_dot_x.svg",
        getFill: (supercharger) => "url(#gray_dot_x)",
        getTitle: (supercharger) => "Temporarily Closed"
    },
    PERMIT: {
        value: 'PERMIT',
        sort: 2,
        displayName: "Permit",
        className: "permit",
        getIcon: (supercharger) => "/images/blue_triangle.svg",
        getFill: (supercharger) => "url(#blue_triangle)",
        getTitle: (supercharger) => "Permit"
    },
    CONSTRUCTION: {
        value: 'CONSTRUCTION',
        sort: 3,
        displayName: "Construction",
        className: "construction",
        getIcon: (supercharger) => "/images/orange_triangle.svg",
        getFill: (supercharger) => "url(#orange_triangle)",
        getTitle: (supercharger) => "Construction"
    },
    OPEN: {
        value: 'OPEN',
        sort: 4,
        displayName: "Open",
        className: "open",
        getIcon: (supercharger) => "/images/" + (Strings.isNotEmpty(supercharger?.hours) ? "red_dot_limited.svg" : "red_dot.svg"),
        getFill: (supercharger) => (Strings.isNotEmpty(supercharger?.hours) ? "url(#red_dot_limited)" : "url(#red_dot)"),
        getTitle: (supercharger) => (Strings.isNotEmpty(supercharger?.hours) ? "Open - limited hours" : "Open")
    },
    USER_ADDED: {
        value: 'USER_ADDED',
        displayName: "Custom",
        className: "user",
        getIcon: (supercharger) => "/images/green_dot.svg",
        getFill: (supercharger) => "url(#green_dot)",
        getTitle: (supercharger) => "Custom"
    }
};

Status.ALL = [Status.OPEN, Status.CONSTRUCTION, Status.PERMIT, Status.CLOSED_TEMP, Status.CLOSED_PERM];

Status.fromString = function (string) {
    const s = string.trim();
    if (s === 'OPEN') {
        return Status.OPEN;
    } else if (s === 'CONSTRUCTION') {
        return Status.CONSTRUCTION;
    } else if (s === 'PERMIT') {
        return Status.PERMIT;
    } else if (s === 'CLOSED_TEMP') {
        return Status.CLOSED_TEMP;
    } else if (s === 'CLOSED_PERM') {
        return Status.CLOSED_PERM;
    } else if (s === 'USER_ADDED') {
        return Status.USER_ADDED;
    }
    throw new Error("invalid status: " + string);
};

export default Status;

