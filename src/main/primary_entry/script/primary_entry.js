import $ from "jquery";
import NavBar from "./nav/NavBar";
import FeatureCheck from "./common/FeatureCheck";
import Sites from "./site/Sites";
import userConfig from "./common/UserConfig";
import LoginCheckAction from "./common/login/LoginCheckAction"
import TotalCountPanel from "./nav/TotalCountPanel";
// Tell webpack to build a css bundle starting with this file.
import "../css/main.css";
// Tell webpack to include these images in our package. Ultimately it is is possible to have webpack rename the
// image file to something like [md5].png and have the below import statements return the actual path (with the md5),
// this for perfect caching.  For now lets keep it simple, I have configured webpack not to change the image names.
import "../images/avatar-placeholder.png";
import "../images/feed-icon.png";
import "../images/blue_triangle.svg";
import "../images/black_dot_x.svg";
import "../images/gray_dot_x.svg";
import "../images/green_dot.svg";
import "../images/red_dot.svg";
import "../images/red_dot_limited.svg";
import "../images/orange_triangle.svg";
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
        new LoginCheckAction().loginCheck();
        new NavBar();
        new FeatureCheck().doCheck();
        new TotalCountPanel();
    });

};



    