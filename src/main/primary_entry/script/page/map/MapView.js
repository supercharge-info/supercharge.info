import EventBus from "../../util/EventBus";
import Analytics from "../../util/Analytics";
import Objects from "../../util/Objects";
import userConfig from "../../common/UserConfig";
import SiteIterator from "../../site/SiteIterator";
import SitePredicates from "../../site/SitePredicates";
import Sites from "../../site/Sites";
import MapViewContextMenu from "./MapViewContextMenu";
import MarkerFactory from "./MarkerFactory";
import RoutingWaypoint from "./route/RoutingWaypoint";
import $ from "jquery";
import Events from "../../util/Events";
import RouteEvents from "./route/RouteEvents";


export default class MapView {

    constructor(lat, lng, initialZoom) {
        this.viewDiv = $("#map-canvas");
        this.searchMarker = null;

        this.initMap(lat, lng, initialZoom);
        this.addCustomMarkers();

        // handle clicks to toggle supercharger circle
        $(document).on('click', '.circle-toggle-trigger', $.proxy(this.handleCircleToggle, this));
        // handle clicks to remove supercharger marker
        $(document).on('click', '.marker-toggle-trigger', $.proxy(this.handleMarkerRemove, this));
        $(document).on('click', '.marker-toggle-all-trigger', $.proxy(this.handleMarkerRemoveAll, this));
        // handle clicks to remove supercharger marker
        $(document).on('click', '.add-to-route-trigger', $.proxy(this.handleAddToRoute, this));
        // handle clicks to remove supercharger marker
        $(document).on('click', '.zoom-to-site-trigger', $.proxy(this.zoomToMarker, this));

        //
        // Map context menu
        //
        new MapViewContextMenu(this.googleMap);
        EventBus.addListener("context-menu-add-to-route-event", $.proxy(this.handleAddToRouteContextMenu, this));

        EventBus.addListener("status-model-changed-event", this.handleStatusModelChange, this);
        EventBus.addListener("range-model-range-changed-event", this.redrawCircles, this);
        EventBus.addListener("render-model-changed-event", this.redrawCircles, this);
        EventBus.addListener("way-back-trigger-event", this.setupForWayBack, this);
        EventBus.addListener("places-changed-event", this.handlePlacesChange, this);

        google.maps.event.addListener(this.googleMap, 'idle', $.proxy(this.handleViewportChange, this));
    }


    //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // Getter/Setter
    //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    /**
     * Delegates to this.googleMap and returns { lat: , lng: } coordinate, but accounting for a weird behavior in
     * the google maps API: If the user pans around the globe this.googleMap.getCenter() will return lng values
     * outside of [-180, 180]. Here we takes steps to ensure that the longitude value returned for center is always
     * in [-180,180].
     *
     * Note that this.googleMap.getBounds().getCenter() returns a lng that is always in [-180,180] but for some
     * reason the latitude returned by the function does no exactly equal the current center latitude.  If
     * we use a latitude value that is slightly off each time the map moves up each time the user visits.
     */
    getCenter() {
        const center = this.googleMap.getCenter();
        return new google.maps.LatLng(center.lat(), this.googleMap.getCenter().lng(), false);
    };

    //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // Initialization
    //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    /**
     * Initialize map
     */
    initMap(initialLat, initialLng, initialZoom) {

        const mapOptions = {
            center: new google.maps.LatLng(initialLat, initialLng),
            zoom: initialZoom,
            scaleControl: true,
            mapTypeControl: true,
            streetViewControl: false,
            mapTypeControlOptions: {
                mapTypeIds: [google.maps.MapTypeId.SATELLITE, google.maps.MapTypeId.ROADMAP, google.maps.MapTypeId.HYBRID, google.maps.MapTypeId.TERRAIN],
                style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR
            },
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };

        this.googleMap = new google.maps.Map(this.viewDiv.get(0), mapOptions);

        this.markerFactory = new MarkerFactory(this.googleMap);
    };

    /**
     * Add custom markers from user config to the map.
     */
    addCustomMarkers() {
        const customMarkers = userConfig.customMarkers;
        for (let i = 0; i < customMarkers.length; i++) {
            const cm = customMarkers[i];
            Sites.addCustomSite(cm.name, new google.maps.LatLng(cm.lat, cm.lng));
        }
    };

    //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // Drawing
    //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    handleViewportChange(event) {

        const latLngBounds = this.googleMap.getBounds();
        const northEast = latLngBounds.getNorthEast();
        const southWest = latLngBounds.getSouthWest();
        const newNorthEast = new google.maps.LatLng(northEast.lat() + 4, northEast.lng() + 8);
        const newSouthWest = new google.maps.LatLng(southWest.lat() - 4, southWest.lng() - 8);
        const expandedBounds = new google.maps.LatLngBounds(newSouthWest, newNorthEast);

