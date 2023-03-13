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

    constructor() {
        const table = $("#changes-table");
        this.tableBody = table.find("tbody");
        this.tableBody.click(ChangesView.handleChangeClick);

        this.tableAPI = table.DataTable(this.initDataTableOptions());

        this.filterControl = new SiteFilterControl(
            $("#changes-filter"),
            this.filterControlCallback.bind(this)
        );

        this.syncFilters();
    }

    syncFilters() {
        this.filterControl.init(userConfig);
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
    };

    static handleChangeClick(event) {
        if (!WindowUtil.isTextSelected()) {
            const target = $(event.target);
            if (!target.is('a, b, ul, li')) {
                // TODO: decide whether this should be closest('table') or closest('tr')
                if (target.closest('table').find('div.open').length === 0) {
                    const clickedSiteId = parseInt(target.closest('tr').data('siteid'));
                    EventBus.dispatch(MapEvents.show_location, clickedSiteId);
                }
            }
        }
    };

    static buildSiteName(changeRow) {
        const site = Sites.getById(changeRow.siteId);
        return `<span title="${site.address.street}">${changeRow.siteName}</span>`
    }

    static buildStatus(changeRow) {
        const site = Sites.getById(changeRow.siteId);
        var s = Status.fromString(changeRow.siteStatus);
        return `<span class='${s.value} status-select' title='${s.displayName}'><img src='${s.getIcon(site)}'/></span>`
    }
    
    static buildDetails(changeRow) {
        const site = Sites.getById(changeRow.siteId);
        const stalls = `${site.numStalls} stalls`
        const kw = site.powerKilowatt > 0 ?
            ` | ${site.powerKilowatt} kW` :
            '';

        // mock stall details for now
        /*
        if (Math.random() > 0.8) {
            changeRow.stalls = [
                {
                    "count": site.numStalls,
                    "power": site.powerKilowatt,
                    "type": "n/a",
                    "status": changeRow.siteStatus
                },
                {
                    "count": 4,
                    "power": 120,
                    "type": "V2 - Tesla",
                    "status": "CLOSED_TEMP",
                    "connectors": ["NACS"]
                },
                {
                    "count": 8,
                    "power": 250,
                    "type": "V3 - Tesla",
                    "status": "CONSTRUCTION",
                    "connectors": ["NACS", "CCS"]
                }
            ];
        } else if (Math.random() > 0.5) {
            changeRow.stalls = [
                {
                    "count": site.numStalls,
                    "power": site.powerKilowatt,
                    "type": "Vn - Tesla",
                    "connectors": ["NACS"]
                }
            ];
        }
        */
        if (!changeRow.stalls) {
            return stalls + kw;
        } else if (changeRow.stalls.length === 1) {
            return `${stalls}${kw} | ${changeRow.stalls[0].type} | ${changeRow.stalls[0].connectors?.join(", ")}`;
        }

        var entries = "";
        changeRow.stalls.forEach(s => {
            entries += `
            <li class="${s.status}">${s.count} @ ${s.power} kW → ${Status.fromString(s.status).displayName}
                <li class="${s.status} connectors">${s.type} | ${s.connectors?.join(", ")}</li>
            </li>`;
        });

        return `
            <div class="dropdown">
                <a href="#" class="dropdown-toggle" data-toggle="dropdown">${stalls}${kw}
                    <b class="glyphicon glyphicon-chevron-down btn-xs"></b></a>
                <ul class="dropdown-menu">
                    ${entries}
                </ul>
            </div>`;
    }

    static buildLinks(changeRow) {
        const site = Sites.getById(changeRow.siteId);
        const addr = site.address;
        const query = encodeURI(`${addr.street||''} ${addr.city||''} ${addr.state||''} ${addr.zip||''} ${addr.country||''}`);
        const gmapLink = ChangesView.asLink(`https://www.google.com/maps/search/?api=1&query=${query}`, 'gmap', site.location.toString());
        const discussLink = site.urlDiscuss ?
            ChangesView.asLink(`${ServiceURL.DISCUSS}?siteId=${site.id}`, 'forum') :
            ChangesView.asLink(ServiceURL.DEFAULT_DISCUSS_URL, 'forum');
        const teslaLink = site.locationId ?
            " | " + ChangesView.asLink(ServiceURL.TESLA_WEB_PAGE + site.locationId, 'tesla') :
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
                }
            },
            "rowId": "id",
            "columns": [
                {
                    "data": "dateFormatted",
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
                    "width": "5%"
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
                    "width": "12%"
                }
            ],
            "createdRow": (row, data, index) => {
                const rowJq = $(row);
                rowJq.attr('data-siteid', data.siteId);
                if (data.siteStatus === 'OPEN') {
                    rowJq.addClass('success');
                }
            },
            "dom": "" +
                "<'row'<'col-sm-12'tr>>" +
                "<'row'<'col-sm-12 text-center'l>>" +
                "<'row'<'col-sm-12 text-center'p>>" +
                "<'row'<'col-sm-12 text-center'i>>" +
                ""

        }

    }

}