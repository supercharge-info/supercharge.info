import $ from "jquery";
import "jquery-validation";
import "../../lib/jquery.validate.additional-methods";
import userConfig from "../UserConfig";
import ServiceURL from "../ServiceURL";

export default class RegisterView {

    constructor() {
        this.panel = $("#login-register-panel");
        this.form = this.panel.find("form");
        this.confirmMessage = $("#register-confirm");
        this.errorMessge = $("#register-error");
        this.validator = this.form.validate({submitHandler: () => this.submit()});
    }

    show() {
        this.form.trigger('reset');
        this.validator.resetForm();
        this.panel.show();
    }

    hide() {
        this.panel.hide();
        this.confirmMessage.hide();
        this.errorMessge.hide();
    }

    submit() {
        const username = this.form.find("input[name='username']").val();
        const password = this.form.find("input[name='password']").val();
        const email = this.form.find("input[name='email']").val();

        // Unit here is the default for a non-account but may have already been changed
        // by the user to something he likes.
        const requestBody = {
            "username": username, "password":
            password, "email": email, "unit": userConfig.getUnit().getCode()
        };

        $.ajax(ServiceURL.USER_CREATE, {
                data: JSON.stringify(requestBody),
                contentType: 'application/json',
                type: 'POST'
            }
        ).done(() => {
                this.form.find(":input").prop("disabled", true);
                this.confirmMessage.show();
                /* reload the page with the users customizations */
                setTimeout(() => document.location.href = "/", 4000);
            }
        ).fail((jqXHR, textStatus, errorThrown) => {
            this.errorMessge.html("").show();
            jqXHR.responseJSON.messages.forEach((m) =>
                this.errorMessge.append(`${m} <br/>`));
        });
    };
}