import ServiceURL from "./ServiceURL";
import Objects from "../util/Objects";
import $ from 'jquery';
import Units from "../util/Units";


/* Save an indication of the last config we persisted so we don't make extra service calls. */
let lastSaved = null;

class UserConfig {

    constructor() {
        /* All fields are primitives currently for easy serialization. */
        this.unit = null;
        this.initFilters();
        this.initShowAlways();

        this.latitude = null;
        this.longitude = null;
        this.zoom = null;
        this.customMarkers = [];

        this.markerType = "Z";
        this.markerSize = 8;
        this.clusterSize = 5;
    }

    initFilters() {
        this.filter = {
            changeType: null,
            regionId: null,
            countryId: null,
            state: [],
            status: [],
            stalls: null,
            power: null,
            openTo: [],
            stallType: [],
            plugType: [],
            parking: [],
            solar: null,
            battery: null,
            search: null
        };
    }

    initShowAlways() {
        this.showAlways = {
            region: false,
            country: false,
            state: false,
            status: true,
            stalls: false,
            power: false,
            openTo: false,
            stallType: false,
            plugType: false,
            parking: false,
            solar: false,
            battery: false,
            search: true
        };
    }

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // setters -- these should all invoke this.scheduleSave()
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    setUnit(newUnit) {
        this.unit = newUnit.getCode();
        this.scheduleSave();
    }

    setLatLngZoom(lat, lng, zoom) {
        this.latitude = lat;
        this.longitude = lng;
        this.zoom = zoom;
        this.scheduleSave();
    }

    setChangeType(newChangeType) {
        this.filter.changeType = newChangeType;
        this.scheduleSave();
    }

    setRegionId(newRegionId) {
        this.filter.regionId = newRegionId;
        this.scheduleSave();
    }

    setCountryId(newCountryId) {
        this.filter.countryId = newCountryId;
        this.scheduleSave();
    }

    setState(newState) {
        this.filter.state = newState;
        this.scheduleSave();
    }

    setStatus(newStatus) {
        this.filter.status = newStatus;
        this.scheduleSave();
    }

    setStalls(newStalls) {
        this.filter.stalls = newStalls;
        this.scheduleSave();
    }

    setPower(newPower) {
        this.filter.power = newPower;
        this.scheduleSave();
    }

    setOpenTo(newOpenTo) {
        this.filter.openTo = newOpenTo;
        this.scheduleSave();
    }

    setStallType(newStallType) {
        this.filter.stallType = newStallType;
        this.scheduleSave();
    }

    setPlugType(newPlugType) {
        this.filter.plugType = newPlugType;
        this.scheduleSave();
    }

    setParking(newParking) {
        this.filter.parking = newParking;
        this.scheduleSave();
    }

    setSolar(newSolar) {
        this.filter.solar = newSolar;
        this.scheduleSave();
    }

    setBattery(newBattery) {
        this.filter.battery = newBattery;
        this.scheduleSave();
    }

    setSearch(newSearch) {
        this.filter.search = newSearch;
        this.scheduleSave();
    }

    setMarkerType(newMarkerType) {
        this.markerType = newMarkerType;
        this.scheduleSave();
    }
    
    setMarkerSize(newMarkerSize) {
        this.markerSize = newMarkerSize;
        this.scheduleSave();
    }

    setClusterSize(newClusterSize) {
        this.clusterSize = newClusterSize;
        this.scheduleSave();
    }

    setShowAlways(fieldName, newValue) {
        this.showAlways[fieldName] = newValue;
        this.scheduleSave();
    }

    addCustomMarker(marker) {
        this.customMarkers.push(marker);
        this.scheduleSave();
    }

    removeCustomMarker(name, lat, lng) {
        for (let i = 0; i < this.customMarkers.length; i++) {
            const cm = this.customMarkers[i];
            if (cm.name === name && cm.lat === lat && cm.lng === lng) {
                this.customMarkers.splice(i, 1);
            }
        }
        this.scheduleSave();
    }

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // getters
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    isLocationSet() {
        return Objects.isNotNullOrUndef(this.latitude) && Objects.isNotNullOrUndef(this.longitude);
    }

    isZoomSet() {
        return Objects.isNotNullOrUndef(this.zoom);
    }

    getUnit() {
        return Units.fromString(this.unit);
    }

    isAnyFilterSet() {
        return this.filter.changeType !== null
            || this.filter.regionId !== null
            || this.filter.countryId !== null
            || this.filter.state.length > 0
            || this.filter.status.length> 0
            || this.filter.stalls !== null
            || this.filter.power !== null
            || this.filter.openTo.length > 0
            || this.filter.stallType.length > 0
            || this.filter.plugType.length > 0
            || this.filter.parking > 0
            || this.filter.solar !== null
            || this.filter.battery !== null
            || this.filter.search !== null;
    }

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
    }

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
        this.filter.stallType  = json.filter?.stallType  || this.filter?.stallType;
        this.filter.plugType   = json.filter?.plugType   || this.filter?.plugType;
        this.filter.parking    = json.filter?.parking    || this.filter?.parking;
        this.filter.openTo     = json.filter?.openTo     || this.filter?.openTo;
        this.filter.solar      = typeof json.filter?.solar === 'boolean'
            ? String(json.filter?.solar) 
            : json.filter?.solar || this.filter?.solar;
        this.filter.battery    = typeof json.filter?.battery === 'boolean'
            ? String(json.filter?.battery) 
            : json.filter?.battery || this.filter?.battery;
        this.filter.search     = json.filter?.search     || this.filter?.search;

        this.showAlways.region    = json.showAlways?.region    || this.showAlways?.region;
        this.showAlways.country   = json.showAlways?.country   || this.showAlways?.country;
        this.showAlways.state     = json.showAlways?.state     || this.showAlways?.state;
        this.showAlways.status    = json.showAlways?.status    || this.showAlways?.status;
        this.showAlways.stalls    = json.showAlways?.stalls    || this.showAlways?.stalls;
        this.showAlways.power     = json.showAlways?.power     || this.showAlways?.power;
        this.showAlways.stallType = json.showAlways?.stallType || this.showAlways?.stallType;
        this.showAlways.plugType  = json.showAlways?.plugType  || this.showAlways?.plugType;
        this.showAlways.parking   = json.showAlways?.parking   || this.showAlways?.parking;
        this.showAlways.openTo    = json.showAlways?.openTo    || this.showAlways?.openTo;
        this.showAlways.solar     = json.showAlways?.solar     || this.showAlways?.solar;
        this.showAlways.battery   = json.showAlways?.battery   || this.showAlways?.battery;
        this.showAlways.search    = json.showAlways?.search    || this.showAlways?.search;

        this.customMarkers = json.customMarkers || this.customMarkers;

        this.markerType = json.markerType || this.markerType;
        this.markerSize = json.markerSize || this.markerSize;
        this.clusterSize = json.clusterSize || this.clusterSize;
    }

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
        });
    }

    /**
     * Don't save in response to every user action. Instead save at most every 2 seconds.
     */
    scheduleSave() {
        const userConfig = this;
        $.doTimeout("saveUserConfigTimerId", 2000, function () {
            userConfig.save();
        });
    }

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
