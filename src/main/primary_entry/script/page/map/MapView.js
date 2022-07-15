import EventBus from "../../util/EventBus";
import Analytics from "../../util/Analytics";
import userConfig from "../../common/UserConfig";
import SiteIterator from "../../site/SiteIterator";
import SitePredicates from "../../site/SitePredicates";
import Sites from "../../site/Sites";
import MapContextMenu from "./context/MapContextMenu";
import MarkerFactory from "./MarkerFactory";
import $ from "jquery";
import L from 'leaflet';
import 'leaflet-control-geocoder';
import mapLayers from './MapLayers'
import RouteEvents from "./route/RouteEvents";
import routeResultModel from './route/RouteResultModel'
import polyline from '@mapbox/polyline'

export default class MapView {

    constructor(lat, lng, initialZoom) {
        this.searchMarker = null;

        this.initMap(lat, lng, initialZoom);
        this.addCustomMarkers();

        $(document).on('click', '.marker-toggle-trigger', $.proxy(this.handleMarkerRemove, this));
        $(document).on('click', '.marker-toggle-all-trigger', $.proxy(this.handleMarkerRemoveAll, this));

        //
        // Map context menu
        //
        new MapContextMenu(this.mapApi);
        //EventBus.addListener(MapEvents.context_menu_add_route, $.proxy(this.handleAddToRouteContextMenu, this));
        EventBus.addListener("way-back-trigger-event", this.setupForWayBack, this);
        EventBus.addListener("places-changed-event", this.handlePlacesChange, this);
        EventBus.addListener(RouteEvents.result_model_changed, this.handleRouteResult, this);

        this.mapApi.on('moveend', $.proxy(this.handleViewportChange, this));
        // draw map for first time.
        this.handleViewportChange();

        // fixes leaflet and webpack not playing nice
        // https://github.com/PaulLeCam/react-leaflet/issues/453#issuecomment-761806673
        delete L.Icon.Default.prototype._getIconUrl;
        L.Icon.Default.mergeOptions({
            iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
            iconUrl: require('leaflet/dist/images/marker-icon.png'),
            shadowUrl: require('leaflet/dist/images/marker-shadow.png')
        });
    }

    //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // Getter/Setter
    //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    /**
     * Delegates to this.mapApi and returns { lat: , lng: } coordinate, but accounting for a weird behavior in
     * the maps API: If the user pans around the globe this.mapApi.getCenter() will return lng values
     * outside of [-180, 180]. Here we takes steps to ensure that the longitude value returned for center is always
     * in [-180,180].
     *
     * Note that this.mapApi.getBounds().getCenter() returns a lng that is always in [-180,180] but for some
     * reason the latitude returned by the function does no exactly equal the current center latitude.  If
     * we use a latitude value that is slightly off each time the map moves up each time the user visits.
     */
    getCenter() {
        return this.mapApi.getCenter().wrap();
    };

    //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // Initialization
    //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    /**
     * Initialize map
     */
    initMap(initialLat, initialLng, initialZoom) {

        // map API
        //
        this.mapApi = L.map('map-canvas', {
            center: [initialLat, initialLng],
            zoom: initialZoom,
            layers: mapLayers.getInitialLayers()
        });

        // layers control
        //
        L.control.layers(mapLayers.getBaseMaps(), mapLayers.getOverlayMaps()).addTo(this.mapApi);

        // geocode (search) control
        //
        L.Control.geocoder().addTo(this.mapApi);

        // scale control TODO: update scale unit when user changes it on profile/UI.
        //
        L.control.scale({
            metric: userConfig.getUnit().isMetric(),
            imperial: !userConfig.getUnit().isMetric(),
            updateWhenIdle: true
        }).addTo(this.mapApi);

        // marker factory
        //
        this.markerFactory = new MarkerFactory(this.mapApi);
    };

    /**
     * Add custom markers from user config to the map.
     */
    addCustomMarkers() {
        const customMarkers = userConfig.customMarkers;
        for (let i = 0; i < customMarkers.length; i++) {
            const cm = customMarkers[i];
            Sites.addCustomSite(cm.name, L.latLng(cm.lat, cm.lng));
        }
    };

