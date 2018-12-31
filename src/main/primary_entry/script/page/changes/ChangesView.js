import $ from "jquery";
import 'datatables.net';
import 'datatables.net-bs';
import EventBus from "../../util/EventBus";
import Analytics from "../../util/Analytics";
import ServiceURL from "../../common/ServiceURL";
import userConfig from "../../common/UserConfig";
import CountryRegionControl from "../../common/CountryRegionControl";
import SiteStatus from "../../site/SiteStatus";
import Sites from "../../site/Sites";
import MapEvents from "../map/MapEvents";
import WindowUtil from "../../util/WindowUtil";

export default class ChangesView {

    constructor() {
        const table = $("#changes-table");
        this.tableBody = table.find("tbody");
        this.tableBody.click(ChangesView.handleChangeClick);

        this.tableAPI = table.DataTable(this.initDataTableOptions());

        this.regionControl = new CountryRegionControl(
            $("#changes-filter-div"),
            $.proxy(this.regionControlCallback, this)
        );

        const changesView = this;
        this.regionControl.init(userConfig.changesPageRegionId, userConfig.changesPageCountryId)
            .done($.proxy(this.loadChanges, this))
            .done(() => {
                changesView.tableAPI.draw()
            });
    }

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // Initialization
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    regionControlCallback(whichSelect, newValue) {
        this.loadChanges();
        Analytics.sendEvent("changes", "select-" + whichSelect, newValue);
        userConfig.setRegionCountryId("changes", "region", this.regionControl.getRegionId());
        userConfig.setRegionCountryId("changes", "country", this.regionControl.getCountryId());
    };

    loadChanges() {
        this.tableAPI.draw();
    };

    static handleChangeClick(event) {
        if (!WindowUtil.isTextSelected()) {
            const target = $(event.target);
            if (!target.is("a")) {
                const clickedSiteId = parseInt(target.closest('tr').data('siteid'));
                EventBus.dispatch(MapEvents.show_location, clickedSiteId);
            }
        }
    };

    static buildSiteName(changeRow) {
        const site = Sites.getById(changeRow.siteId);
        return `<span title="${site.address.street}">${changeRow.siteName}</span>`
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

    static buildDetails(changeRow) {
        const site = Sites.getById(changeRow.siteId);
        const stalls = `${site.numStalls} stalls`
        const kw = site.powerKilowatt > 0 ?
            ` | ${site.powerKilowatt} kW` :
            '';
        return stalls + kw;
    }

    static asLink(href, content, title) {
        const titleAttr = title ? `title='${title}'` : '';
        return `<a href='${href}' ${titleAttr} target='_blank'>${content}</a>`;
    }

    initDataTableOptions() {
        const changesView = this;
        return {
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
                    const json = jQuery.parseJSON(data);
                    json.draw = json.pageId;
                    json.recordsTotal = json.recordCountTotal;
                    json.recordsFiltered = json.recordCount;
                    json.data = json.results;
                    return JSON.stringify(json)
                },
                "data": function (d) {
                    d.regionId = changesView.regionControl.getRegionId();
                    d.countryId = changesView.regionControl.getCountryId();
                }
            },
            "rowId": "id",
            "columns": [
                {
                    "data": "dateFormatted"
                },
                {
                    "data": (row, type, val, meta) => {
                        return row.changeType.toLowerCase();
                    }
                },
                {
                    "data": (row, type, val, meta) => {
                        return ChangesView.buildSiteName(row);
                    }
                },
                {
                    "data": (row, type, val, meta) => {
                        return `<span class='${row.siteStatus}'>${SiteStatus.fromString(row.siteStatus).displayName}</span>`;
                    }
                },
                {
                    "data": (row, type, val, meta) => {
                        return ChangesView.buildLinks(row);
                    }
                },
                {
                    "data": (row, type, val, meta) => {
                        return ChangesView.buildDetails(row);
                    }
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