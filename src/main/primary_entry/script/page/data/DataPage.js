import DataView from "./DataView";

export default class DataPage {

    constructor(filterDialog) {
        this.initialized = false;
        this.dataView = null;
        this.filterDialog = filterDialog;
    }

    onPageShow() {
        if (!this.initialized) {
            this.dataView = new DataView(this.filterDialog);
            this.initialized = true;
        } else {
            this.dataView.syncFilters();
        }
    };

    onPageHide() {
        if (this.initialized) this.dataView.hideTooltips();
    }

}