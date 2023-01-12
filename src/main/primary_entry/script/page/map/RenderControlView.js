import EventBus from "../../util/EventBus";
import Analytics from "../../util/Analytics";
import RangeInput from "./RangeInput";
import renderModel from "./RenderModel";
import controlVisibleModel from "./ControlVisibleModel";
import $ from "jquery";

export default class RenderControlView {

    constructor() {
        this.markerLabels = {
            "Z": $("#marker-z-label"),
            "C": $("#marker-c-label"),
            "F": $("#marker-f-label")
        };
        this.markerSliders = {
            "C": $("#marker-c-slider"),
            "F": $("#marker-f-slider")
        };

        this.initMarkerType();
        this.initClusterSizeSlider();
        this.initMarkerSizeSlider();
        this.handleVisibilityModelChange();
        EventBus.addListener("render-model-markertype-changed-event", this.handleMarkerTypeChange, this);
        EventBus.addListener("render-model-clustersize-changed-event", this.handleClusterSizeChange, this);
        EventBus.addListener("render-model-markersize-changed-event", this.handleMarkerSizeChange, this);
        EventBus.addListener("control-visible-model-changed-event", this.handleVisibilityModelChange, this);
    }

    initMarkerType() {
        const control = this;
        for (var markerLabel in this.markerLabels) {
            const ml = markerLabel;
            this.markerLabels[ml].click(function () {
                renderModel.setMarkerType(ml);
                Analytics.sendEvent("map", "change-marker-type", ml);
            });
        }
        this.updateMarkerType();
    }

    initClusterSizeSlider() {
        this.clusterSizeSlider = new RangeInput("#clustersize-slider", "#clustersize-number-text",
            renderModel.getMinClusterSize(),
            renderModel.getMaxClusterSize(),
            1,
            renderModel.getCurrentClusterSize());

        this.clusterSizeSlider.on("range-change-event", function (event, newSize) {
            renderModel.setCurrentClusterSize(newSize);
        });
    }

    initMarkerSizeSlider() {
        this.markerSizeSlider = new RangeInput("#markersize-slider", "#markersize-number-text",
            renderModel.getMinMarkerSize(),
            renderModel.getMaxMarkerSize(),
            1,
            renderModel.getCurrentMarkerSize());

        this.markerSizeSlider.on("range-change-event", function (event, newSize) {
            renderModel.setCurrentMarkerSize(newSize);
        });
    }

    //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // Handlers for various UI component changes
    //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    updateMarkerType() {
        var markerType = renderModel.getMarkerType();

        for (var markerLabel in this.markerLabels) {
            this.markerLabels[markerLabel]?.removeClass("active");
        }
        this.markerLabels[markerType]?.addClass("active");

        for (var markerSlider in this.markerSliders) {
            this.markerSliders[markerSlider]?.removeClass("active");
        }
        this.markerSliders[markerType]?.addClass("active");
        EventBus.dispatch("viewport-changed-event");
    }

    handleMarkerTypeChange() {
        this.updateMarkerType();
    }

    updateClusterSizeSlider() {
        this.clusterSizeSlider.setMin(renderModel.getMinClusterSize());
        this.clusterSizeSlider.setMax(renderModel.getMaxClusterSize());
        this.clusterSizeSlider.setValue(renderModel.getCurrentClusterSize());
        EventBus.dispatch("remove-all-markers-event");
        EventBus.dispatch("viewport-changed-event");
    }

    handleClusterSizeChange() {
        //console.log("set ClusterSize to " + renderModel.getCurrentClusterSize())
        this.updateClusterSizeSlider();
    }

    updateMarkerSizeSlider() {
        this.markerSizeSlider.setMin(renderModel.getMinMarkerSize());
        this.markerSizeSlider.setMax(renderModel.getMaxMarkerSize());
        this.markerSizeSlider.setValue(renderModel.getCurrentMarkerSize());
        var z = renderModel.getCurrentMarkerSize() * 2;
        document.getElementsByClassName("sample-marker").forEach(function (e) { e.width = z; e.height = z; })
        EventBus.dispatch("viewport-changed-event");
    }

    handleMarkerSizeChange() {
        //console.log("set MarkerSize to " + renderModel.getCurrentMarkerSize())
        this.updateMarkerSizeSlider();
    }

    handleVisibilityModelChange() {
        $("#control-row-rendering").toggle(controlVisibleModel.renderControlVisible);
    };

}