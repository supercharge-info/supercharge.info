import Objects from "../../../util/Objects";
import Units from "../../../util/Units";
import Sites from "../../../site/Sites";

/**
 * This is the content in the InfoWindow that shows up when the user clicks 'details'.
 */
export default function buildDetailsDiv(site, displayUnit) {
    let div = "";
    div += "<div class='info-window-details'>";
    if (!site.isUserAdded()) {
        div += `<a style='position:absolute; right: 10px;' class='details-trigger' href='#${site.id}'>(hide)</a>`;
    }
    div += "<table>";

    // Stalls
    if (site.stalls) {
        div += "<tr><th>Stalls</th><td>";
        Object.keys(site.stalls).forEach(s => {
            if (site.stalls[s] > 0) {
                div += ` • ${site.stalls[s]} `;
                if (s === 'accessible') div += '<img src="/images/accessible.svg" title="accessible" alt="accessible"/>';
                else if (s === 'trailerFriendly') div += '<img src="/images/trailer.svg" title="trailer-friendly" alt="trailer-friendly"/>';
                else div += s;
            }
        });
        div += "</td></tr>";
    }

    // Plugs
    if (site.plugs) {
        div += "<tr><th>Plugs</th><td>";
        Object.keys(site.plugs).forEach(p => {
            if (site.plugs[p] > 0) {
                if (p !== 'multi') div += ` • ${site.plugs[p]} ${site.plugImg(p)}`;
            }
        });
        div += "</td></tr>";
    }
    
    // Host
    if (site.facilityName) {
        div += `<tr><th>Host</th><td>${site.facilityName}`;
        if (site.facilityHours) div += ` • ${site.facilityHours}`;
        div += '</td></tr>';
    }

    // Parking
    if (site.parkingId) {
        const park = Sites.getParking().get(site.parkingId);
        div += `<tr title='${park?.description ?? '(unknown)'}'><th>Parking</th><td>${park?.name ?? '(unknown)'}</td></tr>`;
    }

    // Date Opened
    if (!Objects.isNullOrUndef(site.dateOpened)) {
        div += "<tr><th>Date Opened</th><td>" + site.formatDateOpened() + "</td></tr>";
    }

    // Elevation
    if (!Objects.isNullOrUndef(site.elevation)) {
        const targetUnits = displayUnit.isKilometers() ? Units.M : Units.FT;
        div += "<tr><th>Elevation</th><td>" + site.formatElevation(targetUnits) + "</td></tr>";
    }

    // GPS
    div += "<tr><th>GPS</th><td>" + site.formatLocation() + "</td></tr>";

    // Hours
    if (!site.isUserAdded()) {
        const hoursClass = Objects.isNullOrUndef(site.hours) ? '' : 'open';
        div += "<tr><th>Hours</th><td class='" + hoursClass + "'>" + site.formatHours() + "</td></tr>";
    }

    // Solar
    if (site.solarCanopy) {
        div += "<tr><th>Solar Canopy</th><td>Yes</td></tr>";
    }

    // Battery
    if (site.battery) {
        div += "<tr><th>Battery Storage</th><td>Yes</td></tr>";
    }

    // Other EVs
    if (site.otherEVs) {
        div += "<tr><th>Other EVs</th><td>Yes</td></tr>";
    }


    div += "</table>";

    // Notes
    if (site.addressNotes) div += `<div class="notes"><b>Address Notes:</b><br/>${site.addressNotes}</div>`;
    if (site.accessNotes) div += `<div class="notes"><b>Access Notes:</b><br/>${site.accessNotes}</div>`;
    div += '<hr/></div>';

    return div;
}
