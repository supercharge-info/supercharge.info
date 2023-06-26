import ChangesView from "./ChangesView";

export default class ChangesPage {
    constructor(filterDialog) {
        this.initialized = false;
        this.changesView = null;
        this.filterDialog = filterDialog;
    }

    onPageShow() {
        if (!this.initialized) {
            this.changesView = new ChangesView(this.filterDialog);
            this.initialized = true;
        } else {
            this.changesView.syncFilters();
        }
    }

    onPageHide() {
        if (this.initialized) this.changesView.hideTooltips();
    }

}