        const markerFactory = this.markerFactory;
        new SiteIterator()
            .withPredicate(SitePredicates.HAS_NO_MARKER)
            .withPredicate(SitePredicates.buildInViewPredicate(expandedBounds))
            .iterate(function (supercharger) {
                    markerFactory.createMarker(supercharger);
                }
            );
        EventBus.dispatch("map-viewport-change-event", latLngBounds);

        const mapCenter = this.getCenter();
        userConfig.setLatLngZoom(mapCenter.lat(), mapCenter.lng(), this.googleMap.getZoom());
    };

    handleStatusModelChange(event) {
        new SiteIterator()
            .withPredicate(SitePredicates.HAS_MARKER)
            .withPredicate(SitePredicates.NOT_USER_ADDED)
            .iterate(function (supercharger) {
                const visible = MarkerFactory.shouldBeVisible(supercharger);
                supercharger.marker.setVisible(visible);
                supercharger.circle.setVisible(visible && supercharger.circleOn);
                if (Objects.isNotNullOrUndef(supercharger.marker.infoWindow)) {
                    supercharger.marker.infoWindow.close();
                    supercharger.marker.infoWindow = null;
                }
            });
    };

    setAllRangeCircleVisibility(isVisible) {
        new SiteIterator()
            .iterate(function (supercharger) {
                    supercharger.circleOn = isVisible;
                    if (supercharger.marker && supercharger.marker.visible) {
                        supercharger.circle.setVisible(isVisible);
                    }
                }
            );
    };

    redrawCircles() {
        const rangeCircleOptions = this.markerFactory.buildRangeCircleOptions();

        new SiteIterator()
            .withPredicate(SitePredicates.HAS_MARKER)
            .iterate(function (supercharger) {
                    rangeCircleOptions.center = supercharger.location;
                    supercharger.circle.setOptions(rangeCircleOptions);
                }
            );
    };

    setupForWayBack() {
        /* Initialize all markers */
        const markerFactory = this.markerFactory;
        new SiteIterator()
            .withPredicate(SitePredicates.HAS_NO_MARKER)
            .iterate(function (supercharger) {
                    markerFactory.createMarker(supercharger);
                }
            );
        EventBus.dispatch("way-back-start-event");
    };


    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // InfoWindow Event handlers
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    handleCircleToggle(event) {
        const eventDetail = Events.eventDetail(event);
        const id = parseInt(eventDetail.actionName);
        const supercharger = Sites.getById(id);
        if (supercharger.circle.getVisible()) {
            eventDetail.link.text("circle on");
            supercharger.circle.setVisible(false);
            supercharger.circleOn = false;
            Analytics.sendEvent("map", "turn-off-single-circle");
        } else {
            eventDetail.link.text("circle off");
            supercharger.circle.setVisible(true);
            supercharger.circleOn = true;
            Analytics.sendEvent("map", "turn-on-single-circle");
        }
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
            supercharger.circle.setMap(null);
            supercharger.marker.setMap(null);
        }
        Sites.removeById(supercharger.id);
        userConfig.removeCustomMarker(supercharger.displayName, supercharger.location.lat(), supercharger.location.lng());
        userConfig.removeCustomMarker(supercharger.displayName, supercharger.location.lat(), supercharger.location.lng());
    };

    handleAddToRoute(event) {
        const eventDetail = Events.eventDetail(event);
        const id = parseInt(eventDetail.actionName);
        const supercharger = Sites.getById(id);
        EventBus.dispatch(RouteEvents.add_waypoint, new RoutingWaypoint(supercharger.location, supercharger.displayName));
        Analytics.sendEvent("route", "add-marker-to-route", "pop up");
    };

    zoomToMarker(event) {
        const eventDetail = Events.eventDetail(event);
        const id = parseInt(eventDetail.actionName);
        const supercharger = Sites.getById(id);

        this.googleMap.setZoom(15);
        this.googleMap.panTo(supercharger.location);
    };

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // Context menu handlers.
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    handleAddToRouteContextMenu(event, currentLatLng) {
        EventBus.dispatch(RouteEvents.add_waypoint, new RoutingWaypoint(currentLatLng, "Custom Location"));
        Analytics.sendEvent("route", "add-marker-to-route", "context menu");
    };

    handlePlacesChange(event, places) {

        if (places.length === 0) {
            return;
        }

        if (this.searchMarker) {
            this.searchMarker.setMap(null);
        }

        // For each place, get the icon, name and location.
        const bounds = new google.maps.LatLngBounds();
        const mapView = this;
        const map = this.googleMap;
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
        this.googleMap.fitBounds(bounds);
    };

}