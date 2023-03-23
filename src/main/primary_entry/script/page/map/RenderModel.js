import EventBus from "../../util/EventBus";
import userConfig from "../../common/UserConfig";

const CLUSTERSIZE_MIN = 1;
const CLUSTERSIZE_MAX = 9;
const MARKERSIZE_MIN = 4;
const MARKERSIZE_MAX = 10;

class RenderModel {

    init() {
        this.markerType = userConfig.markerType || "Z";
        this.markerSize = userConfig.markerSize || 8;
        this.clusterSize = userConfig.clusterSize || 5;
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
            userConfig.setMarkerType(newMarkerType);
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
            userConfig.setMarkerSize(newSize);
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
            userConfig.setClusterSize(newSize);
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