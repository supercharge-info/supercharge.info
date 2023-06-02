import EventBus from "../../../util/EventBus";
import rangeModel from "../RangeModel";
import MapEvents from '../MapEvents'
import mapLayers from '../MapLayers'

export default class ToggleRangeCirclesAction {

    constructor(mapApi) {
        this.mapApi = mapApi;
        EventBus.addListener(MapEvents.toggle_circle, this.toggleCircle, this);
    }

    toggleCircle(event, supercharger) {
        if (rangeModel.getCurrentRange() === 0) {
            rangeModel.setCurrentRange(50);
        }
        if (!supercharger.circle) {
            supercharger.circle = ToggleRangeCirclesAction.buildCircle(supercharger);
            mapLayers.addToOverlay(supercharger.circle)
        }
        else {
            supercharger.circle.remove();
            supercharger.circle = null;
        }
    }

    static buildCircle(supercharger) {
        return L.circle(supercharger.location, {
            color: rangeModel.borderColor,
            opacity: rangeModel.borderOpacity,
            weight: 1,
            fillColor: rangeModel.fillColor,
            fillOpacity: rangeModel.fillOpacity,
            radius: rangeModel.getRangeMeters(),
            clickable: false
        })

    }


}
