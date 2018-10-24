import DataView from "./DataView";

export default class DataPage {

    constructor() {
        this.initialized = false;
    }

    onPageShow() {
        if (!this.initialized) {
            new DataView();
            this.initialized = true;
        }
    };

    onPageHide() {
    }

}