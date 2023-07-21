import $ from "jquery";
import 'datatables.net';
import 'datatables.net-bs';
import EventBus from "../../util/EventBus";
import ServiceURL from "../../common/ServiceURL";
import userConfig from "../../common/UserConfig";
import SiteFilterControl from "../../common/SiteFilterControl";
import Status from "../../site/SiteStatus";
import Sites from "../../site/Sites";
import MapEvents from "../map/MapEvents";
import WindowUtil from "../../util/WindowUtil";

export default class ChangesView {

    constructor(filterDialog) {
        const table = $("#changes-table");
        this.tableBody = table.find("tbody");
        this.tableBody.click(ChangesView.handleChangeClick);

        this.tableAPI = table.DataTable(this.initDataTableOptions());

        this.filterControl = new SiteFilterControl(
            $("#changes-filter"),
            this.filterControlCallback.bind(this),
            filterDialog
        );

        this.syncFilters();
    }

    syncFilters() {
        this.filterControl.init();
        this.tableAPI.draw();
    }

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // Initialization
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    filterControlCallback() {
        this.tableAPI.draw();
        userConfig.setChangeType(this.filterControl.getChangeType());
        userConfig.setRegionId(this.filterControl.getRegionId());
        userConfig.setCountryId(this.filterControl.getCountryId());
        userConfig.setState(this.filterControl.getState());
        userConfig.setStatus(this.filterControl.getStatus());
        userConfig.setStalls(this.filterControl.getStalls());
        userConfig.setPower(this.filterControl.getPower());
        userConfig.setOtherEVs(this.filterControl.getOtherEVs());
        this.filterControl.updateVisibility();
    }

    static handleChangeClick(event) {
        if (!WindowUtil.isTextSelected()) {
            const target = $(event.target);
            if (!target.is('a, b, ul, li, .links img')) {
                // TODO: decide whether this should be closest('table') or closest('tr')
                if (target.closest('table').find('div.open').length === 0) {
                    const clickedSiteId = parseInt(target.closest('tr').data('siteid'));
                    EventBus.dispatch(MapEvents.show_location, clickedSiteId);
                }
            }
        }
    }

    static buildSiteName(changeRow) {
        const site = Sites.getById(changeRow.siteId);
        var hoverText = site.address.street + ' | ' + site.address.city;
        if (site.address.state)   hoverText += ' | ' + site.address.state;
        if (site.address.country) hoverText += ' | ' + site.address.country;
        return `<span title="${hoverText}">${changeRow.siteName}</span>`;
    }

    static buildStatus(changeRow) {
        const site = Sites.getById(changeRow.siteId);
        var s = Status.fromString(changeRow.siteStatus);
        // includes title (for fancy tooltip) and alt (for copy/paste as text)
        return `<span class='${s.value} status-select'><img src='${s.getIcon(site)}' title='${s.getTitle(site)}' alt='${s.getTitle(site)}'/></span>`;
    }
    
    static buildDetails(changeRow) {
        const site = Sites.getById(changeRow.siteId);

        // mock stall details for now
        /*
        if (Math.random() > 0.8) {
            changeRow.summary = "Something changed!";
            changeRow.stallGroups = [
                {
                    "count": site.numStalls,
                    "power": site.powerKilowatt,
                    "type": "Tesla V3",
                    "connector": "NACS",
                    "status": changeRow.siteStatus,
                },
                {
                    "count": 4,
                    "power": 120,
                    "type": "V2 - Tesla",
                    "status": "CLOSED_TEMP",
                    "connector": "NACS"
                },
                {
                    "count": 8,
                    "power": 250,
                    "type": "V3 - Tesla",
                    "status": "CONSTRUCTION",
                    "connector": "Magic"
                }
            ];
        } else if (Math.random() > 0.5) {
            changeRow.summary = "Something changed?";
            changeRow.stallGroups = [
                {
                    "count": site.numStalls,
                    "power": site.powerKilowatt,
                    "type": "Vn - Tesla",
                    "status": changeRow.siteStatus,
                    "connector": "NACS"
                }
            ];
        }
        */
        const sitestalls = `${site.numStalls} stalls`;
        const sitekw = site.powerKilowatt > 0 ?
            ` | ${site.powerKilowatt} kW` :
            '';
        const sitenote = changeRow.summary ? ' | ' + changeRow.summary : '';

        var content = "";
        if (!changeRow.stallGroups) {
            content = sitestalls + sitekw + sitenote;
        } else {
            var entries = `<li class="${changeRow.siteStatus} connectors"><b>${changeRow.summary}</b></li>`;
            changeRow.stallGroups.forEach(sg => {
                entries += `
                <li class="${sg.status}">${sg.count} @ ${sg.power} kW → ${Status.fromString(sg.status).displayName}
                    <li class="${sg.status} connectors">${sg.type} | ${sg.connector}</li>
                </li>`;
            });

            content = `
                <div class="dropdown">
                    <a href="#" class="dropdown-toggle" data-toggle="dropdown">${sitestalls}${sitekw}
                        <b class="glyphicon glyphicon-chevron-down btn-xs"></b></a>
                    <ul class="dropdown-menu">
                        ${entries}
                    </ul>
                </div>`;
        }
        if (site.solarCanopy) content += ' <img class="details" title="solar canopy" src="/images/solar-power-variant.svg"/>';
        if (site.battery)     content += ' <img class="details" title="battery backup" src="/images/battery-charging.svg"/>';
        if (site.otherEVs)    content += ' <img class="details" title="other EVs OK" src="/images/car-electric.svg"/>';
        return content;
    }

