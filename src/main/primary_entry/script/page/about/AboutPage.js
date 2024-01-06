import $ from "jquery";
import ServiceURL from "../../common/ServiceURL";
import Feedback from "./Feedback";
import nodePackage from '../../../../../../package.json';


export default class AboutPage {

    onPageShow() {
        if (!AboutPage.initialized) {

            this.versionContainer = $("#page-about-version-container");
            this.loadVersionInfo();
            AboutPage.initialized = true;

            new Feedback();
        }
    }

    onPageHide() {
    }

    loadVersionInfo() {
        $.getJSON(ServiceURL.DB_INFO, $.proxy(this.insertVersionInfo, this));
    }

    insertVersionInfo(databaseInfo) {
        const version = nodePackage.version;
        this.versionContainer.append(`Version <b>${version}</b>. `);
        this.versionContainer.append(`Database last updated <b>${databaseInfo.lastModifiedString}</b>`);
    }

}