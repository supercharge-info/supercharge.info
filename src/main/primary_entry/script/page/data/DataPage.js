import DataView from "./DataView";

export default class DataPage {

    constructor() {
        this.initialized = false;
        this.dataView = null;
    }

    onPageShow() {
        if (!this.initialized) {
            this.dataView = new DataView();
            this.initialized = true;
        } else {
            this.dataView.syncFilters();
        }
    };

    onPageHide() {
        if (this.initialized) this.dataView.hideTooltips();
    }

}