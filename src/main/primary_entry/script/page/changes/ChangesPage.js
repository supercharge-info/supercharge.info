import ChangesView from "./ChangesView";

export default class ChangesPage {
    constructor() {
        this.initialized = false;
        this.changesView = null;
    }

    onPageShow() {
        if (!this.initialized) {
            this.changesView = new ChangesView();
            this.initialized = true;
        } else {
            this.changesView.syncFilters();
        }
    }

    onPageHide() {
        if (this.initialized) this.changesView.hideTooltips();
    }

}