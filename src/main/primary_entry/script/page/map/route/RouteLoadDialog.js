import EventBus from "../../../util/EventBus";
import ServiceURL from "../../../common/ServiceURL";
import $ from "jquery";
import RouteEvents from "./RouteEvents";

export default class RouteLoadDialog {

    constructor() {
        this.userRouteList = [];
        this.dialog = $('#load-route-dialog');
        this.errorMessage = $("#load-route-error");
        this.addListeners();
    }

    addListeners() {
        this.dialog.on('shown.bs.modal', $.proxy(this.onDialogOpen, this));
        this.dialog.on('hidden.bs.modal', $.proxy(this.onDialogClose, this));
        this.dialog.find($(".btn-primary")).on('click', $.proxy(this.handleLoadButton, this));
    }

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // open / close
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    onDialogOpen() {
        $.getJSON(ServiceURL.USER_ROUTE)
            .done($.proxy(this.handleLoadRoutesResponse, this))
            .fail($.proxy(this.handleLoadRoutesFailure, this));
    }

    onDialogClose() {
        this.dialog.find("span").empty();
        $("#load-route-error").hide().find("p").html("");
    }

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    //
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    handleLoadRoutesFailure() {
        this.errorMessage.show().find("p").html("Error occurred while loading user routes.");
    }

    handleLoadRoutesResponse(resultList) {
        this.userRouteList = resultList;

        if (resultList.length === 0) {
            this.showNoRouteMessage();
        } else {
            resultList.forEach((route) => {
                this.dialog.find("span").append(`<div class='route-option' id='user_route_option_${route.id}'></div>`);
                const option = this.dialog.find(".route-option:last");
                option.append(`<input id='user_route_${route.id}' type='radio' name='route-name-select' value = '${route.id}'/>`);
                option.append(`<label for='user_route_${route.id}'>&nbsp; ${route.name} -- ${route.waypoints.length} waypoints &nbsp;</label>`);
                option.append("<span class='glyphicon glyphicon-trash remove-route-trigger' data-toggle='tooltip' data-placement='right' title='delete'></span><br/>");

                const deleteLinks = $(".remove-route-trigger:last");
                deleteLinks.tooltip();
                deleteLinks.on('click', $.proxy(this.handleDeleteRoute, this, route));
            });
        }
    }

    handleDeleteRoute(route) {
        const routeDialog = this;
        $.ajax({
            type: 'POST',
            url: ServiceURL.USER_ROUTE + "/delete",
            data: { id: route.id },
            success: function () {
                $("div#user_route_option_" + route.id).remove();

                if (routeDialog.dialog.find(".route-option").length === 0) {
                    routeDialog.showNoRouteMessage();
                }
            },
            error: function (e) {
                routeDialog.errorMessage.show().find("p").html("Error occurred while deleting the route " + route.name);
            }
        });
    }


    showNoRouteMessage() {
        this.dialog.find("span").html("No routes saved.");
    }

    handleLoadButton(form) {
        const routeId = parseInt(this.dialog.find("input[name='route-name-select']:checked").val());
        this.userRouteList.forEach((route) => {
            if (routeId === route.id) {
                EventBus.dispatch(RouteEvents.route_selected_for_load, route);
                this.dialog.modal('hide');
            }
        });
    }
}

