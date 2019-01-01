import unitConversion from "../../../util/UnitConversion";
import Units from "../../../util/Units";
import userConfig from "../../../common/UserConfig";
import routeResultModel from "./RouteResultModel";

const convert = (meters) => unitConversion(Units.M, userConfig.getUnit(), 1)(meters);
const toHourMinSec = (seconds) => new Date(seconds * 1000).toISOString().substr(11, 8);
const formatDistance = (meters) => (meters === 0 || !meters) ? '' : `${convert(meters)} ${userConfig.getUnit().code}`;

class DirectionFormatter {

    format() {
        if (routeResultModel.isEmpty()) {
            return '';
        }
        const route = routeResultModel.getBestRoute();
        let dirs =
            `<div class='route-panel-summary'>
                <b>Total Distance</b>: ${formatDistance(route.distance)}<br/>
                <b>Total Duration</b>: ${toHourMinSec(route.duration)}<br/>
                <b>Legs</b>: ${route.legs.length}
                <br/>
            </div>`;

        route.legs.forEach((leg, index) => {
            dirs += this._formatLeg(leg, index, route.legs.length > 1);
        });
        return dirs;
    }

    _formatLeg(leg, index, showSummary) {
        let html = "<div class='route-panel-directions'>";
        if (showSummary) {
            html += this._legSummary(leg, index);
        }
        html += '<ul>';
        leg.steps.forEach(step => {
            html += `<li>${step.maneuver.instruction} <b>${formatDistance(step.distance)}</b></li>`;
        });
        html += '</ul></div>';
        return html;
    }

    _legSummary(leg, index) {
        return `<div class='route-panel-leg-summary'>
                    Leg ${index + 1}: ${leg.summary} ${leg.steps.length}<br/>
                    <b>${formatDistance(leg.distance)}</b> &nbsp; <b>${toHourMinSec(leg.duration)}</b>
                </div>`
    }

}

export default new DirectionFormatter();