import Strings from "../util/Strings";
import L from 'leaflet';

const imagesDir = '/images';

const I_CONSTRUCTION = {
    "L": L.icon({
        iconUrl: imagesDir + '/construction-cone_16.png',
        iconAnchor: [8, 8]
    }),
    "M": L.icon({
        iconUrl: imagesDir + '/construction-cone_10.png',
        iconAnchor: [5, 5]
    }),
    "S": L.icon({
        iconUrl: imagesDir + '/construction-cone_6.png',
        iconAnchor: [3, 3]
    })
};

const I_PERMIT = {
    "L": L.icon({
        iconUrl: imagesDir + '/blue_dot_16.png',
        iconAnchor: [8, 8]
    }),
    "M": L.icon({
        iconUrl: imagesDir + '/blue_dot_8.png',
        iconAnchor: [4, 4]
    }),
    "S": L.icon({
        iconUrl: imagesDir + '/blue_dot_5.png',
        iconAnchor: [3, 3]
    })
};

const I_CLOSED_PERM = {
    "L": L.icon({
        iconUrl: imagesDir + '/black_dot_16.png',
        iconAnchor: [8, 8]
    }),
    "M": L.icon({
        iconUrl: imagesDir + '/black_dot_8.png',
        iconAnchor: [4, 4]
    }),
    "S": L.icon({
        iconUrl: imagesDir + '/black_dot_5.png',
        iconAnchor: [3, 3]
    })
};

const I_CLOSED_TEMP = {
    "L": L.icon({
        iconUrl: imagesDir + '/gray_dot_16.png',
        iconAnchor: [8, 8]
    }),
    "M": L.icon({
        iconUrl: imagesDir + '/gray_dot_8.png',
        iconAnchor: [4, 4]
    }),
    "S": L.icon({
        iconUrl: imagesDir + '/gray_dot_5.png',
        iconAnchor: [3, 3]
    })
};

const I_OPEN = {
    "L": L.icon({
        iconUrl: imagesDir + '/red_dot_16.png',
        iconAnchor: [8, 8]
    }),
    "M": L.icon({
        iconUrl: imagesDir + '/red_dot_8.png',
        iconAnchor: [4, 4]
    }),
    "S": L.icon({
        iconUrl: imagesDir + '/red_dot_5.png',
        iconAnchor: [3, 3]
    })
};

const I_OPEN_HOURS = {
    "L": L.icon({
        iconUrl: imagesDir + '/red_black_dot_16.png',
        iconAnchor: [8, 8]
    }),
    "M": L.icon({
        iconUrl: imagesDir + '/red_black_dot_8.png',
        iconAnchor: [4, 4]
    }),
    "S": L.icon({
        iconUrl: imagesDir + '/red_black_dot_5.png',
        iconAnchor: [3, 3]
    })
};

const I_CUSTOM = L.icon({
    iconUrl: imagesDir + '/green_dot_16.png',
    iconAnchor: [8, 8]
});

const Status = {
    CLOSED_PERM: {
        value: 'CLOSED_PERM',
        sort: 0,
        displayName: "Permanently Closed",
        className: "closed-perm",
        getIcon: (supercharger, markerSize) => I_CLOSED_PERM[markerSize]
    },
    CLOSED_TEMP: {
        value: 'CLOSED_TEMP',
        sort: 1,
        displayName: "Temporarily Closed",
        className: "closed-temp",
        getIcon: (supercharger, markerSize) => I_CLOSED_TEMP[markerSize]
    },
    PERMIT: {
        value: 'PERMIT',
        sort: 2,
        displayName: "Permit",
        className: "permit",
        getIcon: (supercharger, markerSize) => I_PERMIT[markerSize]
    },
    CONSTRUCTION: {
        value: 'CONSTRUCTION',
        sort: 3,
        displayName: "Construction",
        className: "construction",
        getIcon: (supercharger, markerSize) => I_CONSTRUCTION[markerSize]
    },
    OPEN: {
        value: 'OPEN',
        sort: 4,
        displayName: "Open",
        className: "open",
        getIcon: (supercharger, markerSize) => ((Strings.isNotEmpty(supercharger.hours)) ? I_OPEN_HOURS : I_OPEN)[markerSize]
    },
    USER_ADDED: {
        value: 'USER_ADDED',
        displayName: "Custom",
        getIcon: (supercharger, markerSize) => I_CUSTOM
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

