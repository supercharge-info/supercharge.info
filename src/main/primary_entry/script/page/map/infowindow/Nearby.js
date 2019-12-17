import Events from "../../../util/Events";
import $ from "jquery";
import Objects from "../../../util/Objects";


export default class Nearby {

    handleNearbySearch(event) {
        const renderer = this;
        const placesService = new google.maps.places.PlacesService(renderer.mapApi);

        const eventDetail = Events.eventDetail(event);
        if (parseInt(eventDetail.actionName) === renderer.supercharger.id) {
            renderer.toggleDetails(false);
            renderer.toggleNearby();

            renderer.popup.setContent(renderer.buildHtmlContent());

            if (renderer.showNearby) {
                const nearbyDetail = $("div#nearby-details-" + this.supercharger.id);
                renderer.restaurantsElement = nearbyDetail.find(".nearby_restaurants");
                renderer.storesElement = nearbyDetail.find(".nearby_stores");
                renderer.lodgingsElement = nearbyDetail.find(".nearby_lodgings");

                $(renderer.restaurantsElement).html();
                $(renderer.storesElement).html();
                $(renderer.lodgingsElement).html();

                placesService.nearbySearch({
                    location: renderer.supercharger.location,
                    radius: 500,
                    type: ['restaurant']
                }, $.proxy(renderer.processNearbyRestaurantsSearchResult, renderer));

                placesService.nearbySearch({
                    location: renderer.supercharger.location,
                    radius: 500,
                    type: ['store']
                }, $.proxy(renderer.processNearbyStoresSearchResult, renderer));

                placesService.nearbySearch({
                    location: renderer.supercharger.location,
                    radius: 500,
                    type: ['lodging']
                }, $.proxy(renderer.processNearbyLodgingsSearchResult, renderer));
            }
        }
    };

    processNearbyRestaurantsSearchResult(results, status) {
        const renderer = this;

        if (status === google.maps.places.PlacesServiceStatus.OK) {
            const restaurantList = new Array(results.length);
            for (let i = 0; i < results.length; i++) {
                let restaurantText = results[i].name;
                if (!Objects.isNullOrUndef(results[i].price_level)) {
                    restaurantText += ' (';
                    for (let j = 0; j < parseInt(results[i].price_level); j++) {
                        restaurantText += '$';
                    }
                    restaurantText += ')';
                }
                restaurantList[i] = restaurantText;
            }

            const displayedList = restaurantList.slice(0, restaurantList.length >= 3 ? 3 : restaurantList.length);

            let displayedListText = displayedList.join(', ');

            if (restaurantList.length > 3) {
                displayedListText += ', and <a href="#" class="show_more">' + (restaurantList.length - 3) + ' more...</a>';
            }

            renderer.restaurantsElement.html(displayedListText);

            $(renderer.restaurantsElement).find(".show_more").click(function (event) {
                renderer.restaurantsElement.html(restaurantList.join(', '));
            })

        } else if (status === google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
            renderer.restaurantsElement.html('N/A');
        }
    };

    processNearbyStoresSearchResult(results, status) {
        const renderer = this;

        if (status === google.maps.places.PlacesServiceStatus.OK) {
            const storeList = []; // can't initiate to results length, because we need to eliminate restaurants
            for (let i = 0; i < results.length; i++) {
                if (!results[i].types.includes('restaurant')) {
                    storeList.push(results[i].name);
                }
            }

            if (storeList.length === 0) {
                renderer.storesElement.html('N/A');
                return;
            }

            const displayedList = storeList.slice(0, storeList.length >= 3 ? 3 : storeList.length);

            let displayedListText = displayedList.join(', ');

            if (storeList.length > 3) {
                displayedListText += ', and <a href="#" class="show_more">' + (storeList.length - 3) + ' more...</a>';
            }

            renderer.storesElement.html(displayedListText);

            $(renderer.storesElement).find(".show_more").click(function (event) {
                renderer.storesElement.html(storeList.join(', '));
            })
        } else if (status === google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
            renderer.storesElement.html('N/A');
        }
    };

    processNearbyLodgingsSearchResult(results, status) {
        const renderer = this;

        if (status === google.maps.places.PlacesServiceStatus.OK) {
            const lodgingList = new Array(results.length);
            for (let i = 0; i < results.length; i++) {
                lodgingList[i] = results[i].name;
            }

            const displayedList = lodgingList.slice(0, lodgingList.length >= 3 ? 3 : lodgingList.length);

            let displayedListText = displayedList.join(', ');

            if (lodgingList.length > 3) {
                displayedListText += ', and <a href="#" class="show_more">' + (lodgingList.length - 3) + ' more...</a>';
            }

            renderer.lodgingsElement.html(displayedListText);

            $(renderer.lodgingsElement).find(".show_more").click(function (event) {
                renderer.lodgingsElement.html(lodgingList.join(', '));
            })
        } else if (status === google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
            renderer.lodgingsElement.html('N/A');
        }
    };


}