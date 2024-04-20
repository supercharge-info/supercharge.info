const webContext = '/service';
const mvcServlet = '/supercharge';
const base = window.location.origin + webContext + mvcServlet;

export default {

    DB_INFO: base + '/databaseInfo',

    SITES: base + '/allSites',
    SITE_STALL_COUNT: base + '/site/stallCount',
    SITES_PAGE: base + '/sites',
    SITE_HISTORY: base + '/siteHistory',
    PARKING: base + '/parking',
    OPEN_TO: base + '/openTo',

    USER_CONFIG: base + "/userConfig",

    USER_ROUTE: base + "/userRoute",
    USER_ROUTE_COUNT: base + "/userRoute/count",

    CHANGES: base + '/changes',

    FEEDBACK: base + '/feedback',

    LOGIN: base + '/login',
    LOGIN_CHECK: base + '/login/check',
    LOGOUT: base + '/login/out',

    PASSWORD_RESET: base + '/password/reset',
    PASSWORD_CHANGE: base + '/password/change',

    USER_CREATE: base + '/user/create',
    USER_EDIT: base + '/user/edit',
    USER_VERIFY_EMAIL: base + '/email-verification/send',

    FEATURE_CHECK: base + '/feature/check',
    FEATURE_LIST: base + '/feature/list',

    DISCUSS: base + '/discuss',

    /**
     * This is static content (large images, etc) not bundled with the app.
     */
    STATIC_CONTENT: window.location.origin + "/static",

    TESLA_WEB_PAGE: 'https://www.tesla.com/findus?location=',
    TESLA_CN_PAGE: 'https://www.tesla.cn/findus?location=',

    DEFAULT_DISCUSS_URL: 'https://teslamotorsclub.com/tmc/forums/charging-standards-and-infrastructure.77/'

};
