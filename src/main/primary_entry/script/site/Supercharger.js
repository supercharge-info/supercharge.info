import Address from "./Address";
import Objects from "../util/Objects";
import Dates from "../util/Dates";
import Units from "../util/Units";
import unitConversion from "../util/UnitConversion";
import Status from "./SiteStatus";
import L from 'leaflet';


/**
 * Properties:
 *
 * Other properties that are later added to the supercharger data structure:
 *
 * circle         -- [google.maps.Circle] a reference to the google-maps Circle object indicating range for this supercharger.
 * marker         -- [google.maps.Marker] a reference to the google-maps Marker object associated with this supercharger.
 * circleOn       -- Boolean              indicates if the circle has been enabled by the user. Visibility of the circle itself
 *                                        is not sufficient state because circles can be invisible for other reasons.
 */
export default class Supercharger {

    constructor() {
        // same default values for user-added and normal sites/markers.
        this.circleOn = false;
        this.markerSize = 8;
    }

    isPermit() {
        return this.status === Status.PERMIT;
    };
    isConstruction() {
        return this.status === Status.CONSTRUCTION;
    };
    isOpen() {
        return this.status === Status.OPEN;
    };
    isClosedTemp() {
        return this.status === Status.CLOSED_TEMP;
    };
    isClosedPerm() {
        return this.status === Status.CLOSED_PERM;
    };
    isUserAdded() {
        return this.status === Status.USER_ADDED;
    };

    hasOpenDate() {
        return Objects.isNotNullOrUndef(this.dateOpened);
    };

    toString() {
        return JSON.stringify(this);
    };

    formatStalls() {
        return Objects.isNullOrUndef(this.numStalls) ? "" : this.numStalls;
    };

    formatLocation() {
        return Objects.isNullOrUndef(this.location) ? "" : `${this.location.lat}, ${this.location.lng}`;
    };

    formatDateOpened() {
        return Objects.isNullOrUndef(this.dateOpened) ? "" : Dates.toString(this.dateOpened);
    };

    formatElevation(targetUnits) {
        if (Objects.isNullOrUndef(this.elevation)) {
            return "";
        }
        return this.formatElevationNoUnits(targetUnits) + " " + targetUnits.code;
    };

    formatElevationNoUnits(targetUnits) {
        if (Objects.isNullOrUndef(this.elevation)) {
            return "";
        }
        const elevationNumber = unitConversion(Units.M, targetUnits, 0)(this.elevation);
        return elevationNumber.toLocaleString();
    };

    formatHours() {
        return Objects.isNullOrUndef(this.hours) ? "24/7" : this.hours;
    };

    formatPower() {
        return Objects.isNullOrUndef(this.powerKilowatt) ? "" : this.powerKilowatt;
    };

    getMarkerTitle() {
        return `<div>${this.displayName} (${this.status?.displayName})</div>` +
            (Objects.isNullOrUndef(this.hours) ? "" : `<div class="limited">Hours: ${this.hours}</div>`) +
            (Objects.isNullOrUndef(this.numStalls) || this.numStalls == 0 ? "" : ` • ${this.numStalls} stalls`) +
            (Objects.isNullOrUndef(this.powerKilowatt) || this.powerKilowatt == 0 ? "" : ` • ${this.powerKilowatt} kW`);
	};

    getShortMarkerTitle() {
        return `• ${this.displayName} (${this.numStalls || '?'} @ ${this.powerKilowatt || '?'} kW)`
    }

    getMarkerMultiplier() {
        return (this.status === Status.PERMIT || this.status === Status.CONSTRUCTION) ? 1.2 : 1.0;
    }


};

Supercharger.fromJSON = function (jsonObject) {
    const today = new Date();
    const supercharger = new Supercharger();
    supercharger.id = jsonObject.id;
    supercharger.locationId = jsonObject.locationId;
    supercharger.displayName = jsonObject.name;
    supercharger.status = Status.fromString(jsonObject.status);
    supercharger.statusDays = jsonObject.statusDays;
    supercharger.address = Address.fromJSON(jsonObject.address);
    supercharger.location = L.latLng(jsonObject.gps.latitude, jsonObject.gps.longitude);
    supercharger.location.lat = Math.trunc(supercharger.location.lat * 1000000) / 1000000;
    supercharger.location.lng = Math.trunc(supercharger.location.lng * 1000000) / 1000000;
    supercharger.elevation = jsonObject.elevationMeters;
    supercharger.urlDiscuss = jsonObject.urlDiscuss;
    supercharger.count = jsonObject.counted;
    supercharger.dateOpened = Objects.isNullOrUndef(jsonObject.dateOpened) ? null : Dates.fromString(jsonObject.dateOpened);
    supercharger.hours = jsonObject.hours;
    supercharger.numStalls = jsonObject.stallCount;
    supercharger.powerKilowatt = jsonObject.powerKilowatt;
    supercharger.solarCanopy = jsonObject.solarCanopy;
    supercharger.battery = jsonObject.battery;
    supercharger.otherEVs = jsonObject.otherEVs;
    supercharger.history =
        jsonObject.status == 'OPEN' ?
            [{ siteStatus: jsonObject.status, date: jsonObject.dateOpened }]
        : jsonObject.statusDays ? [{
            siteStatus: jsonObject.status,
            date: new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate() - jsonObject.statusDays)).toISOString().split('T')[0]
        }] : [];
    supercharger.historyLoaded = false;
    return supercharger;
};

Supercharger.buildNewCustom = function (id, displayName, location) {
    const supercharger = new Supercharger();
    supercharger.id = id;
    supercharger.displayName = displayName;
    supercharger.address = new Address();
    supercharger.location = location;
    supercharger.count = false;
    supercharger.status = Status.USER_ADDED;
    return supercharger;
};
