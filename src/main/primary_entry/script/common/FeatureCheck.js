import $ from "jquery";
import ServiceURL from "./ServiceURL";
import FeatureDialog from "./FeatureDialog";

export default class FeatureCheck {

    constructor() {
        this.featureDialog = new FeatureDialog();
    }

    doCheck() {
        $.getJSON(ServiceURL.FEATURE_CHECK)
            .done($.proxy(this.handleResponse, this))
            .fail(function () {
                console.log("FAILED to check for features");
            });
    }

    handleResponse(response) {
        if (response.messages[0] === "new features") {
            this.showNotification();
        }
        // Else do nothing and we are done with the new feature check.
    }

    showNotification() {
        const alertDiv = $('<div/>', {id: 'new-feature-notify', class: 'alert alert-info', role: 'alert'});

        const button = $('<button/>', {type: 'button', class: 'close'});
        button.attr('data-dismiss', 'alert');
        button.attr('aria-label', 'close');
        button.html("x");

        const link = $("<a>added some new features</a>", {href: '#'});
        link.on('click', $.proxy(this.showDialog, this));

        alertDiv.append("<span>We have recently </span>");
        alertDiv.append(link);
        alertDiv.append("<span>.</span>");
        alertDiv.append(button);

        $(".layout-header").prepend(alertDiv);
    }

    showDialog() {
        $("#new-feature-notify").remove();
        this.featureDialog.show();
    }

}