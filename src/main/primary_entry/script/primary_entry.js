import $ from "jquery";
import NavBar from "./nav/NavBar";
import FeatureCheck from "./common/FeatureCheck";
import Sites from "./site/Sites";
import userConfig from "./common/UserConfig";
import LoginCheckAction from "./common/login/LoginCheckAction"
// Tell webpack to build a css bundle starting with this file.
import "../css/main.css";
// Tell webpack to include these images in our package. Ultimately it is is possible to have webpack rename the
// image file to something like [md5].png and have the below import statements return the actual path (with the md5),
// this for perfect caching.  For now lets keep it simple, I have configured webpack not to change the image names.
import "../images/avatar-placeholder.png";
import "../images/construction-cone.png";
import "../images/construction-cone_20.png";
import "../images/feed-icon.png";
import "../images/dots/blue_dot_16.png";
import "../images/dots/black_dot_16.png";
import "../images/dots/gray_dot_16.png";
import "../images/dots/green_dot_16.png";
import "../images/dots/red_dot_16.png"; // the per-kW values replace; leaving asset in place now
import "../images/dots/red_dot_standard_16.png";
import "../images/dots/red_dot_v3_16.png";
import "../images/dots/red_dot_unknown_16.png";
import "../images/dots/red_dot_urban_16.png";
import "../images/dots/red_black_dot_16.png";
import "../images/dots/red_black_dot_v3_16.png";
import "../images/dots/red_black_dot_unknown_16.png";
import "../images/dots/red_black_dot_urban_16.png";
import "../images/dots/red_black_dot_standard_16.png";
import "../images/become_a_patron_button@2x.png";


/**
 * This is the main entry point into the application.  It is called AFTER google maps loads.
 */
window.supercharge.start = function () {

    // This will allow us to wait for the document to be ready below.
    const docReadyDeferred = $.Deferred();
    $(document).ready(function () {
        docReadyDeferred.resolve();
    });

    //
    // Wait for these three things to complete before starting the main app.
    //
    $.when(
        userConfig.load(),
        Sites.load(),
        docReadyDeferred
    ).done(() => {
        new NavBar();
        new LoginCheckAction().loginCheck();
        new FeatureCheck().doCheck();
    });

};



    