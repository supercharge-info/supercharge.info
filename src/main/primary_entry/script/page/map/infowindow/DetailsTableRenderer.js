import Objects from "../../../util/Objects";
import Units from "../../../util/Units";


/**
 * This is the content in the InfoWindow that shows up when the user clicks 'details'.
 */
export default function buildDetailsDiv(supercharger, displayUnit) {
    let div = "";
    div += "<div class='info-window-details'>";
    if (!supercharger.isUserAdded()) {
        div += `<a style='position:absolute; right: 19px;' class='details-trigger' href='#${supercharger.id}'>(hide)</a>`;
    }
    div += "<table>";

    // Date Opened
    //
    if (!Objects.isNullOrUndef(supercharger.dateOpened)) {
        div += "<tr><th>Date Opened</th><td>" + supercharger.formatDateOpened() + "</td></tr>";
    }

    // Elevation
    //
    if (!Objects.isNullOrUndef(supercharger.elevation)) {
        const targetUnits = displayUnit.isKilometers() ? Units.M : Units.FT;
        div += "<tr><th>Elevation</th><td>" + supercharger.formatElevation(targetUnits) + "</td></tr>";
    }

    // GPS
    //
    div += "<tr><th>GPS</th><td>" + supercharger.formatLocation() + "</td></tr>";

    // Hours
    //
    if (!supercharger.isUserAdded()) {
        const hoursClass = Objects.isNullOrUndef(supercharger.hours) ? '' : 'construction';
        div += "<tr><th>Hours</th><td class='" + hoursClass + "'>" + supercharger.formatHours() + "</td></tr>";
    }

    //
    // Solar
    //
    if (supercharger.solarCanopy) {
        div += "<tr><th>Solar Canopy</th><td>Yes</td></tr>";
    }

    //
    // Battery
    //
    if (supercharger.battery) {
        div += "<tr><th>Battery Storage</th><td>Yes</td></tr>";
    }


    div += "</table>";
    div += "</div>";
    return div;
}
