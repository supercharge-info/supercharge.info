import $ from 'jquery';
import EventBus from '../../../util/EventBus';
import L from 'leaflet';
import MapEvents from '../MapEvents';
import RouteEvents from "../route/RouteEvents";
import RoutingWaypoint from "../route/RoutingWaypoint";
import Analytics from "../../../util/Analytics";

export default class MapContextMenu {

    constructor(mapApi) {
        this.mapApi = mapApi;

        this.mapApi.on('contextmenu', $.proxy(this.show, this));

        //TODO: this.mapApi.on('mousedown', $.proxy(this.mousedown, this));
        //TODO: this.mapApi.on('mouseup', $.proxy(this.mouseup, this));

        const map = mapApi;

        $(document).on('click', '.context-menu-add-marker', (event) => {
            event.preventDefault();
            EventBus.dispatch(MapEvents.context_menu_add_marker, this.popup.getLatLng());
        });

        $(document).on('click', '.context-menu-add-to-route', (event) => {
            event.preventDefault();
            EventBus.dispatch(RouteEvents.add_waypoint, new RoutingWaypoint(this.popup.getLatLng(), "Custom Location"));
            Analytics.sendEvent("route", "add-marker-to-route", "context menu");
        });

        $(document).on('click', '.context-menu-gmap', (event) => {
            var center = this.popup.getLatLng();
            event.target.href = `https://www.google.com/maps/@?api=1&map_action=map&center=${center.lat},${center.lng}&zoom=${map.getZoom()}`;
            event.target.target = "_blank";
            this.popup.close();
        });

        $(document).on('click', '.context-menu-plugshare', (event) => {
            var center = this.popup.getLatLng();
            var spanLat = Math.abs(map.getBounds().getNorthEast().lat - map.getBounds().getSouthWest().lat);
            var spanLng = Math.abs(map.getBounds().getNorthEast().lng - map.getBounds().getSouthWest().lng);
            event.target.href = `https://www.plugshare.com/?latitude=${center.lat}&longitude=${center.lng}&spanLat=${spanLat}&spanLng=${spanLng}`;
            event.target.target = "_blank";
            this.popup.close();
        });

        $(document).on('click', '.context-menu-osm', (event) => {
            var center = this.popup.getLatLng();
            event.target.href = `https://www.openstreetmap.org/#map=${map.getZoom()}/${center.lat}/${center.lng}`;
            event.target.target = "_blank";
            this.popup.close();
        });

    }


    //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // Detect long-click (on tables, phones, etc)
    //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    mousedown(event) {
        const contextMenu = this;
        $(this).doTimeout('detect-long-click', 3000, function () {
            contextMenu.show(event);
        });
        return true;
    }

    mouseup(event) {
        $(this).doTimeout('detect-long-click');
    }

    //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    //
    //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    /**
     * Hide context menu.
     */
    hide() {
        this.popup.remove();
    }

    /**
     * Show context menu at some lat/lon.
     */
    show(event) {
        event.latlng.lat = Math.round(event.latlng.lat * 1000000) / 1000000;
        event.latlng.lng = Math.round(event.latlng.lng * 1000000) / 1000000;
        this.popup = L.popup()
            .setLatLng(event.latlng)
            .setContent(this.createMenu(event.latlng))
            .openOn(this.mapApi);
    }

    //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // class methods
    //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    createMenu(center) {
        return `<div>
                    <ul class='context-menu'>
                        <li><a href='' class='context-menu-gmap'>Google Map here</a></li>
                        <li><a href='' class='context-menu-plugshare'>PlugShare Map here</a></li>
                        <li><a href='' class='context-menu-osm'>OpenStreetMap here</a></li>
                        <li><a href='' class='context-menu-add-marker'>Add custom marker...</a></li>
                        <li><a href='' class='context-menu-add-to-route'>Add to route...</a></li>
                    </ul>
                    <hr/>
                    <b>GPS</b> ${center.lat}, ${center.lng}
                </div>`;
    }

}
