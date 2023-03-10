import EventBus from "../../util/EventBus";

const CLUSTERSIZE_MIN = 1;
const CLUSTERSIZE_MAX = 9;
const MARKERSIZE_MIN = 4;
const MARKERSIZE_MAX = 10;

class RenderModel {

    constructor() {
        this.markerType = window.localStorage.getItem("markerType") || "Z";
        this.markerSize = window.localStorage.getItem("markerSize") || 8;
        this.clusterSize = window.localStorage.getItem("clusterSize") || 5;
    }

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // marker type
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    getMarkerType() {
        return this.markerType;
    }

    setMarkerType(newMarkerType) {
        //console.log("SMT " + this.markerType + " -> " + newMarkerType);
        if (newMarkerType != this.markerType) {
            this.markerType = newMarkerType;
            window.localStorage.setItem("markerType", newMarkerType);
            this.fireMarkerTypeChangedEvent();
        }
    }

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // marker size
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    getCurrentMarkerSize() {
        return this.markerSize;
    }

    setCurrentMarkerSize(newSize) {
        if (newSize != this.markerSize) {
            this.markerSize = newSize;
            window.localStorage.setItem("markerSize", newSize);
            this.fireMarkerSizeChangedEvent();
        }
    }

    getMinMarkerSize() {
        return MARKERSIZE_MIN;
    }

    getMaxMarkerSize() {
        return MARKERSIZE_MAX;
    }

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // cluster size
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    getCurrentClusterSize() {
        return this.clusterSize;
    }

    setCurrentClusterSize(newSize) {
        if (newSize != this.clusterSize) {
            this.clusterSize = newSize;
            window.localStorage.setItem("clusterSize", newSize);
            this.fireClusterSizeChangedEvent();
        }
    }

    getMinClusterSize() {
        return CLUSTERSIZE_MIN;
    }

    getMaxClusterSize() {
        return CLUSTERSIZE_MAX;
    }

    //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // events
    //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    fireMarkerTypeChangedEvent() {
        EventBus.dispatch("render-model-markertype-changed-event");
    }

    fireMarkerSizeChangedEvent() {
        EventBus.dispatch("render-model-markersize-changed-event");
    }

    fireClusterSizeChangedEvent() {
        EventBus.dispatch("render-model-clustersize-changed-event");
    }
}

export default new RenderModel();