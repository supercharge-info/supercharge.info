import $ from "jquery";
import PasswordDialog from "./PasswordDialog";
import userConfig from "../../common/UserConfig";
import EventBus from "../../util/EventBus";
import LoginEvents from "../../common/login/LoginEvents";
import ServiceURL from "../../common/ServiceURL";
import LoginCheckAction from "../../common/login/LoginCheckAction";
import rangeModel from "../../page/map/RangeModel";
import Units from "../../util/Units";
import ProfileView from "./ProfileView";
import ProfileEvents from "./ProfileEvents";


export default class ProfilePage {

    constructor() {
        EventBus.addListener(LoginEvents.login_check_success, this.handleLoginSuccess, this);
        EventBus.addListener(ProfileEvents.save_pressed, this.onSaveButton, this);
        this.view = new ProfileView();
    }

    onPageShow() {
        if (!this.initialized) {
            new PasswordDialog();
            this.initialized = true;
        }

        this.view.setUnit(userConfig.getUnit().getCode());

        const view = this.view;

        // Has to be updated every time we show the page.
        this.view.setMarkerCount(userConfig.customMarkers.length);
        $.getJSON(ServiceURL.USER_ROUTE_COUNT).done((result) => view.setRouteCount(result.count));
    }

    onPageHide() {
    }

    handleLoginSuccess(event, data) {
        // reset errors/buttons
        this.view.errorsClear();
        this.view.saveButtonDisable();
        this.view.setUsername(data.username);
        this.view.setEmail(data.email);
        this.view.setDescription(data.description);
        this.view.setCreationDate(data.creationDate);
        this.view.setEmailVerified(data.emailVerified);
    }

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // for listeners
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    onSaveButton(event, viewData) {
        const page = this;

        if (viewData.unit !== undefined) {
            rangeModel.setDisplayUnit(Units.fromString(viewData.unit));
        }

        $.ajax(ServiceURL.USER_EDIT, {
            data: JSON.stringify(viewData),
            contentType: 'application/json',
            type: 'POST'
        })
            .done((d) => new LoginCheckAction().loginCheck())
            .fail(function (jqXHR, textStatus, errorThrown) {
                page.view.errorsSet(jqXHR.responseJSON.messages);
            });

    }

}