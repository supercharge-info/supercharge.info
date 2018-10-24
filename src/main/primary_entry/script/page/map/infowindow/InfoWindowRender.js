import Objects from "../../../util/Objects";
import Units from "../../../util/Units";
import Events from "../../../util/Events";
import Analytics from "../../../util/Analytics";
import rangeModel from "../RangeModel";
import InfoWindowZ from "./InfoWindowZ";
import $ from "jquery";
import ServiceURL from "../../../common/ServiceURL";
import EventBus from "../../../util/EventBus";

export default class Renderer {

    constructor(googleMap, markerP, superchargerP) {
        this.marker = markerP;
        this.supercharger = superchargerP;
        this.infoWindow = null;
        this.showDetails = false;
        this.showNearby = false;
        this.isPinned = false;
        this.googleMap = googleMap;

        const renderer = this;
        $(document).on('click', '.details-trigger', function (event) {
            const eventDetail = Events.eventDetail(event);
            if (parseInt(eventDetail.actionName) === renderer.supercharger.id) {
                renderer.toggleNearby(false);
                renderer.toggleDetails();
                renderer.infoWindow.setContent(renderer.buildHtmlContent());
            }
        });

        $(document).on('click', '.pin-marker-trigger', function (event) {
            const eventDetail = Events.eventDetail(event);
            if (parseInt(eventDetail.actionName) === renderer.supercharger.id) {
                renderer.togglePin();

                if (renderer.isPinned) {
                    $(this).removeClass('pin');
                    $(this).addClass('unpin');
                } else {
                    $(this).removeClass('unpin');
                    $(this).addClass('pin');
                }
            }
        });

        $(document).on('click', '.nearby-trigger', $.proxy(this.handleNearbySearch, this));

    }

