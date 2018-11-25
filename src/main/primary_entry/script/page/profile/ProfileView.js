import $ from "jquery";
import EventBus from "../../util/EventBus";
import ProfileEvents from "./ProfileEvents";
import ServiceURL from "../../common/ServiceURL"
import QueryStrings from "../../common/QueryStrings"

export default class ProfileView {


    constructor() {
        const view = this;
        this.origData = {email: null, unit: null, description: null};

        this.form = $("#profile-form");
        this.errorBox = $("#profile-error-box");
        this.saveButton = $("#profile-save-changes-button");

        //
        // Read only stuff.
        //
        this.username = $("#profile-username");
        this.infoCreationDate = $("#profile-data-creation-date");
        this.infoMarkerCount = $("#profile-data-marker-count");
        this.infoRouteCount = $("#profile-data-route-count");
        this.verifyLabel = $("#email-verify-label");
        this.verifyLink = $("#email-verify-link");
        this.verifyMessage = $("#email-verify-message");

        //
        // Listeners
        //
        this.verifyLink.click((event) => view.onVerifyEmailLink(event));
        this.saveButton.click((event) => view.onSaveButton(event));

        this.form.find("input").on("change click keyup input paste", () => view.onInputChange());
        this.form.find("textarea").on("change click keyup input paste", () => view.onInputChange());

        if (QueryStrings.isEmailVerifyRequired()) {
            this.form.prepend(
                `<h3 class="text-danger">Email verification is required before signing in to forum. Use below "Send Verification Email" link.<h3>`
            )
        }
    }

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // Listeners
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    onInputChange() {
        if (this.valuesHaveChanged()) {
            this.saveButtonEnable();
        } else {
            this.saveButtonDisable();
        }
    }

    onSaveButton(event) {
        event.preventDefault();
        const data = {
            email: this.getEmail(),
            unit: this.getUnit(),
            description: this.getDescription(),
        };
        EventBus.dispatch(ProfileEvents.save_pressed, data);
    }

    onVerifyEmailLink(event) {
        event.preventDefault();
        const view = this;
        $.getJSON(ServiceURL.USER_VERIFY_EMAIL)
            .done(() => {
                view.verifyMessage.html("<strong>email sent...</strong>")
            })
            .fail(() => {
                view.verifyMessage.html("could not send email")
            })
    }

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // error box
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    errorsClear() {
        this.errorBox.html("");
        this.errorBox.hide();
    }

    errorsSet(messages) {
        this.errorBox.html("").show();
        messages.forEach((m) => {
            this.errorBox.append(`${m} <br/><br/>`)
        });
    }

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // save button view
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    saveButtonEnable() {
        this.saveButton.prop('disabled', false);
    }

    saveButtonDisable() {
        this.saveButton.prop('disabled', true);
    }

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // setters
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    setCreationDate(date) {
        this.infoCreationDate.html(date);
    }

    setMarkerCount(count) {
        this.infoMarkerCount.html(count);
    }

    setRouteCount(count) {
        this.infoRouteCount.html(count);
    }

    setEmailVerified(verified) {
        if (verified) {
            this.verifyLabel.html("Yes");
            this.verifyLink.addClass('disabled');
        } else {
            this.verifyLabel.html("No");
            this.verifyLink.removeClass('disabled');
        }
        this.verifyMessage.html("");
    }

    setUsername(u) {
        this.username.html(u);
    }

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // getters / setters -- mutable fields
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    setEmail(e) {
        this.origData.email = e;
        this.form.find("input[name=email]").val(e);
    }

    setUnit(u) {
        this.origData.unit = u;
        this.form.find("input[name=unit][value=" + u + "]").attr('checked', true);
    }

    setDescription(d) {
        this.origData.description = d;
        this.form.find("textarea[name=description]").val(d);
    }


    getEmail() {
        return this.form.find("input[name=email]").val();
    }

    getUsername() {
        return this.form.find("input[name=username]").val();
    }

    getUnit() {
        return this.form.find("input[name=unit]:checked").val();
    }

    getDescription() {
        return this.form.find("textarea[name=description]").val();
    }


    valuesHaveChanged() {
        return (
            (this.origData.email !== this.getEmail()) ||
            (this.origData.unit !== this.getUnit()) ||
            (this.origData.description !== this.getDescription())
        );
    }

}