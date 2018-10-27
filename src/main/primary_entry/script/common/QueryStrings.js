import $ from 'jquery';
import Objects from "../util/Objects";
import 'jquery.browser';

const VAL_CENTER = getByName("Center");
const VAL_ZOOM = getByName("Zoom");
const VAL_RANGE_MI = getByName("RangeMi");
const VAL_RANGE_KM = getByName("RangeKm");
const VAL_WAYBACK = getByName("wayback");
const VAL_CONTROLS = getByName("Controls");
const VAL_PAGE = getByName("Page");

/**
 * Get a Query (URL) parameter by name (this is case insensitive)
 */
function getByName(parameterName) {
    const paramRegex = new RegExp('[?|&]' + parameterName + '=' + '([^&;]+?)(&|#|;|$)', 'i');
    const paramValueArray = (paramRegex.exec(window.location.search) || [, ""]);
    const encodedParamValue = paramValueArray[1].replace(/\+/g, '%20');
    return decodeURIComponent(encodedParamValue) || null;
}

const QueryStrings = {
    DEFAULT_CENTER: {latitude: 38.0, longitude: -96.5},
    DEFAULT_ZOOM: 5,
    DEFAULT_ZOOM_MOBILE: 7,
    DEFAULT_PAGE: "changes",
    DEFAULT_CONTROLS: "range,status",
    PAGE_OPTIONS : ['map', 'data', 'charts', 'changes', 'about', 'profile'],

    /**
     * Center
     */
    getCenter: function () {
        const value = VAL_CENTER;
        if (value !== null) {
            const coordArray = value.split(",");
            const lat = parseFloat(coordArray[0]);
            const lng = parseFloat(coordArray[1]);
            if (Objects.isNumber(lat) && Objects.isNumber(lng)) {
                return {latitude: lat, longitude: lng};
            }
        }
        return QueryStrings.DEFAULT_CENTER;
    },

    isCenterSet: function () {
        return VAL_CENTER !== null;
    },

    isZoomSet: function () {
        return VAL_ZOOM !== null;
    },

    isRangeUnitSet: function () {
        return VAL_RANGE_MI !== null || VAL_RANGE_KM !== null;
    },

    isShowSignIn: () => getByName("sign-in") === "true",

    getSignInRedirect: () => getByName("sign-in-redirect") == null ? "/" : getByName("sign-in-redirect"),

    isEmailVerifyRequired: () => getByName("email-verify-required") === "true",

    /**
     * Zoom
     */
    getZoom: function () {
        const initialZoom = VAL_ZOOM;
        if ((initialZoom) && (!isNaN(initialZoom))) {
            return parseInt(initialZoom);
        }
        if ($.browser.mobile) {
            return QueryStrings.DEFAULT_ZOOM_MOBILE;
        }
        return QueryStrings.DEFAULT_ZOOM;
    },

    /**
     * PAGE
     */
    getPage: function () {
        // specify page with url param is deprecated and will be removed in the future
        //

        const page = VAL_PAGE;
        const pageLower = page !== null ? page.toLowerCase() : "";
        let pageOptions = QueryStrings.PAGE_OPTIONS;
        if (pageOptions.indexOf(pageLower) >= 0) {
            return pageLower;
        }
        // This is the currently supported way to specify page.
        //
        const path = window.location.pathname;
        for (let i = 0; i < pageOptions.length; i++) {
            if (path.startsWith("/" + pageOptions[i])) {
                return pageOptions[i];
            }
        }
        return QueryStrings.DEFAULT_PAGE;
    },

    /**
     * CONTROLS
     */
    getControls: function () {
        const controls = VAL_CONTROLS;
        return controls === null ? QueryStrings.DEFAULT_CONTROLS : controls.toLowerCase();
    },

    /**
     * Wayback
     */
    getWayBack: function () {
        return "start" === VAL_WAYBACK;
    },

    getRangeMi: function () {
        return VAL_RANGE_MI;
    },

    getRangeKm: function () {
        return VAL_RANGE_KM;
    }
};


export default QueryStrings;