    handleNearbySearch(event) {
        const renderer = this;
        const placesService = new google.maps.places.PlacesService(renderer.googleMap);

        const eventDetail = Events.eventDetail(event);
        if (parseInt(eventDetail.actionName) === renderer.supercharger.id) {
            renderer.toggleDetails(false);
            renderer.toggleNearby();

            renderer.infoWindow.setContent(renderer.buildHtmlContent());

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

    showWindow() {
        const windowOptions = {
            content: this.buildHtmlContent(),
            maxWidth: 300
        };
        if (this.infoWindow === null) {
            this.infoWindow = new InfoWindowZ(windowOptions);
        }
        this.infoWindow.open(this.marker.map, this.marker);
        this.marker.infoWindow = this.infoWindow;
    };

    closeWindow() {
        if (!this.isPinned) {
            this.infoWindow.close();
        }
    };

    toggleDetails(showDetails) {
        if (!Objects.isNullOrUndef(showDetails)) {
            this.showDetails = showDetails;
        } else {
            this.showDetails = !this.showDetails;
        }

        if (this.showDetails) {
            Analytics.sendEvent("map", "view-marker-details");
        }
    };

    togglePin() {
        this.isPinned = !this.isPinned;
        if (this.isPinned) {
            Analytics.sendEvent("map", "pin-marker");
        }
    };

    toggleNearby(showNearby) {
        if (!Objects.isNullOrUndef(showNearby)) {
            this.showNearby = showNearby;
        } else {
            this.showNearby = !this.showNearby;
        }

        if (this.showNearby) {
            Analytics.sendEvent("map", "view-marker-nearby");
        }
    };

    buildHtmlContent() {
        const site = this.supercharger;
        let popupContent = "<div class='info-window-content'>";
        //
        // Title/Supercharger-name
        //
        popupContent += "<div class='title'>" + site.displayName + " ";

        popupContent += buildPinMarker(site, this.isPinned);

        popupContent += "</div>" + "";

        //
        // Status: Construction/Permit/Closed
        //
        if (site.isConstruction()) {
            popupContent += `<div class='construction'>Status: ${site.status.displayName} - ${site.statusDays} days</div>`;
        }
        else if (site.isPermit()) {
            popupContent += `<div class='permit'>Status: ${site.status.displayName} - ${site.statusDays} days</div>`;
        }
        else if (site.isClosed()) {
            popupContent += `<div class='closed'>Status: ${site.status.displayName} - ${site.statusDays} days</div>`;
        }

        //
        // Street Address
        //
        popupContent += site.address.street + "<br/>";

        //
        // Limited Hours
        //
        if (!Objects.isNullOrUndef(site.hours)) {
            popupContent += "<div class='construction' >LIMITED HOURS</div>";
        }


        if (this.showDetails) {
            popupContent += buildDetailsDiv(site, rangeModel.getDisplayUnit());
        }

        if (this.showNearby) {
            popupContent += buildNearbyDiv(site);
        }

        popupContent += buildLinksDiv(site);

        popupContent += "</div>";
        return popupContent;
    };

};

/**
 * This is the content in the InfoWindow that shows up when the user clicks 'details'.
 */
function buildDetailsDiv(supercharger, displayUnit) {
    let div = "";
    div += "<div class='info-window-details'>";
    div += "<table>";

    // Date Opened
    //
    if (!Objects.isNullOrUndef(supercharger.dateOpened)) {
        div += "<tr><th>Date Opened</th><td>" + supercharger.formatDateOpened() + "</td></tr>";
    }

    // Elevation
    //
    if (!Objects.isNullOrUndef(supercharger.elevation)) {
        const targetUnits = displayUnit.isKilometers() ? Units.M : Units.FT;
        div += "<tr><th>Elevation</th><td>" + supercharger.formatElevation(targetUnits) + "</td></tr>";
    }

    // GPS
    //
    div += "<tr><th>GPS</th><td>" + supercharger.formatLocation() + "</td></tr>";

    // Hours
    //
    if (!supercharger.isUserAdded()) {
        const hoursClass = Objects.isNullOrUndef(supercharger.hours) ? '' : 'construction';
        div += "<tr><th>Hours</th><td class='" + hoursClass + "'>" + supercharger.formatHours() + "</td></tr>";
    }

    //
    // Number of charging stalls
    //
    if (!Objects.isNullOrUndef(supercharger.numStalls)) {
        div += "<tr><th>Stalls</th><td>" + supercharger.formatStalls() + "</td></tr>";
    }

    //
    // Power
    //
    if (!Objects.isNullOrUndef(supercharger.powerKilowatt) && supercharger.powerKilowatt > 0) {
        div += `<tr><th>Power</th><td>${supercharger.powerKilowatt} kW</td></tr>`;
    }

    //
    // Solar
    //
    if (supercharger.solarCanopy) {
        div += "<tr><th>Solar Canopy</th><td>Yes</td></tr>";
    }

    //
    // Battery
    //
    if (supercharger.battery) {
        div += "<tr><th>Battery Storage</th><td>Yes</td></tr>";
    }


    div += "</table>";
    div += "</div>";
    return div;
}

/**
 * This is the content in the InfoWindow that shows up when the user clicks 'details'.
 */
function buildNearbyDiv(supercharger) {
    let div = "";
    div += `<div class='info-window-details' id='nearby-details-${supercharger.id}'>`;
    div += "<table>";

    div += "<tr><th>Restaurants</th><td><span class='nearby_restaurants'></span></td></tr>";

    div += "<tr><th>Shopping</th><td><span class='nearby_stores'></span></td></tr>";

    div += "<tr><th>Lodging</th><td><span class='nearby_lodgings'></span></td></tr>";

    div += "</table>";
    div += "</div>";
    return div;
}

function buildLinksDiv(supercharger) {
    let content = "<div class='links-container'>";

    const linkList = [

        // links that are always present
        buildLinkZoom(supercharger),
        buildLinkCircleToggle(supercharger),
        buildLinkAddToRoute(supercharger),
        buildLinkDetails(supercharger),
        buildLinkNearby(supercharger),

        // links that are NOT always present.
        buildLinkURL(supercharger),
        buildLinkDiscussURL(supercharger),
        buildLinkRemoveMarker(supercharger),
        buildLinkRemoveAllMarkers(supercharger)
    ];

    let count = 1;
    $.each(linkList, function (index, value) {
        if (value !== null) {
            content += value + "";
            if (((count++) % 3 === 0) && (index !== linkList.length - 1)) {
                content += "<br/>";
            }
        }
    });
    content += "</div>";
    return content;
}

function buildLinkZoom(supercharger) {
    return `<a class='zoom-to-site-trigger' href='${supercharger.id}'>zoom in</a>`;
}

function buildLinkCircleToggle(supercharger) {
    // If circles are turned on via the map drop-down menu update the text of our circle on/off label accordingly.
    // We only need one listener for all info windows, not one per info window.
    if (!Renderer.circleFlag) {
        EventBus.addListener("circles-all-on-event", function () {
            $("a.circle-toggle-trigger").html("circle off");
        });
        EventBus.addListener("circles-all-off-event", function () {
            $("a.circle-toggle-trigger").html("circle on");
        });
        Renderer.circleFlag = true;
    }
    const circleOnOffLabel = (Objects.isNotNullOrUndef(supercharger.circle) && supercharger.circle.getVisible()) ? "circle off" : "circle on";
    return `<a class='circle-toggle-trigger' href='${supercharger.id}'>${circleOnOffLabel}</a>`;
}

function buildLinkAddToRoute(supercharger) {
    return `<a class='add-to-route-trigger' href='${supercharger.id}'>add to route</a>`;
}

function buildLinkURL(supercharger) {
    if (Objects.isNotNullOrUndef(supercharger.locationId)) {
        return `<a target='_blank' href='${ServiceURL.TESLA_WEB_PAGE + supercharger.locationId}'>web page</a>`;
    }
    return null;
}

function buildLinkDiscussURL(supercharger) {
    if (supercharger.urlDiscuss) {
        return `<a target='_blank' href='${ServiceURL.DISCUSS}?siteId=${supercharger.id}'>discuss</a>`;
    }
    return null;
}

function buildLinkRemoveMarker(supercharger) {
    if (supercharger.isUserAdded()) {
        return `<a class='marker-toggle-trigger' title='remove this custom marker' href='${supercharger.id}'>remove</a>`;
    }
    return null;
}

function buildLinkRemoveAllMarkers(supercharger) {
    if (supercharger.isUserAdded()) {
        return "<a class='marker-toggle-all-trigger' title='remove all custom markers' href=''>remove all</a>";
    }
    return null;
}

function buildLinkDetails(supercharger) {
    return `<a class='details-trigger' href='#${supercharger.id}'>details</a>`;
}

function buildPinMarker(supercharger, isPinned) {
    let pinClass = isPinned ? 'unpin' : 'pin';
    return `<a class='pin-marker-trigger pull-right ${pinClass} glyphicon glyphicon-pushpin' title='pin this window' href='#${supercharger.id}'></a>`;
}

function buildLinkNearby(supercharger) {
    return `<a class='nearby-trigger' href='#${supercharger.id}'>nearby</a>`;
}