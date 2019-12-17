import Strings from "../util/Strings";
import L from 'leaflet';

const imagesDir = '/images';

const I_CONSTRUCTION = L.icon({
    iconUrl: imagesDir + '/construction-cone.png',
    iconAnchor: [11, 15]
});

const I_PERMIT = L.icon({
    iconUrl: imagesDir + '/dots/blue_dot_16.png',
    iconAnchor: [8, 8]
});

const I_CLOSED_PERM = L.icon({
    iconUrl: imagesDir + '/dots/black_dot_16.png',
    iconAnchor: [8, 8]
});

const I_CLOSED_TEMP = L.icon({
    iconUrl: imagesDir + '/dots/gray_dot_16.png',
    iconAnchor: [8, 8]
});

const I_OPEN = L.icon({
    iconUrl: imagesDir + '/dots/red_dot_16.png',
    iconAnchor: [8, 8]
});

const I_OPEN_HOURS = L.icon({
    iconUrl: imagesDir + '/dots/red_black_dot_16.png',
    iconAnchor: [8, 8]
});

const I_CUSTOM = L.icon({
    iconUrl: imagesDir + '/dots/green_dot_16.png',
    iconAnchor: [8, 8]
});

const Status = {
    CLOSED_PERM: {
        value: 'CLOSED_PERM',
        sort: 0,
        displayName: "Permanently Closed",
        getIcon: (supercharger) => I_CLOSED_PERM
    },
    CLOSED_TEMP: {
        value: 'CLOSED_TEMP',
        sort: 1,
        displayName: "Temporarily Closed",
        getIcon: (supercharger) => I_CLOSED_TEMP
    },
    PERMIT: {
        value: 'PERMIT',
        sort: 2,
        displayName: "Permit",
        getIcon: (supercharger) => I_PERMIT
    },
    CONSTRUCTION: {
        value: 'CONSTRUCTION',
        sort: 3,
        displayName: "Construction",
        getIcon: (supercharger) => I_CONSTRUCTION
    },
    OPEN: {
        value: 'OPEN',
        sort: 4,
        displayName: "Open",
        getIcon: (supercharger) => ((Strings.isNotEmpty(supercharger.hours)) ? I_OPEN_HOURS : I_OPEN)
    },
    USER_ADDED: {
        value: 'USER_ADDED',
        displayName: "Custom",
        getIcon: (supercharger) => I_CUSTOM
    }
};

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

