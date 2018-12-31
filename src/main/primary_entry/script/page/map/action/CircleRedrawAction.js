import EventBus from "../../../util/EventBus";
import rangeModel from "../RangeModel";
import renderModel from "../RenderModel";
import SiteIterator from "../../../site/SiteIterator";
import SitePredicates from "../../../site/SitePredicates";

export default class CircleRedrawAction {

    constructor(mapApi) {
        this.mapApi = mapApi;
        EventBus.addListener("range-model-range-changed-event", this.redrawCircles, this);
        EventBus.addListener("render-model-changed-event", this.redrawCircles, this);
    }

    redrawCircles() {
        new SiteIterator()
            .withPredicate(SitePredicates.HAS_CIRCLE)
            .iterate((supercharger) => {
                    supercharger.circle.setRadius(rangeModel.getRangeMeters());
                    supercharger.circle.setStyle({
                        color: renderModel.borderColor,
                        opacity: renderModel.borderOpacity,
                        weight: 1,
                        fillColor: renderModel.fillColor,
                        fillOpacity: renderModel.fillOpacity
                    })
                }
            );
    };

}