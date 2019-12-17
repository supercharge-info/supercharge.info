import EventBus from "../../../util/EventBus";
import RouteEvents from "./RouteEvents";

/**
 * Will hold the result of server side routing:
 *
 * https://www.mapbox.com/api-documentation/#directions-response-object
 */
class RouteResultModel {

    constructor() {
        this.result = null;
    }

    setResult(result) {
        this.result = result;
        EventBus.dispatch(RouteEvents.result_model_changed);
    }

    getBestRoute() {
        return this.result.routes[0];
    }

    isEmpty() {
        return this.result === null;
    }

}


export default new RouteResultModel();