    static buildLinks(changeRow) {
        const site = Sites.getById(changeRow.siteId);
        const addr = site.address;
        const query = encodeURI(`${addr.street||''} ${addr.city||''} ${addr.state||''} ${addr.zip||''} ${addr.country||''}`);
        const gmapLink = ChangesView.asLink(`https://www.google.com/maps/search/?api=1&query=${query}`, '<img src="/images/gmap.svg" title="Google Map"/>', site.location.toString());
        const discussLink = ChangesView.asLink(
            site.urlDiscuss ? `${ServiceURL.DISCUSS}?siteId=${site.id}` : ServiceURL.DEFAULT_DISCUSS_URL,
            '<img src="/images/forum.svg" title="forum"/>');
        const teslaLink = site.locationId ?
            " | " + ChangesView.asLink(ServiceURL.TESLA_WEB_PAGE + site.locationId, '<img src="/images/red_dot_t.svg" title="tesla.com"/>') :
            '';
        return `${gmapLink} | ${discussLink}${teslaLink}`;
    }

    static asLink(href, content, title) {
        const titleAttr = title ? `title='${title}'` : '';
        return `<a href='${href}' ${titleAttr} target='_blank'>${content}</a>`;
    }

    initDataTableOptions() {
        const changesView = this;
        return {
            "responsive": true,
            "paging": true,
            "ordering": false,
            "searching": false,
            "processing": true,
            "serverSide": true,
            "deferLoading": 0,
            "lengthMenu": [
                [10, 25, 50, 100, 1000, 10000],
                [10, 25, 50, 100, 1000, 10000]],
            "pageLength": 50,
            "ajax": {
                url: ServiceURL.CHANGES,
                dataFilter: (data) => {
                    const json = JSON.parse(data);
                    json.draw = json.pageId;
                    json.recordsTotal = json.recordCountTotal;
                    json.recordsFiltered = json.recordCount;
                    json.data = json.results;
                    var resultSpan = $("#changes-result-count");
                    resultSpan.html(`${json.recordsFiltered} entr${json.recordsFiltered === 1 ? "y" : "ies"}<span class="shrink"> matched</span>`);
                    resultSpan.attr("class", json.recordsFiltered === 0 ? "zero-sites" : "site-results");
                    resultSpan.attr("title", json.recordsFiltered === 0 ? "No change log entries displayed. Adjust or reset filters to see more." : "change log entries");
                    return JSON.stringify(json);
                },
                "data": function (d) {
                    d.changeType = changesView.filterControl.getChangeType();
                    d.regionId = changesView.filterControl.getRegionId();
                    d.countryId = changesView.filterControl.getCountryId();
                    d.state = changesView.filterControl.getState().join(",");
                    d.status = changesView.filterControl.getStatus().join(",");
                    d.stalls = changesView.filterControl.getStalls();
                    d.power = changesView.filterControl.getPower();
                    d.otherEVs = changesView.filterControl.getOtherEVs();
                }
            },
            "rowId": "id",
            "columns": [
                {
                    "data": (row, type, val, meta) => {
                        return `<span class="wide">${row.dateFormatted}</span><span class="narrow">${row.date}</span>`;
                    },
                    "width": "12%"
                },
                {
                    "data": (row, type, val, meta) => {
                        /*
                        if (Math.random() > 0.8) {
                            row.statusText = "Editor's note goes here";
                        }
                        */
                        var chg = row.changeType.toLowerCase();
                        return row.statusText ? `<span title="${row.statusText}">${chg}*</span>` : chg;
                    },
                    "width": "5%"
                },
                {
                    "data": (row, type, val, meta) => {
                        return ChangesView.buildSiteName(row);
                    },
                    "width": "42%"
                },
                {
                    "data": (row, type, val, meta) => {
                        return ChangesView.buildStatus(row);
                    },
                    "width": "7%"
                },
                {
                    "data": (row, type, val, meta) => {
                        return ChangesView.buildDetails(row);
                    },
                    "width": "23%"
                },
                {
                    "data": (row, type, val, meta) => {
                        return ChangesView.buildLinks(row);
                    },
                    "className": "links",
                    "width": "10%"
                }
            ],
            "createdRow": (row, data, index) => {
                const rowJq = $(row);
                rowJq.attr('data-siteid', data.siteId);
                if (data.siteStatus === 'OPEN') {
                    rowJq.addClass('success');
                }
            },
            "drawCallback": () => {
                $("#changes-table .status-select img").tooltip({ "container": "body", "placement": "right" });
                $("#changes-table .links img, #changes-table img.details").tooltip({ "container": "body" });
            },
            "dom": "" +
                "<'row'<'col-sm-12'tr>>" +
                "<'row'<'col-sm-12 text-center'l>>" +
                "<'row'<'col-sm-12 text-center'p>>" +
                "<'row'<'col-sm-12 text-center'i>>" +
                ""
        };

    }

    hideTooltips() {
        $(".tooltip").tooltip("hide");
    }

}
