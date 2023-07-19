import ServiceURL from "../../common/ServiceURL";
import $ from "jquery";

export default class ChangePasswordDialog {

    constructor() {
        this.dialog = $('#change-password-dialog');
        this.form = $("#change-password-form");
        this.formContainer = $("#change-password-form-container");
        this.errorBox = $("#change-password-error");
        this.confirmMessage = $("#change-password-confirm");
        this.addListeners();
    }

    addListeners() {
        this.validator = this.form.validate({
            submitHandler: $.proxy(this.handleSubmit, this)
            , rules: {
                confirm_password: {
                    equalTo: "#password"
                }
            }
        });

        this.dialog.on('shown.bs.modal', $.proxy(this.onDialogOpen, this));
        this.dialog.on('hidden.bs.modal', $.proxy(this.onDialogClose, this));
    }

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // open / close
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    onDialogOpen() {
    }

    onDialogClose() {
        this.dialog.find("input[type=password]").val("");
        this.errorBox.hide();
        this.confirmMessage.hide();
        this.formContainer.show();
        this.validator.resetForm();
    }

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // submit validator
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    handleSubmit(form) {
        const dialog = this;
        const newPassword = this.form.find("input[name='password']").val();
        $.post({
                url: ServiceURL.PASSWORD_CHANGE,
                data: { 'password': newPassword },
                dataType: 'json'
            })
            .done($.proxy(this.doneSubmit, this))
            .fail(function (jqXHR, textStatus, errorThrown) {
                dialog.errorBox.html("");
                jqXHR.responseJSON.messages.forEach((m) =>
                    dialog.errorBox.show().append(m + "<br/>"));
            });
    }

    doneSubmit(data) {
        const dialog = this;
        this.confirmMessage.show();
        setTimeout(() => dialog.dialog.modal('hide'), 4000);
    }

}

