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

        this.changesPageRegionId = null;
        this.changesPageCountryId = null;
        this.dataPageRegionId = null;
        this.dataPageCountryId = null;

        this.latitude = null;
        this.longitude = null;
        this.zoom = null;
        this.markerType = "Z";
        this.customMarkers = [];
    }

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

    setMarkerType(markerType) {
        this.markerType = markerType;
        this.scheduleSave();
    }

    setRegionCountryId(page, whichSelect, newValue) {
        if (page === "changes") {
            if (whichSelect === "region") {
                this.changesPageRegionId = newValue;
            } else if (whichSelect === "country") {
                this.changesPageCountryId = newValue;
            }
        } else if (page === "data") {
            if (whichSelect === "region") {
                this.dataPageRegionId = newValue;
            } else if (whichSelect === "country") {
                this.dataPageCountryId = newValue;
            }
        }
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
     * Load all sites data.  This method must be called before any other in this class.
     */
    load() {
        const config = this;
        return $.getJSON(ServiceURL.USER_CONFIG).done(
            function (userConfigJson) {

                config.unit = userConfigJson.unit;
                config.latitude = userConfigJson.latitude;
                config.longitude = userConfigJson.longitude;
                config.zoom = userConfigJson.zoom;
                config.markerType = userConfigJson.markerType || "Z";

                config.changesPageRegionId = userConfigJson.changesPageRegionId;
                config.changesPageCountryId = userConfigJson.changesPageCountryId;
                config.dataPageRegionId = userConfigJson.dataPageRegionId;
                config.dataPageCountryId = userConfigJson.dataPageCountryId;

                config.customMarkers = userConfigJson.customMarkers;

                lastSaved = toCompString(config);
                console.log("UserConfig.load(): " + lastSaved);
            }
        );
    };

    save() {
        if (toCompString(this) === lastSaved) {
            console.log("UserConfig.save(): aborting save, nothing changed.");
            return;
        }
        lastSaved = toCompString(this);
        $.ajax({
            url: ServiceURL.USER_CONFIG,
            data: JSON.stringify(this),
            contentType: 'application/json',
            type: 'POST'
        }).done(() => {
            console.log("UserConfig.save(): " + lastSaved);
        })
    };

    /**
     * Don't save in response to every user action. Instead save at most every N seconds.
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
            valueString = valueString + "[";
            for (let j = 0; j < value.length; j++) {
                valueString = valueString + toCompString(value[j]);
                if (j !== value.length - 1) {
                    valueString = valueString + ",";
                }
            }
            valueString = valueString + "]";
        } else {
            valueString = Objects.nullSafeToString(value);
        }
        result = result + key + ":" + valueString;
        if (i !== props.length - 1) {
            result += ",";
        }
    }
    return result.toLowerCase() + "}";
}


export default new UserConfig();