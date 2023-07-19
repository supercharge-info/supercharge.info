import $ from "jquery";
import ServiceURL from "../ServiceURL";
import LoginEvents from "./LoginEvents";
import EventBus from "../../util/EventBus";


/**
 * Intended to be executed once per page load.  Calls server side to see if user is logged in and
 * if so fires an event passing listeners the login data (username,email,roles, etc).
 *
 * The same data comes pack from the actual login-POST service, but after that login we refresh
 * the page/app to force re-initialization using the user's custom settings.
 *
 * Since our login cookie lives forever most of the time the user won't log in after visiting
 * our page, but will already be logged in due to a cookie they have.
 *
 * Can we combine this with the the existing call to get UserConfig we do on each page load?
 */
export default class LoginCheckAction {

    loginCheck() {
        $.getJSON(ServiceURL.LOGIN_CHECK).done(
            (data) => {
                if (data.result === 'SUCCESS') {
                    EventBus.dispatch(LoginEvents.login_check_success, data);
                }
            }
        );
    }


}