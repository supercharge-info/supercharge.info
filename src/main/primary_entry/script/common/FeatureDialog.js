import $ from "jquery";
import ServiceURL from "./ServiceURL";

export default class FeatureDialog {

    constructor() {
        this.dialogDiv = $("#features-dialog");
        this.addListeners();
    }

    addListeners() {
        const self = this;
        this.dialogDiv.on('show.bs.modal', (e) => {
            $.getJSON(ServiceURL.FEATURE_LIST)
                .done($.proxy(self.createHtml, self))
                .fail(() => console.log("FAILED to load features"));
        });
    }

    createHtml(features) {
        const dialogContent = this.dialogDiv.find(".modal-body");
        dialogContent.html("");
        $.each(features, (index, feature) => {
            dialogContent.append(`<h3>${feature.addedDate} - ${feature.title}</h3>`);
            dialogContent.append(`<p>${feature.description}</p>`);
            dialogContent.append("<br/><br/>");
        });
    };

    show() {
        this.dialogDiv.modal('show');
    };
}