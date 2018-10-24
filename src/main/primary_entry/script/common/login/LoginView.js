import $ from "jquery";
import "jquery-validation";
import "../../lib/jquery.validate.additional-methods";
import ServiceURL from "../ServiceURL";
import QueryStrings from "../QueryStrings"


export default class LoginView {

    constructor() {
        this.panel = $("#login-login-panel");
        this.form = this.panel.find('form');
        this.errorBox = $("#login-error");
        this.validator = this.form.validate({submitHandler: () => this.submit()});
    }

    show() {
        this.form.trigger('reset');
        this.validator.resetForm();
        this.panel.show();
    }

    hide() {
        this.panel.hide();
        this.errorBox.hide();
    }

    submit() {
        const username = this.panel.find("input[name='username']").val();
        const password = this.panel.find("input[name='password']").val();

        $.ajax({
            type: 'POST', dataType: 'json', url: ServiceURL.LOGIN,
            data: {"username": username, "password": password}
        })
            .done(this.handleResponse)
            // We go here on bad password, etc, because server side responds with 401/Unauthorized.
            .fail((jqXHR, textStatus, errorThrown) => this.handleResponse(jqXHR.responseJSON));
    };

    handleResponse(loginResponse) {
        if (loginResponse.result === 'SUCCESS') {
            /* reload the page with the users customizations */
            document.location.href = QueryStrings.getSignInRedirect();
        } else {
            this.errorBox.show().find("p").html(loginResponse.messages[0]);
        }
    }

}