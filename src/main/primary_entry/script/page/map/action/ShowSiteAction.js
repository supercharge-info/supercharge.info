import EventBus from "../../../util/EventBus";
import MapEvents from "../MapEvents";
import $ from "jquery";
import MapPage from "../../map/MapPage";
import Sites from "../../../site/Sites";
import Objects from "../../../util/Objects";


/**
 * Show a location on the map page. Even if the map is not the current page.
 *
 * Since this action should listen to events before the map page has been initialized it MUST be instantiated before
 * the map page is initialized.
 */
export default class ShowSiteAction {

    constructor() {
        EventBus.addListener(MapEvents.show_location, this.showSite, this)
    }

    showSite(event, clickedSiteId) {
        // Change page to the map page.
        EventBus.dispatch("nav-change-page-event", 'map');

        const supercharger = Sites.getById(clickedSiteId);

        /*
         * If user navigated directly to changes page then map page may not be initialized yet.  Wait for it.
         *
         * We cant just call the logic of the PanZoom action here because it uses a googleMap object to do its
         * thing which may not bee initialized yet.
         */
        $.doTimeout(75, function () {
            if (MapPage.initComplete) {

                EventBus.dispatch(MapEvents.pan_zoom, {latLng: supercharger.location, zoom: 10});

                /* Now the map is initialized, but the selected marker may not be because we initialize markers
                 * in response to viewport changes on the map. */
                $.doTimeout(75, function () {
                    if (Objects.isNotNullOrUndef(supercharger.marker)) {
                        new google.maps.event.trigger(supercharger.marker, 'click');
                        return false;
                    }
                    else {
                        // If we return true here the timeout will try again in 75ms
                        return true;
                    }
                });
                return false;
            } else {
                // If we return true here the timeout will try again in 75ms
                return true;
            }
        });
    }

}
