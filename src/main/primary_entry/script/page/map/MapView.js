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
import rangeModel from "./RangeModel";

export default class MapView {

    constructor(lat, lng, initialZoom) {
        this.searchMarker = null;

        this.initMap(lat, lng, initialZoom);
        this.zoom = initialZoom;
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
        EventBus.addListener("viewport-changed-event", this.handleViewportChange, this);
        EventBus.addListener("remove-all-markers-event", this.removeAllMarkers, this);
        
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

        var markerSizeConfig = rangeModel.markerSizes || userConfig.markerSizes;
        var oldZoom = this.zoom;
        this.zoom = this.mapApi.getZoom();

        if (markerSizeConfig === "C") {
            this.createClusteredMarkers(expandedBounds, oldZoom);
        } else if (markerSizeConfig === "Z") {
            var oldMarkerSize = this.getMarkerSizeByZoom(oldZoom);
            var newMarkerSize = this.getMarkerSizeByZoom(this.zoom);
            if (oldMarkerSize !== newMarkerSize) this.removeAllMarkers();
            this.createConstantSizeMarkers(expandedBounds, newMarkerSize);
        } else { 
            // markerSizeConfig represents a constant marker size (S, M, or L), but default to L if we see an unexpected value
            if ("SML".indexOf(markerSizeConfig) < 0) markerSizeConfig = "L";
            this.createConstantSizeMarkers(expandedBounds, markerSizeConfig);
        }

        EventBus.dispatch("map-viewport-change-event", latLngBounds);

        const mapCenter = this.getCenter();
        userConfig.setLatLngZoom(mapCenter.lat, mapCenter.lng, this.zoom);
    };

    removeAllMarkers() {
        var t = performance.now(), removed = 0;
        new SiteIterator()
        .withPredicate(SitePredicates.HAS_MARKER)
        .iterate((supercharger) => {
            supercharger.marker.remove();
            supercharger.marker = null;
            removed++;
        });
        console.log("zoom=" + this.zoom + " removed=" + removed + " t=" + (performance.now() - t));
    };

    getMarkerSizeByZoom = (zoom) => zoom >= 11 ? "L" : (zoom >= 7 ? "M" : "S");

    createClusteredMarkers(bounds, oldZoom) {
        var t = performance.now(), newZoom = this.zoom, created = 0;
        // Cluster aggressively through zoom level 8, then much less aggressively from 9 to 14
        const overlapRadius = [
            5, 3.2, 1.6, 0.8, 0.4,
            0.18, 0.11, 0.08, 0.035, 0.012,
            0.004, 0.002, 0.001, 0.0005, 0.0001,
            0, 0, 0, 0, 0
        ];
        if (oldZoom !== newZoom) {
            // clear old markers when zooming in/out
            this.removeAllMarkers();
        }
        if (newZoom < oldZoom) {
            // reset clustering ability of sites when zooming out (and zooming to 0 always resets)
            new SiteIterator()
                .withPredicate(SitePredicates.buildCanClusterPredicate(Math.max(newZoom, 1)))
                .iterate((s) => { s.clusterMaxZoom = 19; });
        }
        const radius = overlapRadius[this.zoom] * rangeModel.getCurrentDensity();
        new SiteIterator()
            .withPredicate(SitePredicates.HAS_NO_MARKER)
            .withPredicate(SitePredicates.buildInViewPredicate(bounds))
            .iterate((s1) => {
                if (s1.marker === null || s1.marker === undefined) { // gotta check again because one site might set another site's marker
                    var overlapSites = [s1];
                    if (s1.clusterMaxZoom >= newZoom) {
                        const s1Lat = s1.location.lat, s1Lng = s1.location.lng;
                        var s1Bounds = L.latLngBounds(L.latLng(s1Lat - radius, s1Lng - radius), L.latLng(s1Lat + radius, s1Lng + radius));
                        new SiteIterator()
                            .withPredicate(SitePredicates.buildInViewPredicate(s1Bounds))
                            .withPredicate(SitePredicates.buildCanClusterPredicate(newZoom))
                            .iterate((s2) => {
                                if (s1 !== s2 && s1.status === s2.status && ((s2.marker === null || s2.marker === undefined)) && overlapSites.length < 999) {
                                    var x = s1Lat - s2.location.lat, y = s1Lng - s2.location.lng, dist = Math.sqrt(x*x + y*y);
                                    if (dist > 0 && dist < radius) {
                                        overlapSites.push(s2);
                                    }
                                }
                            });
                    }
                    this.markerFactory.createMarkerCluster(overlapSites, this.zoom);
                    created++;
                }
            });
        console.log("zoom=" + newZoom + " created=" + created + " t=" + (performance.now() - t));
    };

    createConstantSizeMarkers(bounds, markerSize) {
        var t = performance.now(), created = 0;
        new SiteIterator()
            .withPredicate(SitePredicates.HAS_NO_MARKER)
            .withPredicate(SitePredicates.buildInViewPredicate(bounds))
            .iterate((supercharger) => {
                this.markerFactory.createMarker(supercharger, markerSize);
                created++;
            });
        console.log("zoom=" + this.zoom + " created=" + created + " markers=" + markerSize + " t=" + (performance.now() - t));
    };

    setupForWayBack() {
        /* Initialize all markers */
        const markerFactory = this.markerFactory;
        new SiteIterator()
            .withPredicate(SitePredicates.HAS_NO_MARKER)
            .iterate((supercharger) => markerFactory.createMarker(supercharger, this.getMarkerSizeByZoom(this.Zoom)));
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
    };

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
            if (supercharger.marker.popup) {
                supercharger.marker.popup.remove();
            }
            supercharger.marker.remove();
        }
        if (supercharger.circle) {
            supercharger.circle.remove();
        }
        Sites.removeById(supercharger.id);
        userConfig.removeCustomMarker(supercharger.displayName, supercharger.location.lat, supercharger.location.lng);
        userConfig.removeCustomMarker(supercharger.displayName, supercharger.location.lat, supercharger.location.lng);
    };

}
