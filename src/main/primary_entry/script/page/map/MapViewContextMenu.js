import $ from 'jquery';
import EventBus from '../../util/EventBus';


/* Browser context menu is already disabled on google map, but not on our context menu. Draw context menu with slight
 offset so that we don't get the browser context menu ON our context menu. */
const DRAW_OFFSET_PX = 5;


export default class MapViewContextMenu {

    constructor(googleMap) {
        this.mapCanvas = $('#map-canvas');
        this.googleMap = googleMap;
        this.contextMenuDiv = MapViewContextMenu.createMenu(this.googleMap.getDiv());
        this.showStartTime = 0;

        const menu = this;
        this.contextMenuDiv.on("click", function (event) {
            event.preventDefault();
            event.stopPropagation();
            const targetClass = $(event.target).attr('class');
            menu.hide();
            EventBus.dispatch(targetClass + '-event', menu.currentLatLng);
        });

        google.maps.event.addListener(this.googleMap, 'rightclick', $.proxy(this.show, this));
        google.maps.event.addListener(this.googleMap, 'click', $.proxy(this.hideConditionally, this));

        google.maps.event.addListener(this.googleMap, 'mousedown', $.proxy(this.mousedown, this));
        google.maps.event.addListener(this.googleMap, 'mouseup', $.proxy(this.mouseup, this));
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
    };

    mouseup(event) {
        $(this).doTimeout('detect-long-click');
    };

    //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    //
    //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    /**
     * Hide context menu.
     */
    hide() {
        this.contextMenuDiv.hide();
        this.showStartTime = 0;
    };

    /**
     * Hide context menu (if visible already for > 900ms)
     */
    hideConditionally() {
        const elapsedTime = new Date().getTime() - this.showStartTime;
        if (elapsedTime > 900) {
            this.hide();
        }
    };

    /**
     * Show context menu at some lat/lon.
     */
    show(event) {
        this.currentLatLng = event.latLng;
        const mapWidth = this.mapCanvas.width();
        const mapHeight = this.mapCanvas.height();
        const menuWidth = this.contextMenuDiv.width();
        const menuHeight = this.contextMenuDiv.height();
        const clickedPosition = this.getCanvasXY(this.currentLatLng);
        let x = clickedPosition.x;
        let y = clickedPosition.y;

        //if to close to the map border, decrease x position
        if ((mapWidth - x ) < menuWidth) {
            x = x - menuWidth;
        }
        //if to close to the map border, decrease y position
        if ((mapHeight - y ) < menuHeight) {
            y = y - menuHeight;
        }

        this.contextMenuDiv.css('left', x + DRAW_OFFSET_PX);
        this.contextMenuDiv.css('top', y + DRAW_OFFSET_PX);
        this.contextMenuDiv.show();
        this.showStartTime = new Date().getTime();
    };

    getCanvasXY(currentLatLng) {
        const scale = Math.pow(2, this.googleMap.getZoom());
        const nw = new google.maps.LatLng(
            this.googleMap.getBounds().getNorthEast().lat(),
            this.googleMap.getBounds().getSouthWest().lng()
        );
        const worldCoordinateNW = this.googleMap.getProjection().fromLatLngToPoint(nw);
        const worldCoordinate = this.googleMap.getProjection().fromLatLngToPoint(currentLatLng);
        return new google.maps.Point(
            Math.floor((worldCoordinate.x - worldCoordinateNW.x) * scale),
            Math.floor((worldCoordinate.y - worldCoordinateNW.y) * scale)
        );
    };

    //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // class methods
    //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    static createMenu(parentDiv) {
        const contextMenuList = $(
            "<ul class='dropdown-menu' id='navbar-dropdown-menu-item-list'>" +
            "<li><a href='' class='context-menu-add-marker'>Add custom marker...</a></li>" +
            "<li><a href='' class='context-menu-add-to-route'>Add to route...</a></li> " +
            "</ul>"
        );
        contextMenuList.hide();
        $(parentDiv).append(contextMenuList);
        return contextMenuList;
    };

}