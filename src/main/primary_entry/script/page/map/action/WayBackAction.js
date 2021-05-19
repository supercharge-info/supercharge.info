import EventBus from "../../../util/EventBus";
import Numbers from "../../../util/Numbers";
import Objects from "../../../util/Objects";
import ServiceURL from "../../../common/ServiceURL";
import SiteIterator from "../../../site/SiteIterator";
import SiteSorting from "../../../site/SiteSorting";
import SitePredicates from "../../../site/SitePredicates";
import MapLayers from "../MapLayers";
import $ from "jquery";

const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const MONTH_NAMES_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];


export default class WayBack {

    constructor(mapApi) {
        this.mapApi = mapApi;
        this.lastInfoWindow = null;
        this.index = -1;
        this.wayBackContainer = $("#way-back-container");
        this.delay = 7;

        $("#way-back-close-trigger").click($.proxy(this.stop, this));
        $("#way-back-fast").click($.proxy(this.faster, this));
        $("#way-back-slow").click($.proxy(this.slower, this));
        $("#way-back-mute").click($.proxy(this.toggleSound, this));

        EventBus.addListener("way-back-start-event", this.start, this);
    };


    faster(event) {
        if (this.delay > 1) {
            this.delay -= 1;
        }
        $("#way-back-delay").text("delay:" + this.delay);
    };

    slower(event) {
        if (this.delay < 10) {
            this.delay += 1;
        }
        $("#way-back-delay").text("delay:" + this.delay);
    };

    /*
     * Stop animation.
     */
    stop(event) {
        if (Objects.isNotNullOrUndef(event)) {
            event.preventDefault();
        }
        this.index = 99999;
        this.wayBackContainer.hide();
        if (Objects.isNotNullOrUndef(this.lastInfoWindow)) {
            this.mapApi.closePopup(this.lastInfoWindow);
            this.lastInfoWindow = null;
        }
        if (Objects.isNotNullOrUndef(this.sound)) {
            this.sound.pause();
            this.sound = null;
        }
    };

    /**
     * Start animation.
     */
    start() {
        this.mapApi.setZoom(3);
        EventBus.dispatch("hide-all-control-event");
        this.wayBackContainer.show();
        this.wayBackContainer.css('opacity', '1.0');
        this.index = -1;
        this.dateDiv = $("#way-back-date");
        this.updateSoundButtonText();

        this.superchargers = new SiteIterator()
            .withSort(SiteSorting.BY_OPENED_DATE)
            .withPredicate(SitePredicates.IS_OPEN_AND_COUNTED)
            .toArray();

        Object.values(MapLayers.getOverlayMaps()).forEach(function (l) {
            this.mapApi.removeLayer(l);
        }, this);
        this.doNext();
    };

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    showNextDate() {
        const supercharger = this.superchargers[this.index];
        const dateOpened = supercharger.dateOpened;
        this.dateDiv.html(
            dateOpened.getFullYear() + "&nbsp;" + MONTH_NAMES[dateOpened.getMonth()]
        );
    };

    showNextMarker() {
        const supercharger = this.superchargers[this.index];
        supercharger.marker.addTo(this.mapApi);
    };

    showNextInfoWindow() {
        const supercharger = this.superchargers[this.index];

        const dateOpened = supercharger.dateOpened;
        const dateString = MONTH_NAMES_SHORT[dateOpened.getMonth()] + " " + dateOpened.getDate() + ", " + dateOpened.getFullYear();
        const infoWindow = this.mapApi.openPopup("<div class='way-back-info'>" +
                                        "<div class='title'>" + supercharger.displayName + "</div>" +
                                        "<div class='date'>" + dateString + "</div>" +
                                        "<div>", supercharger.location);
        this.lastInfoWindow = infoWindow;
    };


    doNext() {
        this.index++;
        if (this.index < this.superchargers.length) {
            this.showNextDate();
            this.showNextInfoWindow();
            this.showNextMarker();
            let effectiveDelay = this.delay * 250;
            if (this.index === 0) {
                effectiveDelay = 3000;
            }
            setTimeout($.proxy(this.doNext, this), effectiveDelay);
        } else {
            this.fadeOut();
        }
    };

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    toggleSound() {
        if (Objects.isNullOrUndef(this.sound)) {
            const songFile = ServiceURL.STATIC_CONTENT + "/wayback/" + Numbers.getRandomInt(1, 6) + ".mp3";
            this.sound = new Audio(songFile);
            this.sound.loop = true;
            this.sound.play();
        } else {
            this.sound.muted = !this.sound.muted;
        }
        this.updateSoundButtonText();
    };

    updateSoundButtonText() {
        if (Objects.isNullOrUndef(this.sound) || this.sound.muted) {
            $("#mute-button-label").text(" Sound On");
        } else {
            $("#mute-button-label").text(" Sound Off");
        }
    };

    fadeOut() {
        if (!Objects.isNullOrUndef(this.sound)) {
            const wayBack = this;
            const theSound = this.sound;
            this.wayBackContainer.animate({opacity: 0}, {
                duration: 9000,
                step: function (now, fx) {
                    theSound.volume = now;
                },
                complete: function () {
                    wayBack.stop();
                }
            });
        }
    };

}

