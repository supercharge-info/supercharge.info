import ServiceURL from "./ServiceURL";
import Objects from "../util/Objects";
import $ from 'jquery';
import Units from "../util/Units";
import { utils } from "sortablejs";
import Asserts from "../util/Asserts";


/* Save an indication of the last config we persisted so we don't make extra service calls. */
let lastSaved = null;

class UserConfig {

    constructor() {
        /* All fields are primitives currently for easy serialization. */
        this.unit = null;
        this.initFilters(true);

        this.latitude = null;
        this.longitude = null;
        this.zoom = null;
        this.customMarkers = [];

        this.markerType = "Z";
        this.markerSize = 8;
        this.clusterSize = 5;
    }

    initFilters(includeShowAlways) {
        this.filter = {
            changeType: null,
            regionId: null,
            countryId: null,
            state: null,
            status: [],
            stalls: null,
            power: null,
            otherEVs: null
        };
        if (includeShowAlways) {
            this.showAlways = {
                region: true,
                country: false,
                state: false,
                status: true,
                stalls: false,
                power: false,
                otherEVs: false
            };
        }
    };

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // setters -- these should all invoke this.scheduleSave()
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    setUnit(newUnit) {
        this.unit = newUnit.getCode();
        this.scheduleSave();
    };

    setLatLngZoom(lat, lng, zoom) {
        this.latitude = lat;
        this.longitude = lng;
        this.zoom = zoom;
        this.scheduleSave();
    };

    setChangeType(newChangeType) {
        this.filter.changeType = newChangeType;
        this.scheduleSave();
    };

    setRegionId(newRegionId) {
        this.filter.regionId = newRegionId;
        this.scheduleSave();
    };

    setCountryId(newCountryId) {
        this.filter.countryId = newCountryId;
        this.scheduleSave();
    };

    setState(newState) {
        this.filter.state = newState;
        this.scheduleSave();
    };

    setStatus(newStatus) {
        this.filter.status = newStatus;
        this.scheduleSave();
    };

    setStalls(newStalls) {
        this.filter.stalls = newStalls;
        this.scheduleSave();
    };

    setPower(newPower) {
        this.filter.power = newPower;
        this.scheduleSave();
    };

    setOtherEVs(newOtherEVs) {
        this.filter.otherEVs = newOtherEVs;
        this.scheduleSave();
    };

    setMarkerType(newMarkerType) {
        this.markerType = newMarkerType;
        this.scheduleSave();
    };
    
    setMarkerSize(newMarkerSize) {
        this.markerSize = newMarkerSize;
        this.scheduleSave();
    };

    setClusterSize(newClusterSize) {
        this.clusterSize = newClusterSize;
        this.scheduleSave();
    };

    setShowAlways(fieldName, newValue) {
        this.showAlways[fieldName] = newValue;
        this.scheduleSave();
    };

    addCustomMarker(marker) {
        this.customMarkers.push(marker);
        this.scheduleSave();
    };

    removeCustomMarker(name, lat, lng) {
        for (let i = 0; i < this.customMarkers.length; i++) {
            const cm = this.customMarkers[i];
            if (cm.name === name && cm.lat === lat && cm.lng === lng) {
                this.customMarkers.splice(i, 1);
            }
        }
        this.scheduleSave();
    };

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // getters
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    isLocationSet() {
        return Objects.isNotNullOrUndef(this.latitude) && Objects.isNotNullOrUndef(this.longitude);
    };

    isZoomSet() {
        return Objects.isNotNullOrUndef(this.zoom);
    };

    getUnit() {
        return Units.fromString(this.unit);
    };

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // load/save
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    /**
     * Load all config data. This method must be called before any other in this class.
     */
    load() {
        try {
            this.fromJSON(JSON.parse(window.localStorage.getItem("userConfig")));
            lastSaved = toCompString(this);
            console.log("UserConfig.load(local): " + lastSaved);
        } catch {
            console.log("no valid userConfig in localStorage, using defaults");
            window.localStorage.removeItem("userConfig");
        }
        const config = this;
        return $.getJSON(ServiceURL.USER_CONFIG)
            .done((userConfigJson) => {
                if (Objects.isNotNullOrUndef(userConfigJson.zoom) || !config.isZoomSet()) {
                    config.fromJSON(userConfigJson);
                    lastSaved = toCompString(config);
                    console.log("UserConfig.load(user): " + lastSaved);
                }
            })
            .fail(() =>
                console.log("failed to load userConfig from API, falling back to localStorage")
            );
    };

