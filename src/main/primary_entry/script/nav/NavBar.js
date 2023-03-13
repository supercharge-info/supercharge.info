import $ from "jquery";
import EventBus from "../util/EventBus";
import Events from "../util/Events";
import NavBarOptions from "./NavBarOptions";
import NavBarUserDropdown from "./NavBarUserDropdown";
import MapPage from "../page/map/MapPage";
import DataPage from "../page/data/DataPage";
import ChartsPage from "../page/charts/ChartsPage";
import ChangesPage from "../page/changes/ChangesPage";
import AboutPage from "../page/about/AboutPage";
import ProfilePage from "../page/profile/ProfilePage";
import Analytics from "../util/Analytics";
import QueryStrings from "../common/QueryStrings";
import ShowSiteAction from "../page/map/action/ShowSiteAction"
import LoginDialog from "../common/login/LoginDialog";


export default class NavBar {

    constructor() {

        this.navBarOptions = new NavBarOptions();

        this.loginDialog = new LoginDialog();

        this.pages = {
            map: new MapPage(),
            data: new DataPage(),
            charts: new ChartsPage(),
            changes: new ChangesPage(),
            about: new AboutPage(),
            profile: new ProfilePage()
        };

        new NavBarUserDropdown();
        new ShowSiteAction();

        this.initListeners();

        // Content that is shown when the navbar is collapsed.
        this.navbarToggle = $(".navbar-toggle");
        // This is the content that is shown on click when the navbar is collapsed.
        this.navbarCollapse = $(".navbar-collapse");

        // INITIAL HISTORY.  We have to call replaceState here because although the initial page
        // will already be in the history there is no 'page' data associated with it, and so we
        // won't get a page back in our "popstate" listener, and hence won't be able to re-render
        // first page in history.
        this.currentPage = QueryStrings.getPage();
        // Always add / as /changes in the history
        const adjustedPath = window.location.pathname === "/" ? "/changes" : window.location.pathname;
        history.replaceState(this.currentPage, null, adjustedPath + window.location.search);
        this.changePage(this.currentPage);

        if(QueryStrings.isShowSignIn()) {
            this.loginDialog.show();
        }
    }


    initListeners() {
        $("#navbar-menu-item-list").find("a.page").click($.proxy(this.handlePageChangeClick, this));
        $("#navbar-dropdown-menu-item-list").find("a").click($.proxy(this.navBarOptions.handleAction, this.navBarOptions));
        EventBus.addListener('nav-change-page-event', this.handlePageChangeEvent, this);

        const collapseFunction = $.proxy(this.autoCloseCollapsedNavBar, this);
        $("body").click(collapseFunction);

        window.addEventListener('popstate', $.proxy(this.handlePageChangeHistory, this));
    };

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // event listeners
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    handlePageChangeEvent(event, newPage) {
        this.changePage(newPage);
        window.history.pushState(newPage, null, newPage);
    };

    handlePageChangeClick(event) {
        const eventDetail = Events.eventDetail(event);
        this.changePage(eventDetail.actionName);
        window.history.pushState(eventDetail.actionName, null, eventDetail.actionName);
    };

    /**
     * Invoked on BACK or FORWARD clicks.  Note that the browser/history-API takes care of updating the
     * location bar URL to what it originally was.  All we do here is update page content with page name
     * which is passed to us in the event.
     */
    handlePageChangeHistory(event) {
        // e.state is equal to the data-attribute, first argument to history.pushState()
        this.changePage(event.state);
    }

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    //
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    /**
     * Since this method is invoked as part of the history API (user clicks browser forward-back) it should NOT
     * itself invoke any history API methods.
     */
    changePage(newPageName) {
        const pages = this.pages;
        if (newPageName === null) {
            newPageName = this.currentPage;
        } else if (this.currentPage !== newPageName) {
            Analytics.sendEvent("navigation", "change-tab", newPageName);
        }

        this.hideCurrentPage();
        pages[this.currentPage].onPageHide();
        this.currentPage = newPageName;
        this.showCurrentPage();

        /* Let the browser do the DOM updating associated with change the page, then execute the logic associated
         with the page change. */
        setTimeout(() => pages[newPageName].onPageShow(), 1);
    };

    hideCurrentPage() {
        $("#page-" + this.currentPage).hide();
        $("#page-link-" + this.currentPage).closest("li").removeClass("active");
    };

    showCurrentPage() {
        $("#page-" + this.currentPage).show();
        $("#page-link-" + this.currentPage).closest("li").addClass("active");
    };

    /**
     * If the navbar is collapsed then hide/close it each time the user click a menu item (or the body).
     */
    autoCloseCollapsedNavBar(event) {
        if (this.navbarToggle.is(":visible") && this.navbarCollapse.is(":visible")) {
            const target = $(event.target);
            if (!target.is(".dropdown-toggle") && (!target.is(".form-control") || target.closest(".navbar").length === 0)) {
                this.navbarCollapse.collapse('toggle');
            }
        }
    };

}