    //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // Drawing
    //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    handleViewportChange() {

        const latLngBounds = this.mapApi.getBounds();
        const northEast = latLngBounds.getNorthEast();
        const southWest = latLngBounds.getSouthWest();
        const newNorthEast = L.latLng(northEast.lat + 1, northEast.lng + 2);
        const newSouthWest = L.latLng(southWest.lat - 1, southWest.lng - 2);
        const expandedBounds = L.latLngBounds(newSouthWest, newNorthEast);

        new SiteIterator()
            .withPredicate(SitePredicates.HAS_NO_MARKER)
            .withPredicate(SitePredicates.buildInViewPredicate(expandedBounds))
            .iterate((supercharger) => this.markerFactory.createMarker(supercharger));
        EventBus.dispatch("map-viewport-change-event", latLngBounds);

        const mapCenter = this.getCenter();
        userConfig.setLatLngZoom(mapCenter.lat, mapCenter.lng, this.mapApi.getZoom());
    };

    setupForWayBack() {
        /* Initialize all markers */
        const markerFactory = this.markerFactory;
        new SiteIterator()
            .withPredicate(SitePredicates.HAS_NO_MARKER)
            .iterate((supercharger) => markerFactory.createMarker(supercharger));
        EventBus.dispatch("way-back-start-event");
    };

    handleRouteResult() {
        // We can only display one route at a time, so in any case, remove the existing line on a route model update.
        if (this.routeLine) {
            this.routeLine.removeFrom(this.mapApi);
            this.routeLine.remove();
            this.routeLine = null;
        }
        if (!routeResultModel.isEmpty()) {
            const geomString = routeResultModel.getBestRoute().geometry;
            const geomArray = polyline.decode(geomString);
            this.routeLine = L.polyline(geomArray, {
                color: '#3388ff',
                weight: 6,
                opacity: 0.75
            }).addTo(this.mapApi);
            this.mapApi.fitBounds(this.routeLine.getBounds());
        }
    }

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // InfoWindow Event handlers
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    handleMarkerRemove(event) {
        event.preventDefault();
        const id = parseInt($(event.target).attr('href'));
        const supercharger = Sites.getById(id);
        this.removeCustomMarker(supercharger);
        Analytics.sendEvent("route", "remove-custom-marker");
    };

    handleMarkerRemoveAll(event) {
        event.preventDefault();
        const toRemoveList = [];
        new SiteIterator()
            .withPredicate(SitePredicates.USER_ADDED)
            .iterate(function (supercharger) {
                    toRemoveList.push(supercharger);
                }
            );
        for (let i = 0; i < toRemoveList.length; i++) {
            this.removeCustomMarker(toRemoveList[i]);
        }
        Analytics.sendEvent("route", "remove-custom-marker");
    };

    removeCustomMarker(supercharger) {
        if (supercharger.marker) {
            supercharger.marker.remove();
        }
        if (supercharger.circle) {
            supercharger.circle.remove();
        }
        Sites.removeById(supercharger.id);
        userConfig.removeCustomMarker(supercharger.displayName, supercharger.location.lat, supercharger.location.lng);
        userConfig.removeCustomMarker(supercharger.displayName, supercharger.location.lat, supercharger.location.lng);
    };

    handlePlacesChange(event, places) {

        if (places.length === 0) {
            return;
        }

        if (this.searchMarker) {
            this.searchMarker.remove();
        }

        // For each place, get the icon, name and location.
        const bounds = L.latLngBounds();
        const mapView = this;
        const map = this.mapApi;
        places.forEach((place) => {
            if (place.geometry) {
                // Create a marker for each place.
                mapView.searchMarker = new google.maps.Marker({
                    map: map,
                    position: place.geometry.location
                });

                if (place.geometry.viewport) {
                    // Only geocodes have viewport.
                    bounds.union(place.geometry.viewport);
                } else {
                    bounds.extend(place.geometry.location);
                }
            }
        });
        this.mapApi.fitBounds(bounds);
    };

}
