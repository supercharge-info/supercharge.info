import EventBus from "../../../util/EventBus";
import MapEvents from "../MapEvents";
import $ from "jquery";
import MapPage from "../../map/MapPage";
import Sites from "../../../site/Sites";

/**
 * Show a location on the map page. Even if the map is not the current page.
 *
 * Since this action should listen to events before the map page has been initialized it MUST be instantiated before
 * the map page is initialized.
 */
export default class ShowSiteAction {

    constructor() {
        EventBus.addListener(MapEvents.show_location, this.showSite, this);
    }

    showSite(event, clickedSiteId) {
        var t = performance.now();

        // Change page to the map page.
        EventBus.dispatch("nav-change-page-event", 'map');

        const supercharger = Sites.getById(clickedSiteId);

        /*
         * If user navigated directly to changes page then map page may not be initialized yet.  Wait for it.
         *
         * We can't just call the logic of the PanZoom action here because it uses a mapApi object to do its
         * thing which may not be initialized yet.
         */
        $.doTimeout(250, () => {
            if (!MapPage.initComplete && performance.now() - t < 10000) {
                // If we return true here the outer doTimeout will try again in 250ms
                //console.log(`${supercharger.id} waiting for initComplete`);
                return true;
            }

            //console.log(`${supercharger.id} calling pan_zoom`);
            EventBus.dispatch(MapEvents.pan_zoom, { latLng: supercharger.location, zoom: 10 });

            /* Now the map is initialized, but the selected marker may not be because we initialize markers
             * in response to viewport changes on the map. */
            $.doTimeout(100, () => {
                if (supercharger?.marker?.infoWindow?.isShown()) {
                    //console.log(`${supercharger.id} infowindow shown - DONE`);
                    return false;
                }

                if (!MapPage.initViewComplete && performance.now() - t < 15000) {
                    // If we return true here the inner doTimeout will try again in 125ms
                    //console.log(`${supercharger.id} waiting for initViewCompelte`);
                    return true;
                }

                if (supercharger) {
                    //console.log(`${supercharger.id} calling pinSite`);
                    EventBus.dispatch("pin-site-event", supercharger);
                }

                //console.log(`${supercharger.id} inner retry`);
                return true;
            });
            return false;
        });
    }

}
