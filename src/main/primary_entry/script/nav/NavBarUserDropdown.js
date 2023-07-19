import $ from "jquery";
import ServiceURL from "../common/ServiceURL";
import EventBus from "../util/EventBus";
import LoginEvents from "../common/login/LoginEvents";
import RouteLoadDialog from "../page/map/route/RouteLoadDialog";


/**
 * This class is responsible for handling click events in the DOM of the user dropdown.  It is also
 * listens for listening to business events and updating the DOM accordingly.
 */
export default class NavBarUserDropdown {

    constructor() {
        new RouteLoadDialog();

        this.loginLink = $("#login-link");

        $("#saved-routes-link").click((e) => {
            NavBarUserDropdown.handleSavedRoutesClick(e);
        });

        // log out click
        $("#logout-link").click(NavBarUserDropdown.handleLogoutClick);

        EventBus.addListener(LoginEvents.login_check_success, this.updateViewToLoggedIn, this);
    }

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    //
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    static handleSavedRoutesClick(event) {
        event.preventDefault();
        $("#load-route-dialog").modal('show');
    }


    static handleLogoutClick(e) {
        e.preventDefault();
        $.get(ServiceURL.LOGOUT).done(() => document.location.href = "/");
    }

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    //
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - -


    updateViewToLoggedIn(event, data) {
        this.loginLink.hide();

        $("#username-link").html(
            `<span class='glyphicon glyphicon-user' aria-hidden='true'></span> ${data.username} <span class='caret'/>`
        ).show();

        $("#save-route-trigger").show();
        $("#login-warning").hide();
    }
}
