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
import renderModel from "./RenderModel";
import MapEvents from "./MapEvents";
//import TotalCountPanel from "./TotalCountPanel";

export default class MapView {

    constructor(lat, lng, initialZoom) {
        this.searchMarker = null;

        this.initMap(lat, lng, initialZoom);
        this.zoom = initialZoom;
        this.markerType = "Z";
        this.markerSize = 10;
        this.markerIconRule = null;
        this.addCustomMarkers();

        $(document).on('click', '.marker-toggle-trigger', $.proxy(this.handleMarkerRemove, this));
        $(document).on('click', '.marker-toggle-all-trigger', $.proxy(this.handleMarkerRemoveAll, this));

        // this works around stacking context issues with Leaflet controls (zoom, layers, search)
        // which would otherwise appear on top of filter dropdowns
        $(document).on('show.bs.select', $.proxy(this.hideLeafletControls, this));
        $(document).on('hide.bs.select', $.proxy(this.showLeafletControls, this));
        
        // this works around a bug related to the navbar expand/collapse animation on mobile
        $('#navbar').on('hidden.bs.collapse', $.proxy(this.handleViewportChange, this));

        //
        // Map context menu
        //
        new MapContextMenu(this.mapApi);
        //EventBus.addListener(MapEvents.context_menu_add_route, $.proxy(this.handleAddToRouteContextMenu, this));
        EventBus.addListener("way-back-trigger-event", this.setupForWayBack, this);
        EventBus.addListener("places-changed-event", this.handlePlacesChange, this);
        EventBus.addListener(RouteEvents.result_model_changed, this.handleRouteResult, this);
        EventBus.addListener("viewport-changed-event", this.handleViewportChange, this);
        EventBus.addListener("markersize-changed-event", this.updateMarkerSize, this);
        EventBus.addListener("remove-all-markers-event", this.removeAllMarkers, this);
        EventBus.addListener("zoom-to-site-event", this.handleZoomToSite, this);
        
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

        // Uncomment for debugging region/country bounds
        //Object.values(TotalCountPanel.ALL).forEach(bounds => {
        //    L.rectangle(bounds, { color: "#ff7800", weight: 1}).addTo(this.mapApi);
        //});
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
     * reason the latitude returned by the function does not exactly equal the current center latitude.  If
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
            layers: mapLayers.getInitialLayers(),
            preferCanvas: false
        });
        const markerPane = this.mapApi.createPane('markers');
        this.mapApi.on('zoomstart', function (e) {
            markerPane.style.opacity = 0.2;
        });
        this.mapApi.on('zoomend', function (e) {
            markerPane.style.opacity = 1;
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
        this.mapApi.invalidateSize();
        const latLngBounds = this.mapApi.getBounds();
        const northEast = latLngBounds.getNorthEast();
        const southWest = latLngBounds.getSouthWest();
        const newNorthEast = L.latLng(northEast.lat + 1, northEast.lng + 2);
        const newSouthWest = L.latLng(southWest.lat - 1, southWest.lng - 2);
        const expandedBounds = L.latLngBounds(newSouthWest, newNorthEast);

        var oldMarkerType = this.markerType;
        this.markerType = renderModel.markerType;
        var oldZoom = this.zoom;
        this.zoom = this.mapApi.getZoom();

        // clean up InfoWindows when switching between clustered and non-clustered
        if ((this.markerType === "C") !== (oldMarkerType === "C")) {
            MarkerFactory.CloseAllOpenUnpinnedInfoWindows();
            this.removeAllMarkers(false);
        }

        if (this.markerType === "C") {
            this.createClusteredMarkers(expandedBounds, oldZoom);
        } else if (this.markerType === "Z") {
            var newMarkerSize = this.getMarkerSizeByZoom(this.zoom);
            this.createIndividualMarkers(expandedBounds, newMarkerSize);
        } else {
        	// markerType represents a fixed marker size (4-10)
            this.createIndividualMarkers(expandedBounds, renderModel.getCurrentMarkerSize());
        }

        EventBus.dispatch("map-viewport-change-event", latLngBounds);

        const mapCenter = this.getCenter();
        userConfig.setLatLngZoom(mapCenter.lat, mapCenter.lng, this.zoom);

        var resultCount = new SiteIterator()
                .withPredicate(SitePredicates.buildInViewPredicate(L.latLngBounds(southWest, northEast)))
                .withPredicate(SitePredicates.buildUserFilterPredicate(userConfig.filter))
                .count();

        var resultSpan = $("#map-result-count");
        resultSpan.html(`<span class="shrink">Showing </span>${resultCount} site${resultCount === 1 ? "" : "s"}`);
        resultSpan.attr("class", resultCount === 0 ? "zero-sites" : "site-results");
        resultSpan.attr("title", resultCount === 0 ? "No sites displayed. Adjust or reset filters, zoom out, or move the map to see more." : "");
    };

    removeAllMarkers(saveInfoWindows) {
        var t = performance.now(), removed = 0, infoWindows = [];
        if (saveInfoWindows) {
            // get all open unpinned InfoWindows
            new SiteIterator()
                .withPredicate(SitePredicates.HAS_SHOWN_UNPINNED_INFO_WINDOW)
                .iterate((s) => {
                    //console.log("saving info for site " + s.id);
                    infoWindows.push(s.marker.infoWindow);
                });
        }
        // Remove markers from Leaflet
        $(".leaflet-marker-icon").remove();
        // Remove markers from the supercharger objects themselves
        new SiteIterator()
        .withPredicate(SitePredicates.HAS_MARKER)
        .iterate((supercharger) => {
            supercharger.marker.remove();
            supercharger.marker = null;
            removed++;
        });
        console.log(`zoom=${this.zoom} removed=${removed} t=${(performance.now() - t)}`);
        return infoWindows;
    };

    restoreInfoWindows(infoWindows) {
        for (var i in infoWindows) {
            var iw = infoWindows[i], s = iw.supercharger, m = iw.marker;
            if (s.marker === null) {
                iw.closeWindow();
            } else if (s.marker !== m) {
                s.marker.infoWindow = iw;
                iw.showWindow();
            } else {
                iw.showWindow();
            }
        }
    };

    getMarkerSizeByZoom = (zoom) => zoom < 4 ? 4 : zoom > 16 ? 10 : Math.ceil(zoom / 2) + 2;

    createClusteredMarkers(bounds, oldZoom) {
        var t = performance.now(), newZoom = this.zoom, created = 0, infoWindows = [];
        // Cluster aggressively through zoom level 8, then much less aggressively from 9 to 14
        const overlapRadius = [
            5, 3.2, 1.6, 0.8, 0.4,
            0.18, 0.11, 0.08, 0.035, 0.012,
            0.004, 0.002, 0.001, 0.0005, 0.0001,
            0, 0, 0, 0, 0
        ];
        this.updateMarkerSize(8);
        if (oldZoom !== newZoom) {
            // clear old cluster markers when zooming in/out
            infoWindows = this.removeAllMarkers(true);
        }
        const radius = overlapRadius[this.zoom] * renderModel.getCurrentClusterSize();
        const markers = [];
        new SiteIterator()
            .withPredicate(SitePredicates.HAS_NO_MARKER)
            .withPredicate(SitePredicates.buildInViewPredicate(bounds))
            .withPredicate(SitePredicates.buildUserFilterPredicate(userConfig.filter))
            .iterate((s1) => {
                if (s1.marker === null || s1.marker === undefined) { // gotta check again because one site might set another site's marker
                    var overlapSites = [s1];
                    const s1Lat = s1.location.lat, s1Lng = s1.location.lng;
                    var s1Bounds = L.latLngBounds(L.latLng(s1Lat - radius, s1Lng - radius), L.latLng(s1Lat + radius, s1Lng + radius));
                    new SiteIterator()
                        .withPredicate(SitePredicates.buildInViewPredicate(s1Bounds))
                        .withPredicate(SitePredicates.buildUserFilterPredicate(userConfig.filter))
                        .iterate((s2) => {
                            if (s1 !== s2 && s1.status === s2.status && ((s2.marker === null || s2.marker === undefined)) && overlapSites.length < 999) {
                                var x = s1Lat - s2.location.lat, y = s1Lng - s2.location.lng, dist = Math.sqrt(x*x + y*y);
                                if (dist > 0 && dist < radius) {
                                    overlapSites.push(s2);
                                }
                            }
                        });
                    markers.push(this.markerFactory.createMarkerCluster(overlapSites, this.zoom, true));
                    created++;
                }
            });
        
        mapLayers.addGroupToOverlay(markers);
        this.restoreInfoWindows(infoWindows);
        console.log(`zoom=${newZoom} created=${created} clusters=${renderModel.getCurrentClusterSize()} t=${(performance.now() - t)}`);
    };

    createIndividualMarkers(bounds, newMarkerSize) {
        var t = performance.now(), created = 0, infoWindows = [];
        if (this.markerSize !== newMarkerSize) {
            this.updateMarkerSize(newMarkerSize);
        }
        const markers = [];
        new SiteIterator()
            .withPredicate(SitePredicates.HAS_NO_MARKER)
            .withPredicate(SitePredicates.buildInViewPredicate(bounds))
            .withPredicate(SitePredicates.buildUserFilterPredicate(userConfig.filter))
            .iterate((supercharger) => {
                markers.push(this.markerFactory.createMarker(supercharger, newMarkerSize, true));
                created++;
            });
        mapLayers.addGroupToOverlay(markers);
        this.restoreInfoWindows(infoWindows);
        console.log(`zoom=${this.zoom} created=${created} markers=${newMarkerSize} t=${(performance.now() - t)}`);
    };

    updateMarkerSize(markerSize) {
        this.markerSize = markerSize;
        new SiteIterator()
            .withPredicate(SitePredicates.HAS_MARKER)
            .iterate((supercharger) => {
                if (supercharger.marker.setRadius) supercharger.marker.setRadius(markerSize * supercharger.getMarkerMultiplier());
            });
        var samples = $(".sample-markers img.open");
        samples.width(markerSize * 2);
        samples.height(markerSize * 2);
        samples = $(".sample-markers img.construction");
        samples.width(markerSize * 2.4);
        samples.height(markerSize * 2.4);
        samples.css("marginBottom", markerSize * -0.4);
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

    handleZoomToSite(event, data) {
        const newZoom = (this.zoom > 14 && this.zoom < 19 ? 19 : 15);
        EventBus.dispatch(MapEvents.pan_zoom, { latLng: data.supercharger.location, zoom: newZoom });
    };

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

    hideLeafletControls() {
        $('.leaflet-control-container').addClass('hidden');
    }
    showLeafletControls() {
        $('.leaflet-control-container').removeClass('hidden');
    }
}
