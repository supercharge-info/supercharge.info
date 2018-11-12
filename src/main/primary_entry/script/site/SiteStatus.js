import Strings from "../util/Strings";


const imagesDir = '/images';

const Status = {
    CLOSED_PERM: {
        value: 'CLOSED_PERM',
        sort: 0,
        displayName: "Permanently Closed",
        getIconUrl: function (supercharger) {
            return imagesDir + '/dots/black_dot_16.png';
        }
    },
    CLOSED_TEMP: {
        value: 'CLOSED_TEMP',
        sort: 1,
        displayName: "Temporarily Closed",
        getIconUrl: function (supercharger) {
            return imagesDir + '/dots/gray_dot_16.png';
        }
    },
    PERMIT: {
        value: 'PERMIT',
        sort: 2,
        displayName: "Permit",
        getIconUrl: function (supercharger) {
            return imagesDir + '/dots/blue_dot_16.png';
        }
    },
    CONSTRUCTION: {
        value: 'CONSTRUCTION',
        sort: 3,
        displayName: "Construction",
        getIconUrl: function (supercharger) {
            return imagesDir + '/construction-cone.png';
        }
    },
    OPEN: {
        value: 'OPEN',
        sort: 4,
        displayName: "Open",
        getIconUrl: function (supercharger) {
            if (Strings.isNotEmpty(supercharger.hours)) {
                return imagesDir + '/dots/red_black_dot_16.png';
            } else {
                return imagesDir + '/dots/red_dot_16.png';
            }
        }
    },
    USER_ADDED: {
        value: 'USER_ADDED',
        displayName: "Custom",
        getIconUrl: function (supercharger) {
            return imagesDir + '/dots/green_dot_16.png';
        }
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

