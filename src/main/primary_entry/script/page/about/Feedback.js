import $ from "jquery";
import ServiceURL from "../../common/ServiceURL";
import "bootstrap";


export default class Feedback {

    constructor() {
        this.feedbackForm = $("#feedback-form").find("form");
        this.feedbackValidator = this.feedbackForm.validate({submitHandler: $.proxy(this.handleSubmit, this)});
        $("#feedback-dialog").on('hidden.bs.modal', $.proxy(this.resetForm, this));
    };

    resetForm() {
        $("#feedback-confirm").hide();
        $("#feedback-error").hide();
        $("#feedback-form").find(".form-control").val('');
        $("#feedback-input").show();
        $("#feedback-submit").show();
        this.feedbackValidator.resetForm();
    };

    handleSubmit(event) {
        const feedbackText = this.feedbackForm.find("textarea").val();
        $.ajax({
            type: 'POST',
            url: ServiceURL.FEEDBACK + '/insert',
            data: {"message": feedbackText},
            success: (id) => {
                $("#feedback-confirm").show();
                $("#feedback-input").hide();
                $("#feedback-submit").hide();
                $("#feedback-error").hide();
            },
            error: function () {
                $("#feedback-error").show();
            }
        });
    };

}