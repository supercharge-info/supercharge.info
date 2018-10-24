import EventBus from "../../util/EventBus";


class StatusModel {
    constructor() {
        /* status control state */
        this.showOpen = true;
        this.showConstruction = true;
        this.showPermit = true;
        this.showClosed = true;

    }

    fireModelChangeEvent() {
        EventBus.dispatch("status-model-changed-event", this);
    };

    togglePermit() {
        this.setShowPermit(!this.showPermit);
    };

    toggleConstruction() {
        this.setShowConstruction(!this.showConstruction);
    };

    toggleOpen() {
        this.setShowOpen(!this.showOpen);
    };

    setShowPermit(show) {
        this.showPermit = show;
    };

    setShowConstruction(show) {
        this.showConstruction = show;
    };

    setShowOpen(show) {
        this.showOpen = show;
    };

    setShowClosed(show) {
        this.showClosed = show;
    };

    setAllOff() {
        this.setShowPermit(false);
        this.setShowConstruction(false);
        this.setShowOpen(false);
        this.setShowClosed(false);
    };


}


export default new StatusModel();