    fromJSON(json) {
        this.unit = json.unit || this.unit;
        this.latitude = json.latitude || this.latitude;
        this.longitude = json.longitude || this.longitude;
        this.zoom = json.zoom || this.zoom;

        this.filter.changeType = json.filter?.changeType || this.filter?.changeType;
        this.filter.regionId   = json.filter?.regionId   || json.dataPageRegionId  || json.changesPageRegionId  || this.filter?.regionId;
        this.filter.countryId  = json.filter?.countryId  || json.dataPageCountryId || json.changesPageCountryId || this.filter?.countryId;
        this.filter.state      = json.filter?.state      || this.filter?.state;
        this.filter.status     = json.filter?.status     || this.filter?.status;
        this.filter.stalls     = json.filter?.stalls     || this.filter?.stalls;
        this.filter.power      = json.filter?.power      || this.filter?.power;
        this.filter.otherEVs =
            typeof json.filter?.otherEVs === 'boolean'
                ? String(json.filter?.otherEVs) 
                : json.filter?.otherEVs || this.filter?.otherEVs;

        this.showAlways.region   = json.showAlways?.region   || this.showAlways?.region;
        this.showAlways.country  = json.showAlways?.country  || this.showAlways?.country;
        this.showAlways.state    = json.showAlways?.state    || this.showAlways?.state;
        this.showAlways.status   = json.showAlways?.status   || this.showAlways?.status;
        this.showAlways.stalls   = json.showAlways?.stalls   || this.showAlways?.stalls;
        this.showAlways.power    = json.showAlways?.power    || this.showAlways?.power;
        this.showAlways.otherEVs = json.showAlways?.otherEVs || this.showAlways?.otherEVs;

        this.customMarkers = json.customMarkers || this.customMarkers;

        this.markerType = json.markerType || this.markerType;
        this.markerSize = json.markerSize || this.markerSize;
        this.clusterSize = json.clusterSize || this.clusterSize;
    };

    save() {
        if (toCompString(this) === lastSaved) {
            console.log("UserConfig.save(): aborting save, nothing changed.");
            return;
        }
        lastSaved = toCompString(this);
        var jsonConfig = JSON.stringify(this);
        window.localStorage.setItem("userConfig", jsonConfig);
        $.ajax({
            url: ServiceURL.USER_CONFIG,
            data: jsonConfig,
            contentType: 'application/json',
            type: 'POST'
        }).done(() => {
            console.log("UserConfig.save(): " + lastSaved);
        })
    };

    /**
     * Don't save in response to every user action. Instead save at most every 2 seconds.
     */
    scheduleSave() {
        const userConfig = this;
        $.doTimeout("saveUserConfigTimerId", 2000, function () {
            userConfig.save();
        });
    };

}

/**
 * To string impl that produces the same string for two equal instances of this class.  We use this to determine
 * if any property values have actually changed. We could just look at the JSON but that has two problems (a) the
 * order of the properties may change; and (b) changes between null and undefined would make the JSON string
 * different when the underlying config is not materially different.
 */
function toCompString(object) {
    let result = "{";
    const props = Objects.propertiesSorted(object);
    for (let i = 0; i < props.length; i++) {
        const key = props[i];
        const value = object[key];
        let valueString = "";
        if (Array.isArray(value)) {
            const vals = value.sort();
            for (let j = 0; j < vals.length; j++) {
                valueString += "," + (typeof vals[j] === "object" ? toCompString(vals[j]) : Objects.nullSafeToString(vals[j]));
            }
            valueString = "[" + valueString.substring(1) + "]";
        } else if (Objects.isNullOrUndef(value) || typeof value !== "object") {
            valueString = Objects.nullSafeToString(value);
        } else {
            valueString = toCompString(value);
        }
        result = result + key + ":" + valueString;
        if (i !== props.length - 1) {
            result += ",";
        }
    }
    return result.toLowerCase() + "}";
}


export default new UserConfig();
