import ChartsView from "./ChartsView";

export default class ChartsPage {

    constructor() {
        this.initialized = false;
    }

    onPageShow() {
        if (!this.initialized) {
            new ChartsView();
            this.initialized = true;
        }
    };

    onPageHide() {
    }

};
