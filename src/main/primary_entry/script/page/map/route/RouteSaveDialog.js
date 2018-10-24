import $ from "jquery";
import ServiceURL from "../../../common/ServiceURL";
import routingModel from "./RoutingModel";

export default class RouteSaveDialog {

    constructor() {
        this.dialog = $("#save-route-dialog");
        this.routeNameInput = $("#route-name-input");

        this.initListeners();
    }

    initListeners() {
        // Validators for save route dialog
        const saveRouteValidator = this.dialog.find('form').validate({submitHandler: $.proxy(this.handleSaveButton, this)});

        const that = this;

        // Focus on input field after dialog is shown.
        this.dialog.on('shown.bs.modal', function (e) {
            that.routeNameInput.focus();
            if (routingModel.routeName !== null) {
                that.routeNameInput.val(routingModel.routeName);
            }
        });

        // Reset dialog
        this.dialog.on('hidden.bs.modal', function (e) {
            that.routeNameInput.val("");
            that.dialog.find("#route-saved-message").hide();
            that.dialog.find("#saving-route-message").show();
            that.dialog.find("#save-route-confirm").hide();
            that.dialog.find("#route-error-message").hide();
            that.dialog.find(".modal-content").show();
            that.dialog.find("#save-route-error").hide();
            saveRouteValidator.resetForm();
        });

        this.dialog.find(".btn-primary").on('click', () => {
            $("#save-route-dialog").find("form").submit();
        });

    }

    show() {
        this.dialog.modal('show');
    }

    handleSaveButton(event) {
        const formRouteName = this.routeNameInput.val().trim();

        this.dialog.find(".modal-content").hide();
        this.dialog.find("#save-route-confirm").show();

        // CASE 1: update saved route
        if (formRouteName === routingModel.routeName) {
            this.saveRoute(routingModel.routeId, routingModel.routeName)
        }
        // CASE 2: save for the first time, OR save copy of route using new name.
        else {
            this.saveRoute(-1, formRouteName);
        }


    };

    saveRoute(routeId, routeName) {
        const route = {id: routeId, name: routeName, waypoints: []};

        routingModel.getWaypoints().forEach((waypoint) => {
            const routeWaypoint = {name: waypoint.displayName, lat: waypoint.latLng.lat(), lng: waypoint.latLng.lng()};
            route.waypoints.push(routeWaypoint)
        });

        const saveRouteDialog = this.dialog;

        $.ajax({
            type: 'POST', url: ServiceURL.USER_ROUTE, data: JSON.stringify(route),
            contentType: "application/json; charset=utf-8",
        }).done((response) => {
                if (response.result === 'SUCCESS') {
                    saveRouteDialog.find("#saving-route-message").hide();
                    saveRouteDialog.find("#route-saved-message").show();
                    // If the routeId passed into this method is -1 that means the user has saved a new route.
                    // Update the model with the new routeId (from response) and name (passed in above).
                    if (routeId === -1) {
                        routingModel.updateRoute(response.routeName, routeName, routingModel.getWaypoints());
                    }
                }
            }
        ).fail(() => {
                saveRouteDialog.find("#saving-route-message").hide();
                saveRouteDialog.find("#route-error-message").show();
            }
        ).always(() => {
            setTimeout(() => {
                saveRouteDialog.modal('hide');
            }, 2000);
        })
    };
}