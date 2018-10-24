import ChangesView from "./ChangesView";

export default class ChangesPage {
    constructor() {
        this.initialized = false;
    }

    onPageShow() {
        if (!this.initialized) {
            new ChangesView();
            this.initialized = true;
        }
    }

    onPageHide() {
    }

}