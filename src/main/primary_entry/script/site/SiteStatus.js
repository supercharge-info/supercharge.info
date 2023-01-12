import Strings from "../util/Strings";
import L from 'leaflet';

const imagesDir = '/images';

const I_CUSTOM = L.icon({
    iconUrl: imagesDir + '/green_dot_16.png',
    iconAnchor: [8, 8],
    iconSize: [16, 16]
});

const Status = {
    CLOSED_PERM: {
        value: 'CLOSED_PERM',
        sort: 0,
        displayName: "Permanently Closed",
        className: "closed-perm",
        getIcon: (supercharger) => StatusIcons.I_CLOSED_PERM[supercharger.markerSize]
    },
    CLOSED_TEMP: {
        value: 'CLOSED_TEMP',
        sort: 1,
        displayName: "Temporarily Closed",
        className: "closed-temp",
        getIcon: (supercharger) => StatusIcons.I_CLOSED_TEMP[supercharger.markerSize]
    },
    PERMIT: {
        value: 'PERMIT',
        sort: 2,
        displayName: "Permit",
        className: "permit",
        getIcon: (supercharger) => StatusIcons.I_PERMIT[supercharger.markerSize]
    },
    CONSTRUCTION: {
        value: 'CONSTRUCTION',
        sort: 3,
        displayName: "Construction",
        className: "construction",
        getIcon: (supercharger) => StatusIcons.I_CONSTRUCTION[supercharger.markerSize]
    },
    OPEN: {
        value: 'OPEN',
        sort: 4,
        displayName: "Open",
        className: "open",
        getIcon: (supercharger) => ((Strings.isNotEmpty(supercharger.hours)) ? StatusIcons.I_OPEN_HOURS : StatusIcons.I_OPEN)[supercharger.markerSize]
    },
    USER_ADDED: {
        value: 'USER_ADDED',
        displayName: "Custom",
        getIcon: (supercharger) => I_CUSTOM
    }
}

var StatusIcons = {
    I_CONSTRUCTION: {},
    I_PERMIT: {},
    I_CLOSED_PERM: {},
    I_CLOSED_TEMP: {},
    I_OPEN: {},
    I_OPEN_HOURS: {}
}

var iconZoom = { "3": 3, "4": 4, "5": 5, "6": 6, "7": 7, "8": 8, "S": 3, "M": 5, "L": 8 };
Object.entries(iconZoom).forEach(([zk, zv]) => {
    StatusIcons.I_CONSTRUCTION[zk] = L.icon({
        iconUrl: imagesDir + '/construction-cone_16.png',
        iconAnchor: [zv,zv],
        iconSize: [zv*2,zv*2]
    });
    StatusIcons.I_PERMIT[zk] = L.icon({
        iconUrl: imagesDir + '/blue_dot_16.png',
        iconAnchor: [zv,zv],
        iconSize: [zv*2,zv*2]
    });
    StatusIcons.I_CLOSED_PERM[zk] = L.icon({
        iconUrl: imagesDir + '/black_dot_16.png',
        iconAnchor: [zv,zv],
        iconSize: [zv*2,zv*2]
    });
    StatusIcons.I_CLOSED_TEMP[zk] = L.icon({
        iconUrl: imagesDir + '/gray_dot_16.png',
        iconAnchor: [zv,zv],
        iconSize: [zv*2,zv*2]
    });
    StatusIcons.I_OPEN[zk] = L.icon({
        iconUrl: imagesDir + '/red_dot_16.png',
        iconAnchor: [zv,zv],
        iconSize: [zv*2,zv*2]
    });
    StatusIcons.I_OPEN_HOURS[zk] = L.icon({
        iconUrl: imagesDir + '/red_black_dot_16.png',
        iconAnchor: [zv,zv],
        iconSize: [zv*2,zv*2]
    });
});

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

