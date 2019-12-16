import Strings from "../util/Strings";
import L from 'leaflet';

const imagesDir = '/images';

const createActiveIcon = (moniker, hasSpecialHours) => {
    return L.icon({
        iconUrl: `${imagesDir}/dots/red_${hasSpecialHours ? 'black_' : ''}dot${moniker ? '_' : ''}${moniker}_16.png`,
        iconAnchor: [8, 8]
    });
};

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

const I_OPEN = createActiveIcon('unknown', false);
const I_OPEN_HOURS = createActiveIcon('unknown', true);

const I_OPEN_V3 = createActiveIcon('v3', false);
const I_OPEN_V3_HOURS = createActiveIcon('v3', true);

const I_OPEN_URBAN = createActiveIcon('urban', false);
const I_OPEN_URBAN_HOURS = createActiveIcon('urban', true);

const I_OPEN_STANDARD = createActiveIcon('', false);
const I_OPEN_STANDARD_HOURS = createActiveIcon('', true);

const I_CUSTOM = L.icon({
    iconUrl: imagesDir + '/dots/green_dot_16.png',
    iconAnchor: [8, 8]
});

function getOpenIcon(supercharger) {
    const powerKilowatt = supercharger.powerKilowatt || 0;
    if (powerKilowatt >= 250) {
        return ((Strings.isNotEmpty(supercharger.hours)) ? I_OPEN_V3_HOURS : I_OPEN_V3)
    } else if (powerKilowatt >= 120) {
        return ((Strings.isNotEmpty(supercharger.hours)) ? I_OPEN_STANDARD_HOURS : I_OPEN_STANDARD)
    } else if (powerKilowatt >= 72) {
        return ((Strings.isNotEmpty(supercharger.hours)) ? I_OPEN_URBAN_HOURS : I_OPEN_URBAN)
    } else {
        return ((Strings.isNotEmpty(supercharger.hours)) ? I_OPEN_HOURS : I_OPEN)
    }
}

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
        displayName: "Open (Unknown kW)",
        getIcon: getOpenIcon
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
