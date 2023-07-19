import $ from "jquery";
import "jquery-validation";
import "../../lib/jquery.validate.additional-methods";

import ResetView from "./ResetView";
import RegisterView from "./RegisterView";
import LoginView from "./LoginView";

export default class LoginDialog {

    constructor() {
        this.init = false;
        this.title = $("#login-dialog-title");
        this.dialog = $('#login-dialog');
        this.dialog.on('shown.bs.modal', () => this.onShow());
    }

    onShow() {
        if (!this.init) {
            this.initViews();
            this.initListeners();
            this.init = true;
        }
        $("#login-form-link").click();
    }

    show() {
        this.dialog.modal('show');
    }

    hide() {
        this.dialog.modal('hide');
    }

    initViews() {
        this.resetView = new ResetView();
        this.registerView = new RegisterView();
        this.loginView = new LoginView();
    }

    initListeners() {

        $("#login-form-link").click((event) => {
            event.preventDefault();
            this.loginView.show();
            this.registerView.hide();
            this.resetView.hide();
            this.title.html("Login");
        });

        $("#register-link").click((event) => {
            event.preventDefault();
            this.loginView.hide();
            this.registerView.show();
            this.resetView.hide();
            this.title.html("Register");
        });

        $("#reset-password-link").click((event) => {
            event.preventDefault();
            this.loginView.hide();
            this.registerView.hide();
            this.resetView.show();
            this.title.html("Reset Password");
        });

    }
}