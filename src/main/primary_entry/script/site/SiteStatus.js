import Strings from "../util/Strings";
import L from 'leaflet';

const Status = {
    CLOSED_PERM: {
        value: 'CLOSED_PERM',
        sort: 0,
        displayName: "Permanently Closed",
        className: "closed-perm",
        getFill: (supercharger) => "url(#black_dot_x)"
    },
    CLOSED_TEMP: {
        value: 'CLOSED_TEMP',
        sort: 1,
        displayName: "Temporarily Closed",
        className: "closed-temp",
        getFill: (supercharger) => "url(#gray_dot_x)"
    },
    PERMIT: {
        value: 'PERMIT',
        sort: 2,
        displayName: "Permit",
        className: "permit",
        getFill: (supercharger) => "url(#blue_triangle)"
    },
    CONSTRUCTION: {
        value: 'CONSTRUCTION',
        sort: 3,
        displayName: "Construction",
        className: "construction",
        getFill: (supercharger) => "url(#orange_triangle)"
    },
    OPEN: {
        value: 'OPEN',
        sort: 4,
        displayName: "Open",
        className: "open",
        getFill: (supercharger) => (Strings.isNotEmpty(supercharger.hours)) ? "url(#red_dot_limited)" : "url(#red_dot)"
    },
    USER_ADDED: {
        value: 'USER_ADDED',
        displayName: "Custom",
        className: "user",
        getFill: (supercharger) => "url(#green_dot)"
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

