import $ from "jquery";
import NavBar from "./nav/NavBar";
import FeatureCheck from "./common/FeatureCheck";
import Sites from "./site/Sites";
import userConfig from "./common/UserConfig";
import LoginCheckAction from "./common/login/LoginCheckAction";
import TotalCountPanel from "./nav/TotalCountPanel";
// Tell webpack to build a css bundle starting with this file.
import "../css/main.css";

// Tell webpack to include these images in our package. Ultimately it is is possible to have webpack rename the
// image file to something like [md5].png and have the below import statements return the actual path (with the md5),
// this for perfect caching.  For now let's keep it simple, webpack is configured not to change the image names.
import "../images/logo.svg";
import "../images/avatar-placeholder.png";
import "../images/feed-icon.png";
import "../images/become_a_patron_button@2x.png";

import "../images/ellipsis-anim.gif";
import "../images/mono-filter.svg";
import "../images/white-filter.svg";
import "../images/sliders-icon.svg";
import "../images/circle-center-icon.svg";
import "../images/link-symbol.svg";
import "../images/history-icon.svg";
import "../images/plus-circle.svg";
import "../images/minus-circle.svg";
import "../images/gmap.svg";
import "../images/forum.svg";
import "../images/solar-power-variant.svg";
import "../images/battery-charging.svg";
import "../images/car-electric.svg";

import "../images/blue_triangle.svg";
import "../images/black_dot_x.svg";
import "../images/gray_dot_x.svg";
import "../images/green_dot.svg";
import "../images/red_dot.svg";
import "../images/red_dot_t.svg";
import "../images/red_dot_limited.svg";
import "../images/orange_triangle.svg";
import "../images/custom_pin.svg";

import "../images/red_dot_expansion_permit.svg";
import "../images/red_dot_expansion_construction.svg";

/**
 * This is the main entry point into the application.  It is called AFTER google maps loads.
 */
window.supercharge.start = function () {

    // This will allow us to wait for the document to be ready below.
    const docReadyDeferred = $.Deferred();
    $(document).ready(() => docReadyDeferred.resolve());
    // Allow us to wait for the user config to load without succeeding
    const userConfigDeferred = $.Deferred();
    $.when(userConfig.load()).always(() => userConfigDeferred.resolve());

    //
    // Wait before starting the main app.
    // userConfig.load() needs to be deferred separately, because if it fails, it somehow breaks Sites.load().
    //
    $.when(
        Sites.load(),
        docReadyDeferred,
        userConfigDeferred
    ).done(() => {
        new LoginCheckAction().loginCheck();
        new NavBar();
        new FeatureCheck().doCheck();
        new TotalCountPanel();
    });
};
