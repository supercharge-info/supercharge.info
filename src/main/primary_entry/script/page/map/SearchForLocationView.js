import EventBus from "../../util/EventBus";
import $ from "jquery";

export default class SearchForLocationView {

    constructor() {
        const locationInput = $("#search-for-location-input");

        locationInput.on('keypress', function (event) {
            if (event.keyCode === 13) {
                event.preventDefault();
            }
        });

        const searchBox = new google.maps.places.SearchBox(locationInput.get(0));

        searchBox.addListener('places_changed', () => {
            const places = searchBox.getPlaces();
            EventBus.dispatch('places-changed-event', places);
        });

    }

};