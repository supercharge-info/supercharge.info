import EventBus from "../../util/EventBus";
import Analytics from "../../util/Analytics";
import QueryStrings from "../../common/QueryStrings";
import userConfig from "../../common/UserConfig";
import TotalCountPanel from "./TotalCountPanel";
import StatusControlView from "./StatusControlView";
import RangeControlView from "./RangeControlView";
import WayBackAction from "./action/WayBackAction";
import ToggleRangeCirclesAction from "./action/ToggleRangeCirclesAction";
import ControlToggleAction from "./action/ControlToggleAction";
import StatusSelectionAction from "./action/StatusSelectionAction";
import PanZoomAction from "./action/PanZoomAction";
import RoutingAction from "./route/RoutingAction";
import CreateLinkAction from "./action/CreateLinkAction";
import AddCustomMarkerAction from "./action/AddCustomMarkerAction";
import MapView from "./MapView";
import RenderControlView from "./RenderControlView";
import SearchForLocationView from "./SearchForLocationView";
import RoutingPanel from "./route/RoutingPanel";
import rangeModel from "./RangeModel";
import $ from "jquery";
import "../../lib/jquery.doTimeout";


export default class MapPage {

    /**
     * Note that part of the map page initialization takes place asynchronously (after user acknowledges or blocks
     * geolocation prompt). We use MapPage.initStarted, MapPage.initViewStarted, MapView.initComplete.
     */
    onPageShow() {
        if (!MapPage.initStarted) {
            this.initialize();
            MapPage.initStarted = true;
        }
        $("#navbar-map-dropdown").show();
        $("#navbar-map-search").show();
        $("#total-count-table").show();

        //TODO 2017/5/25 - quick fix for existing tesla browser.  Need to see how the site behaves after the next browser update and determine if a long term fix is needed
        if (navigator.userAgent.indexOf('AppleWebKit/534.34') !== -1) {
            $("#page-control").remove();
            $("#routing-panel").remove();
            $("#routing-panel-toggle-button").remove();
            $("#map-canvas").css('margin', '0');
        }
    };

    onPageHide() {
        $("#navbar-map-dropdown").hide();
        $("#navbar-map-search").hide();
        $("#total-count-table").hide();
    };

    initialize() {

        new RenderControlView();
        new StatusControlView();
        new RangeControlView();
        new SearchForLocationView();
        new RoutingPanel();
        new TotalCountPanel();

        /* CASE 1: User has explicitly specified initial map center via 'Center' URL param. */
        if (QueryStrings.isCenterSet()) {
            this.initializeAtDefault();
            Analytics.sendEvent('map', 'geolocation', 'user-provided-center');
        }
        /* CASE 2: We have a location from UserConfig. */
        else if (userConfig.isLocationSet()) {
            console.log("initializing map with lat/lng from userConfig: " + userConfig.latitude + "," + userConfig.longitude);
            this.initializeAt(userConfig.latitude, userConfig.longitude);
        }
        /* CASE 3: We can get initial map center from geolocation API. */
        else if (navigator.geolocation) {

            /* Some users don't know how to acknowledge geolocation prompt, do it for them after timeout. */
            const mapPage = this;
            $.doTimeout('show-map-anyway', 6000, function () {
                mapPage.initializeAtDefault();
                Analytics.sendEvent('map', 'geolocation', 'timeout');
            });

            const successCallback = $.proxy(this.geoLocationSuccess, this);
            const errorCallback = $.proxy(this.geoLocationError, this);
            navigator.geolocation.getCurrentPosition(successCallback, errorCallback);
        }
        /* CASE 4: geolocation API is not available */
        else {
            this.initializeAtDefault();
            Analytics.sendEvent('map', 'geolocation', 'not-available');
        }
    };

    geoLocationSuccess(position) {
        const newLat = position.coords.latitude;
        const newLng = position.coords.longitude;
        this.initializeAt(newLat, newLng);
    };

    // PositionError: https://developer.mozilla.org/en-US/docs/Web/API/PositionError
    // 1    PERMISSION_DENIED
    // 2    POSITION_UNAVAILABLE
    // 3    TIMEOUT
    geoLocationError(positionError) {
        this.initializeAtDefault();
        Analytics.sendEvent('map', 'geolocation', 'error_' + positionError.code);
    };

    initializeAtDefault() {
        const INITIAL_CENTER = QueryStrings.getCenter();
        this.initializeAt(INITIAL_CENTER.latitude, INITIAL_CENTER.longitude);
    };

    initializeAt(lat, lng) {

        /* Cancel the timeout */
        $.doTimeout('show-map-anyway');

        /* Don't draw twice if timer finishes and THEN user allows geolocation. */
        if (MapPage.initViewStarted) {
            return;
        }
        MapPage.initViewStarted = true;

        let initialZoom = QueryStrings.getZoom();
        if (!QueryStrings.isZoomSet() && userConfig.isZoomSet()) {
            initialZoom = userConfig.zoom;
        }

        this.mapView = new MapView(lat, lng, initialZoom);

        if (!QueryStrings.isRangeUnitSet()) {
            rangeModel.setDisplayUnit(userConfig.getUnit());
        }

        new RoutingAction(this.mapView.googleMap);
        new WayBackAction(this.mapView.googleMap);
        new ToggleRangeCirclesAction(this.mapView);
        new ControlToggleAction();
        new StatusSelectionAction();
        new PanZoomAction(this.mapView.googleMap);
        new CreateLinkAction(this.mapView.googleMap);
        new AddCustomMarkerAction(this.mapView);

        if (QueryStrings.getWayBack()) {
            EventBus.dispatch("way-back-trigger-event");
        }

        MapPage.initComplete = true;
    };

}