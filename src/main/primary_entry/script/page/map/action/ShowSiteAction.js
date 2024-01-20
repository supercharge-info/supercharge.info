import EventBus from "../../../util/EventBus";
import MapEvents from "../MapEvents";
import $ from "jquery";
import MapPage from "../../map/MapPage";
import Sites from "../../../site/Sites";
import userConfig from "../../../common/UserConfig";

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
            if (!MapPage.initComplete) {
	            // If we return true here the outer doTimeout will try again in 250ms
	            return true;
			}
			
            EventBus.dispatch(MapEvents.pan_zoom, { latLng: supercharger.location, zoom: 10 });

            /* Now the map is initialized, but the selected marker may not be because we initialize markers
             * in response to viewport changes on the map. */
            $.doTimeout(75, () => {
                if (!MapPage.initViewComplete && performance.now() - t < 10000) {
                    // If we return true here the inner doTimeout will try again in 75ms
                    return true;
                }
                if (supercharger && supercharger.marker) {
                    if (!supercharger.marker.infoWindow || !supercharger.marker.infoWindow.isShown()) {
                        // Do not remove popup if it exists
                        supercharger.marker.fire('click');
                    }
                }
                else if (userConfig.isAnyFilterSet()) {
                	// If there's no marker, clear filters and try again in 75ms
                    EventBus.dispatch("reset-filters");
                    return true;
                }
                return false;
            });
            return false;
        });
    }

}
