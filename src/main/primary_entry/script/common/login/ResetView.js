import $ from "jquery";
import ServiceURL from "../ServiceURL";


export default class ResetView {

    constructor() {
        this.panel = $("#login-reset-panel");
        this.form = this.panel.find("form");
        this.confirmMessage = $("#reset-password-confirm");
        this.errorMessage = $("#reset-error");

        this.validator = this.form.validate({
            submitHandler: () => this.submit(),
            rules: {
                username: {
                    require_from_group: [1, ".user-id-group"]
                },
                email: {
                    require_from_group: [1, ".user-id-group"]
                }
            }
        });
    }

    show() {
        this.form.trigger('reset');
        this.validator.resetForm();
        this.panel.show();
    }

    hide() {
        this.panel.hide();
        this.errorMessage.hide();
        this.confirmMessage.hide();
    }

    submit() {
        const username = this.form.find("input[name='username']").val();
        const email = this.form.find("input[name='email']").val();

        $.getJSON(ServiceURL.PASSWORD_RESET + "?username=" + username + "&email=" + email)
            .done(() => {
                    this.confirmMessage.show();
                    setTimeout(() => $("#login-dialog").modal("toggle"), 4000);
                }
            )
            .fail((jqXHR, textStatus, errorThrown) => {
                this.errorMessage.html("").show();
                jqXHR.responseJSON.messages.forEach((m) =>
                    this.errorMessage.append(`${m} <br/>`));
            });
    }


}