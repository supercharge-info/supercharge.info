import $ from "jquery";
import 'datatables.net';
import 'datatables.net-bs';
import EventBus from "../../util/EventBus";
import Analytics from "../../util/Analytics";
import userConfig from "../../common/UserConfig";
import SiteFilterControl from "../../common/SiteFilterControl";
import Status from "../../site/SiteStatus";
import MapEvents from "../map/MapEvents";
import WindowUtil from "../../util/WindowUtil";
import ServiceURL from "../../common/ServiceURL";

export default class DataView {

    constructor() {
        this.table = $("#supercharger-data-table");

        this.filterControl = new SiteFilterControl(
            $("#data-filter"),
            $.proxy(this.filterControlCallback, this)
        );

        this.table.find("tbody").click(DataView.handleDataClick);

        this.tableAPI = this.table.DataTable(this.initDataTableOptions());

        this.syncFilters();
    }

    syncFilters() {
        this.filterControl.init(userConfig);
        this.tableAPI.draw();
    }

    filterControlCallback(whichSelect, newValue) {
        this.tableAPI.draw();
        userConfig.setRegionCountryId("region", this.filterControl.getRegionId());
        userConfig.setRegionCountryId("country", this.filterControl.getCountryId());
        userConfig.setState(this.filterControl.getState());
        userConfig.setStatus(this.filterControl.getStatus());
        userConfig.setStalls(this.filterControl.getStalls());
        userConfig.setPower(this.filterControl.getPower());
        Analytics.sendEvent("data", "select-" + whichSelect, newValue);
    };

    static handleDataClick(event) {
        if (!WindowUtil.isTextSelected()) {
            const clickTarget = $(event.target);
            const td = clickTarget.closest('td');
            if (!td.hasClass('link')) {
                const clickedSiteId = parseInt(clickTarget.closest('tr').attr('id'));
                EventBus.dispatch(MapEvents.show_location, clickedSiteId);
            }
        }
    };

    static asLink(href, content, title) {
        const titleAttr = title ? `title='${title}'` : '';
        return `<a href='${href}' ${titleAttr} target='_blank'>${content}</a>`;
    }

    static buildLinks(supercharger) {
        const site = supercharger;
        const addr = site.address;
        const query = encodeURI(`${addr.street||''} ${addr.city||''} ${addr.state||''} ${addr.zip||''} ${addr.country||''}`);
        const gmapLink = DataView.asLink(`https://www.google.com/maps/search/?api=1&query=${query}`, 'gmap');
        const discussLink = site.urlDiscuss ?
            DataView.asLink(`${ServiceURL.DISCUSS}?siteId=${site.id}`, 'forum') :
            DataView.asLink(ServiceURL.DEFAULT_DISCUSS_URL, 'forum');
        const teslaLink = site.locationId ?
            " | " + DataView.asLink(ServiceURL.TESLA_WEB_PAGE + site.locationId, 'tesla') :
            '';
        return `${gmapLink} | ${discussLink}${teslaLink}`;
    }
    static buildDiscussionLink(supercharger) {
        return supercharger.urlDiscuss ?
            DataView.asLink(`${ServiceURL.DISCUSS}?siteId=${supercharger.id}`, 'forum') :
            DataView.asLink(ServiceURL.DEFAULT_DISCUSS_URL, 'forum');
    }

    initDataTableOptions() {
        const dataView = this;
        return {
            "paging": true,
            "ordering": true,
            "searching": false,
            "processing": true,
            "serverSide": true,
            "deferLoading": 0,
            "order": [[10, "desc"]],
            "lengthMenu": [
                [10, 25, 50, 100, 1000, 10000],
                [10, 25, 50, 100, 1000, 10000]],
            "pageLength": 50,
            "ajax": {
                url: ServiceURL.SITES_PAGE,
                dataFilter: function (data) {
                    const json = jQuery.parseJSON(data);
                    json.draw = json.pageId;
                    json.recordsTotal = json.recordCountTotal;
                    json.recordsFiltered = json.recordCount;
                    json.data = json.results;
                    return JSON.stringify(json)
                },
                "data": function (d) {
                    d.regionId = dataView.filterControl.getRegionId();
                    d.countryId = dataView.filterControl.getCountryId();
                    d.state = dataView.filterControl.getState();
                    d.status = dataView.filterControl.getStatus().join(",");
                    d.stalls = dataView.filterControl.getStalls();
                    d.power = dataView.filterControl.getPower();
                }
            },
            "rowId": "id",
            "columns": [
                {"data": "name"},
                {"data": "address.street"},
                {"data": "address.city"},
                {"data": "address.state"},
                {"data": "address.zip"},
                {"data": "address.country"},
                {
                    "data": "stallCount",
                    "className": "number"
                },
                {
                    "data": "powerKilowatt",
                    "render": (data, type, row, meta) => {
                        return data || ''
                    },
                    "className": "number"
                },
                {
                    "data": (row, type, val, meta) => {
                        return `${row.gps.latitude}, ${row.gps.longitude}`
                    },
                    "className": "gps",
                    "orderable": false
                },
                {
                    "data": "elevationMeters",
                    "className": "number"
                },
                {
                    "data": (row, type, val, meta) => {
                        var s = Status.fromString(row.status);
                        return `<span class='${row.status} status-select' title='${s.displayName}'><img src='${s.getIcon()}'/></span>`
                    }
                },
                {
                    "data": "dateOpened",
                    "defaultContent": ""
                },
                {
                    "data": (row, type, val, meta) => {
                        return DataView.buildLinks(row);
                    },
                    "className": "link",
                    "orderable": false
                }
            ],
            "dom": "" +
            "<'row'<'col-sm-12'tr>>" +
            "<'row'<'col-sm-4'l><'col-sm-4'i><'col-sm-4'p>>",

        }

    }

}
