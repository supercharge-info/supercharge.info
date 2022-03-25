import Strings from "../util/Strings";
import L from 'leaflet';

const imagesDir = '/images';

const I_CONSTRUCTION = L.icon({
    iconUrl: imagesDir + '/construction-cone.png',
    iconAnchor: [11, 15]
});

const I_PERMIT = L.icon({
    iconUrl: imagesDir + '/blue_dot_16.png',
    iconAnchor: [8, 8]
});

const I_CLOSED_PERM = L.icon({
    iconUrl: imagesDir + '/black_dot_16.png',
    iconAnchor: [8, 8]
});

const I_CLOSED_TEMP = L.icon({
    iconUrl: imagesDir + '/gray_dot_16.png',
    iconAnchor: [8, 8]
});

const I_OPEN = L.icon({
    iconUrl: imagesDir + '/red_dot_16.png',
    iconAnchor: [8, 8]
});

const I_OPEN_HOURS = L.icon({
    iconUrl: imagesDir + '/red_black_dot_16.png',
    iconAnchor: [8, 8]
});

const I_CUSTOM = L.icon({
    iconUrl: imagesDir + '/green_dot_16.png',
    iconAnchor: [8, 8]
});

const I_CONSTRUCTION_M = L.icon({
    iconUrl: imagesDir + '/orange_cone_10.png',
    iconAnchor: [5, 5]
});

const I_PERMIT_M = L.icon({
    iconUrl: imagesDir + '/blue_dot_10.png',
    iconAnchor: [5, 5]
});

const I_CLOSED_PERM_M = L.icon({
    iconUrl: imagesDir + '/black_dot_10.png',
    iconAnchor: [5, 5]
});

const I_CLOSED_TEMP_M = L.icon({
    iconUrl: imagesDir + '/gray_dot_10.png',
    iconAnchor: [5, 5]
});

const I_OPEN_M = L.icon({
    iconUrl: imagesDir + '/red_dot_10.png',
    iconAnchor: [5, 5]
});

const I_OPEN_HOURS_M = L.icon({
    iconUrl: imagesDir + '/red_black_dot_10.png',
    iconAnchor: [5, 5]
});

const I_CONSTRUCTION_S = L.icon({
    iconUrl: imagesDir + '/orange_cone_6.png',
    iconAnchor: [3, 3]
});

const I_PERMIT_S = L.icon({
    iconUrl: imagesDir + '/blue_dot_6.png',
    iconAnchor: [3, 3]
});

const I_CLOSED_PERM_S = L.icon({
    iconUrl: imagesDir + '/black_dot_6.png',
    iconAnchor: [3, 3]
});

const I_CLOSED_TEMP_S = L.icon({
    iconUrl: imagesDir + '/gray_dot_6.png',
    iconAnchor: [3, 3]
});

const I_OPEN_S = L.icon({
    iconUrl: imagesDir + '/red_dot_6.png',
    iconAnchor: [3, 3]
});

const I_OPEN_HOURS_S = L.icon({
    iconUrl: imagesDir + '/red_black_dot_6.png',
    iconAnchor: [3, 3]
});
const Status = {
    CLOSED_PERM: {
        value: 'CLOSED_PERM',
        sort: 0,
        displayName: "Permanently Closed",
        getIcon: (supercharger) => I_CLOSED_PERM,
        getIconM: (supercharger) => I_CLOSED_PERM_M,
        getIconS: (supercharger) => I_CLOSED_PERM_S
    },
    CLOSED_TEMP: {
        value: 'CLOSED_TEMP',
        sort: 1,
        displayName: "Temporarily Closed",
        getIcon: (supercharger) => I_CLOSED_TEMP,
        getIconM: (supercharger) => I_CLOSED_TEMP_M,
        getIconS: (supercharger) => I_CLOSED_TEMP_S
    },
    PERMIT: {
        value: 'PERMIT',
        sort: 2,
        displayName: "Permit",
        getIcon: (supercharger) => I_PERMIT,
        getIconM: (supercharger) => I_PERMIT_M,
        getIconS: (supercharger) => I_PERMIT_S
    },
    CONSTRUCTION: {
        value: 'CONSTRUCTION',
        sort: 3,
        displayName: "Construction",
        getIcon: (supercharger) => I_CONSTRUCTION,
        getIconM: (supercharger) => I_CONSTRUCTION_M,
        getIconS: (supercharger) => I_CONSTRUCTION_S
    },
    OPEN: {
        value: 'OPEN',
        sort: 4,
        displayName: "Open",
        getIcon: (supercharger) => ((Strings.isNotEmpty(supercharger.hours)) ? I_OPEN_HOURS : I_OPEN),
        getIconM: (supercharger) => ((Strings.isNotEmpty(supercharger.hours)) ? I_OPEN_HOURS_M : I_OPEN_M),
        getIconS: (supercharger) => ((Strings.isNotEmpty(supercharger.hours)) ? I_OPEN_HOURS_S : I_OPEN_S)
    },
    USER_ADDED: {
        value: 'USER_ADDED',
        displayName: "Custom",
        getIcon: (supercharger) => I_CUSTOM,
        getIconM: (supercharger) => I_CUSTOM,
        getIconS: (supercharger) => I_CUSTOM
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

