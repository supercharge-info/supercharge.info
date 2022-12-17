import EventBus from "../../../util/EventBus";
import rangeModel from "../RangeModel";
import SiteIterator from "../../../site/SiteIterator";
import SitePredicates from "../../../site/SitePredicates";
import ToggleRangeCirclesAction from './ToggleRangeCircleAction'

export default class ToggleRangeCircleAllAction {
    constructor(mapApi) {
        this.mapApi = mapApi;

        EventBus.addListener("circles-all-on-event", this.circlesAllOn, this);
        EventBus.addListener("circles-all-off-event", this.circlesAllOff, this);
    }

    circlesAllOn() {
        if (rangeModel.getCurrentRange() === 0) {
            rangeModel.setCurrentRange(50);
        }
        new SiteIterator()
            .withPredicate(SitePredicates.HAS_NO_CIRCLE)
            .iterate((supercharger) => {
                    if (supercharger.marker) {
                        supercharger.circle = ToggleRangeCirclesAction.buildCircle(supercharger);
                        supercharger.circle.addTo(this.mapApi)
                    }
                }
            );
    }

    circlesAllOff() {
        new SiteIterator()
            .withPredicate(SitePredicates.HAS_CIRCLE)
            .iterate((supercharger) => {
                    if (supercharger.marker) {
                        supercharger.circle.remove();
                        supercharger.circle = null;
                    }
                }
            );
    }

}
