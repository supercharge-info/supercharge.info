import Address from "./Address";
import Objects from "../util/Objects";
import Strings from "../util/Strings";
import Dates from "../util/Dates";
import Units from "../util/Units";
import unitConversion from "../util/UnitConversion";
import Sites from "./Sites";
import Status from "./SiteStatus";
import L from 'leaflet';
import ServiceURL from "../common/ServiceURL";


const BASE_STALLS = ['v2', 'v3', 'v4', 'urban'];
const BASE_PLUGS = ['tpc', 'nacs', 'ccs1', 'ccs2', 'type2', 'gbt'];
const PLUG_DISPLAY = {'tpc': 'Tesla', 'nacs': 'NACS', 'ccs1': 'CCS1', 'ccs2': 'CCS2', 'type2': 'Type2', 'gbt': 'GB/T'};

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

    // This mirrors SiteDTO.matches() in the API repo
    matches(search, anyWord) {
        if (search === null || search === "") return true;
        if (search.indexOf(" ") >= 0) {
            for (var s of search.split(" ")) {
                if (this.matches(s)) {
                    if (anyWord) return true;
                } else {
                    if (!anyWord) return false;
                }
            }
            return !anyWord;
        }
        search = search.toLowerCase();
        if (this.id?.toString().indexOf(search) >= 0) return true;
        if (this.displayName?.toLowerCase().indexOf(search) >= 0) return true;
        if (Status.matches(this.status, search)) return true;
        if (this.address?.street?.toLowerCase().indexOf(search) >= 0) return true;
        if (this.address?.city?.toLowerCase().indexOf(search) >= 0) return true;
        if (this.address?.state?.toLowerCase().indexOf(search) >= 0) return true;
        if (Sites.StateAbbreviations[this.address?.state]?.toLowerCase().indexOf(search) >= 0) return true;
        if (this.address?.zip?.toLowerCase().indexOf(search) >= 0) return true;
        if (this.address?.country?.toLowerCase().indexOf(search) >= 0) return true;
        if (this.address?.region?.toLowerCase().indexOf(search) >= 0) return true;
        if (this.location?.lat?.toString().indexOf(search) >= 0) return true;
        if (this.location?.lng?.toString().indexOf(search) >= 0) return true;
        if (this.numStalls?.toString().indexOf(search) >= 0) return true;
        if (this.hours?.toLowerCase().indexOf(search) >= 0) return true;
        if (this.elevation?.toString().indexOf(search) >= 0) return true;
        if (this.powerKilowatt?.toString().indexOf(search) >= 0) return true;
        if (search === "v2" && this.stalls?.v2 > 0) return true;
        if (search === "v3" && this.stalls?.v3 > 0) return true;
        if (search === "v4" && this.stalls?.v4 > 0) return true;
        if (search === "urban" && this.stalls?.urban > 0) return true;
        if (search.indexOf("access") === 0 && this.stalls?.accessible > 0) return true;
        if (search.indexOf("trailer") === 0 && this.stalls?.trailerFriendly > 0) return true;
        if (search === "tesla" && (this.plugs?.tpc > 0 || this.plugs?.nacs > 0)) return true;
        if (search === "tpc" && this.plugs?.tpc > 0) return true;
        if (search === "nacs" && this.plugs?.nacs > 0) return true;
        if (search === "ccs1" && this.plugs?.ccs1 > 0) return true;
        if (search === "ccs2" && this.plugs?.ccs2 > 0) return true;
        if (search === "ccs" && (this.plugs?.ccs1 > 0 || this.plugs.ccs2 > 0)) return true;
        if (search === "type2" && this.plugs?.type2 > 0) return true;
        if (search.replace("/", "") === "gbt" && this.plugs?.gbt > 0) return true;
        if (search === "multi" && this.plugs?.multi > 0) return true;
        if (search.indexOf("magic") === 0 && (this.plugs?.tpc > 0 || this.plugs?.nacs > 0) && this.plugs?.ccs1 > 0 && this.plugs?.multi > 0) return true;
        if (this.facilityName?.toLowerCase().indexOf(search) >= 0) return true;
        if (this.facilityHours?.toLowerCase().indexOf(search) >= 0) return true;
        if (this.accessNotes?.toLowerCase().indexOf(search) >= 0) return true;
        if (this.addressNotes?.toLowerCase().indexOf(search) >= 0) return true;
        return false;
    }

    isOpenTo(openTo) {
        // If no filter is selected, don't skip any site
        if (openTo === null || openTo.length === 0) return true;

        // If "Tesla" filter is checked, include the site if it's marked as NOT allowing other EVs
        if (openTo.indexOf("1") >= 0 && !this.otherEVs) return true;

        if (this.otherEVs && this.plugs !== null) {
            // If "NACS" filter is checked, include the site if it's marked as allowing other EVs AND has at least one NACS plug
            if (openTo.indexOf("2") >= 0 && this.plugs.nacs > 0) return true;

            // If "Other" filter is checked, include the site if it's marked as allowing other EVs AND has at least one non-Tesla-specific plug other than NACS
            if (openTo.indexOf("3") >= 0 && (this.plugs.ccs1 > 0 || this.plugs.ccs2 > 0 || this.plugs.gbt > 0)) return true;
        }

        return false;
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

    formatPower(prefix) {
        if (Objects.isNullOrUndef(this.powerKilowatt) || this.powerKilowatt === 0) return '';
        return `${prefix}${this.stallType && this.plugType && this.stallType.indexOf('+') < 0 ? '' : '≤ '}${this.powerKilowatt} kW`;
    }

    getStallPlugSummary(useImages, count) {
        count = count ?? this.numStalls;
        if (!this.stalls || !count || count === 0) return '';

        var summary = `<span class="details">${count} ${Strings.upperCaseInitial(this.stallType) ?? ''} `;
        if (this.plugType) {
            summary += useImages ? this.plugImg(this.plugType) : PLUG_DISPLAY[this.plugType];
        } else {
            summary += 'stalls';
        }
        if (this.stalls.accessible === 0 && useImages) summary += ' <img src="/images/no-accessible.svg" title="NOT Accessible"/>';
        if (this.stalls.trailerFriendly === 0 && useImages) summary += ' <img src="/images/no-trailer.svg" title="NOT Trailer-friendly"/>';

        // special cases for the most common multi-connector stalls (MagicDock and CCS2+TYPE2)
        if (this.numStalls === this.plugs?.nacs && this.plugs?.nacs === this.plugs?.ccs1) {
            summary = `<span class="details" title="MagicDock (NACS+CCS1)">${this.numStalls} ${Strings.upperCaseInitial(this.stallType)} ${useImages ? '<img src="/images/NACS.svg"/><img src="/images/CCS1.svg"/>' : 'MagicDock'}</span>`;
        } else if (this.numStalls === this.plugs?.ccs2 && this.plugs?.ccs2 === this.plugs?.type2) {
            summary = `<span class="details" title="Dual-cable CCS2+TYPE2">${this.numStalls} ${Strings.upperCaseInitial(this.stallType)} ${useImages ? '<img src="/images/CCS2.svg"/><img src="/images/TYPE2.svg"/>' : 'CCS2+TYPE2'}</span>`;
        } else {
            summary += '</span>';
        }
        return summary;
    }

    getMarkerTitle() {
        const sitestalls = this.getStallPlugSummary(false);
        return `<div>${this.displayName} (${this.status?.displayName})</div>` +
            (Objects.isNullOrUndef(this.hours) ? "" : `<div class="limited">Hours: ${this.hours}</div>`) +
            (Objects.isNullOrUndef(this.numStalls) || this.numStalls === 0 ? "" : ` • ${sitestalls}`) +
            this.formatPower(' • ');
	}
    
    getShortMarkerTitle() {
        return `• ${this.displayName}` + (this.isUserAdded() ? "" : ` (${this.numStalls || '?'} ${this.stallType && this.plugType ? '@' : '@ ≤'} ${this.powerKilowatt || '?'} kW)`);
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
        if (Objects.isNotNullOrUndef(this.locationId)) {
            var teslaLink = (this.address?.isTeslaCN() ? ServiceURL.TESLA_CN_PAGE : ServiceURL.TESLA_WEB_PAGE) + this.locationId;
            return `<a target='_blank' href='${teslaLink}'><img src="/images/red_dot_t.svg" title="tesla.${this.address?.isTeslaCN() ? 'cn' : 'com'}"/></a>`;
        }
        return '';
    }

    plugImg(plug) {
        return `<img src="/images/${plug.toUpperCase()}.svg" title="${PLUG_DISPLAY[plug]}" alt="${PLUG_DISPLAY[plug]}"/>`;
    }

    getGmapLink() {
        if (Objects.isNotNullOrUndef(this.address.street)) {
            const addr = this.address;
            const query = encodeURI(`${addr.street||''} ${addr.city||''} ${addr.state||''} ${addr.zip||''} ${addr.country||''}`);
            return `<a target="_blank" href="https://www.google.com/maps/search/?api=1&query=${query.replace(/"/g, '%22')}"><img src="/images/gmap.svg" title="Google Map"/></a>`;
        }
    }

    getPlugShareLink(map) {
        var psLink = "https://api.plugshare.com/view/", psClass = "", psTitle = "PlugShare";
        if (this.plugshareId) {
            psLink += `location/${this.plugshareId}`;
        } else {
            var bounds = map?.getBounds();
            var spanLat = Math.min(0.05, Math.abs(bounds?.getNorthEast().lat - bounds?.getSouthWest().lat));
            var spanLng = Math.min(0.05, Math.abs(bounds?.getNorthEast().lng - bounds?.getSouthWest().lng));
            psLink += `map?latitude=${this.location.lat}&longitude=${this.location.lng}&spanLat=${Objects.isNumber(spanLat) ? spanLat : 0.05}&spanLng=${Objects.isNumber(spanLng) ? spanLng : 0.05}`;
            psClass = "faded";
            psTitle += " (map only)";
        }
        return `<a href="${psLink}" target="_blank"><img src="https://developer.plugshare.com/logo.svg" title="${psTitle}" class="${psClass}"/></a>`;
    }

    getOsmLink(map) {
        var osmLink = "https://www.openstreetmap.org/", osmClass = "", osmTitle = "OpenStreetMap";
        if (this.osmId) {
            osmLink += `node/${this.osmId}`;
        } else {
            var zoom = Math.max(15, map?.getZoom());
            osmLink += `#map=${Objects.isNumber(zoom) ? zoom : 15}/${this.location.lat}/${this.location.lng}`;
            osmClass = "faded";
            osmTitle += " (map only)";
        }
        return `<a href="${osmLink}" target="_blank"><img src="/images/osm.svg" title="${osmTitle}" class="${osmClass}"/></a>`;
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
    if (supercharger.stalls && (supercharger.stalls.other ?? 0) === 0) {
        for (const s of BASE_STALLS) {
           if (supercharger.stalls[s] > 0 && !supercharger.stallType) supercharger.stallType = Strings.upperCaseInitial(s);
           else if (supercharger.stalls[s] > 0) supercharger.stallType += '+' + Strings.upperCaseInitial(s);
        }
    }
    supercharger.plugs = jsonObject.plugs;
    if (supercharger.plugs && (supercharger.plugs.other ?? 0) === 0) {
        // For now at least, label every NACS plug as TPC ("Tesla") at all sites that are not marked as open to other EVs
        if (supercharger.plugs?.nacs > 0 && !supercharger.otherEVs) {
            supercharger.plugs.tpc = (supercharger.plugs.tpc ?? 0) + supercharger.plugs.nacs;
            delete supercharger.plugs.nacs;
        }
        for (const p of BASE_PLUGS) {
            // if we already found a plugType and there are more base plugs, get rid of the plugType and stop looking
            if (supercharger.plugs[p] > 0 && supercharger.plugType) {
                delete supercharger.plugType;
                break;
            }
            if (supercharger.plugs[p] === supercharger.numStalls) {
                supercharger.plugType = p;
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
