import Address from "./Address";
import Objects from "../util/Objects";
import Strings from "../util/Strings";
import Dates from "../util/Dates";
import Units from "../util/Units";
import unitConversion from "../util/UnitConversion";
import Status from "./SiteStatus";
import L from 'leaflet';
import ServiceURL from "../common/ServiceURL";


const BASE_STALLS = ['v2', 'v3', 'v4', 'urban'];
const BASE_PLUGS = ['nacs', 'ccs1', 'ccs2', 'type2', 'gbt'];

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

    isVoting() {
        return this.status === Status.VOTING;
    }
    isPlan() {
        return this.status === Status.PLAN;
    }
    isPermit() {
        return this.status === Status.PERMIT;
    }
    isConstruction() {
        return this.status === Status.CONSTRUCTION;
    }
    isExpanding() {
        return this.status === Status.EXPANDING;
    }
    isOpen() {
        return this.status === Status.OPEN;
    }
    isClosedTemp() {
        return this.status === Status.CLOSED_TEMP;
    }
    isClosedPerm() {
        return this.status === Status.CLOSED_PERM;
    }
    isUserAdded() {
        return this.status === Status.USER_ADDED;
    }

    hasOpenDate() {
        return Objects.isNotNullOrUndef(this.dateOpened);
    }

    toString() {
        return JSON.stringify(this);
    }

    formatStalls() {
        return Objects.isNullOrUndef(this.numStalls) ? "" : this.numStalls;
    }

    formatLocation() {
        return Objects.isNullOrUndef(this.location) ? "" : `${this.location.lat}, ${this.location.lng}`;
    }

    formatDateOpened() {
        return Objects.isNullOrUndef(this.dateOpened) ? "" : Dates.toString(this.dateOpened);
    }

    formatElevation(targetUnits) {
        if (Objects.isNullOrUndef(this.elevation)) {
            return "";
        }
        return this.formatElevationNoUnits(targetUnits) + " " + targetUnits.code;
    }

    formatElevationNoUnits(targetUnits) {
        if (Objects.isNullOrUndef(this.elevation)) {
            return "";
        }
        const elevationNumber = unitConversion(Units.M, targetUnits, 0)(this.elevation);
        return elevationNumber.toLocaleString();
    }

    formatHours() {
        return Objects.isNullOrUndef(this.hours) ? "24/7" : this.hours;
    }

    formatPower() {
        return Objects.isNullOrUndef(this.powerKilowatt) ? "" : this.powerKilowatt;
    }

    getStallPlugSummary(useImages) {
        if (!this.stalls || !this.numStalls || this.numStalls == 0) return '';

        var summary = `${this.numStalls} ${Strings.upperCaseInitial(this.stallType) ?? ''} `;
        if (this.plugType) {
            summary += useImages ? this.plugImg(this.plugType) : this.plugType.toUpperCase();
        } else {
            summary += 'stalls';
        }
        // special case for MagicDock
        if (this.numStalls === this.plugs?.nacs && this.plugs?.nacs === this.plugs?.ccs1) {
            summary = `<span class="details" title="MagicDock (NACS+CCS1)">${this.numStalls} ${Strings.upperCaseInitial(this.stallType)} ${useImages ? '<img src="/images/NACS.svg"/><img src="/images/CCS1.svg"/>' : 'MagicDock'}</span>`;
        }
        return summary;
    }

    getMarkerTitle() {
        const sitestalls = this.getStallPlugSummary(false);
        return `<div>${this.displayName} (${this.status?.displayName})</div>` +
            (Objects.isNullOrUndef(this.hours) ? "" : `<div class="limited">Hours: ${this.hours}</div>`) +
            (Objects.isNullOrUndef(this.numStalls) || this.numStalls == 0 ? "" : ` • ${sitestalls}`) +
            (Objects.isNullOrUndef(this.powerKilowatt) || this.powerKilowatt == 0 ? "" : ` • ${this.powerKilowatt} kW`);
	}

    getShortMarkerTitle() {
        return `• ${this.displayName}` + (this.isUserAdded() ? "" : ` (${this.numStalls || '?'} @ ${this.powerKilowatt || '?'} kW)`);
    }

    getMarkerMultiplier() {
        // squares
        if (this.status === Status.PLAN || this.status === Status.VOTING) return 1.3;
        // triangles
        if (this.status === Status.PERMIT || this.status === Status.CONSTRUCTION) return 1.2;
        // circles
        return 1.0;
    }

    getTeslaLink() {
        return (this.address.isTeslaCN() ? ServiceURL.TESLA_CN_PAGE : ServiceURL.TESLA_WEB_PAGE) + this.locationId;
    }

    plugImg(plug) {
        const up = plug.toUpperCase();
        return `<img class="details" src="/images/${up}.svg" title="${up}" alt="${up}"/>`;
    }

}

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
    supercharger.stalls = jsonObject.stalls;
    if (supercharger.stalls) {
        for (const s of BASE_STALLS) {
            if (supercharger.stalls[s] === supercharger.numStalls) {
                supercharger.stallType = s;
                break;
            }
        }
    }
    supercharger.plugs = jsonObject.plugs;
    if (supercharger.plugs) {
        // For now at least, treat TPC as NACS
        if (supercharger.plugs?.tpc > 0) {
            supercharger.plugs.nacs = (supercharger.plugs.nacs ?? 0) + supercharger.plugs.tpc;
            delete supercharger.plugs.tpc;
        }
        for (const p of BASE_PLUGS) {
            if (supercharger.plugs[p] === supercharger.numStalls) {
                supercharger.plugType = p;
                break;
            }
        }
    }
    supercharger.parkingId = jsonObject.parkingId;
    supercharger.facilityName = jsonObject.facilityName;
    supercharger.facilityHours = jsonObject.facilityHours;
    supercharger.accessNotes = jsonObject.accessNotes;
    supercharger.addressNotes = jsonObject.addressNotes;
    supercharger.plugshareId = jsonObject.plugshareId;
    supercharger.osmId = jsonObject.osmId;
    supercharger.history =
        jsonObject.status == 'OPEN' || jsonObject.status == 'EXPANDING' ?
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
