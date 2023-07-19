import EventBus from "../../../util/EventBus";
import rangeModel from "../RangeModel";
import SiteIterator from "../../../site/SiteIterator";
import SitePredicates from "../../../site/SitePredicates";

export default class CircleRedrawAction {

    constructor(mapApi) {
        this.mapApi = mapApi;
        EventBus.addListener("range-model-range-changed-event", this.redrawCircles, this);
    }

    redrawCircles() {
        new SiteIterator()
            .withPredicate(SitePredicates.HAS_CIRCLE)
            .iterate((supercharger) => {
                    supercharger.circle.setRadius(rangeModel.getRangeMeters());
                    supercharger.circle.setStyle({
                        color: rangeModel.borderColor,
                        opacity: rangeModel.borderOpacity,
                        weight: 1,
                        fillColor: rangeModel.fillColor,
                        fillOpacity: rangeModel.fillOpacity
                    });
                }
            );
    }

}