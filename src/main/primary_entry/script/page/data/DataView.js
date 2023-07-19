import $ from "jquery";
import 'datatables.net';
import 'datatables.net-bs';
import EventBus from "../../util/EventBus";
import userConfig from "../../common/UserConfig";
import SiteFilterControl from "../../common/SiteFilterControl";
import Status from "../../site/SiteStatus";
import MapEvents from "../map/MapEvents";
import WindowUtil from "../../util/WindowUtil";
import ServiceURL from "../../common/ServiceURL";

export default class DataView {

    constructor(filterDialog) {
        this.table = $("#supercharger-data-table");

        this.filterControl = new SiteFilterControl(
            $("#data-filter"),
            this.filterControlCallback.bind(this),
            filterDialog
        );

        this.table.find("tbody").click(DataView.handleDataClick);

        this.tableAPI = this.table.DataTable(this.initDataTableOptions());

        this.syncFilters();
    }

    syncFilters() {
        this.filterControl.init();
        this.tableAPI.draw();
    }

    filterControlCallback() {
        this.tableAPI.draw();
        userConfig.setRegionId(this.filterControl.getRegionId());
        userConfig.setCountryId(this.filterControl.getCountryId());
        userConfig.setState(this.filterControl.getState());
        userConfig.setStatus(this.filterControl.getStatus());
        userConfig.setStalls(this.filterControl.getStalls());
        userConfig.setPower(this.filterControl.getPower());
        userConfig.setOtherEVs(this.filterControl.getOtherEVs());
        this.filterControl.updateVisibility();
    }

    static handleDataClick(event) {
        if (!WindowUtil.isTextSelected()) {
            const clickTarget = $(event.target);
            if (!clickTarget.is('a, b, ul, li, .links img')) {
                const clickedSiteId = parseInt(clickTarget.closest('tr').attr('id'));
                EventBus.dispatch(MapEvents.show_location, clickedSiteId);
            }
        }
    }

    static buildStatus(supercharger) {
        const site = supercharger;
        var s = Status.fromString(supercharger.status);
        return `<span class='${s.value} status-select'><img src='${s.getIcon(site)}' title='${s.getTitle(site)}' alt='${s.getTitle(site)}'/></span>`;
    }

    static asLink(href, content, title) {
        const titleAttr = title ? `title='${title}'` : '';
        return `<a href='${href}' ${titleAttr} target='_blank'>${content}</a>`;
    }

    static buildLinks(supercharger) {
        const site = supercharger;
        const addr = site.address;
        const query = encodeURI(`${addr.street||''} ${addr.city||''} ${addr.state||''} ${addr.zip||''} ${addr.country||''}`);
        const gmapLink = DataView.asLink(`https://www.google.com/maps/search/?api=1&query=${query}`, '<img src="/images/gmap.svg" title="Google Map"/>');
        const discussLink = DataView.asLink(
            site.urlDiscuss ? `${ServiceURL.DISCUSS}?siteId=${site.id}` : ServiceURL.DEFAULT_DISCUSS_URL,
            '<img src="/images/forum.svg" title="forum"/>');
        const teslaLink = site.locationId ?
            " | " + DataView.asLink(ServiceURL.TESLA_WEB_PAGE + site.locationId, '<img src="/images/red_dot_t.svg" title="tesla.com"/>') :
            '';
        return `${gmapLink} | ${discussLink}${teslaLink}`;
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
                    const json = JSON.parse(data);
                    json.draw = json.pageId;
                    json.recordsTotal = json.recordCountTotal;
                    json.recordsFiltered = json.recordCount;
                    json.data = json.results;
                    var resultSpan = $("#data-result-count");
                    resultSpan.html(`${json.recordsFiltered} site${json.recordsFiltered === 1 ? "" : "s"}<span class="shrink"> matched</span>`);
                    resultSpan.attr("class", json.recordsFiltered === 0 ? "zero-sites" : "site-results");
                    resultSpan.attr("title", json.recordsFiltered === 0 ? "No sites displayed. Adjust or reset filters to see more." : "");
                    return JSON.stringify(json);
                },
                "data": function (d) {
                    d.regionId = dataView.filterControl.getRegionId();
                    d.countryId = dataView.filterControl.getCountryId();
                    d.state = dataView.filterControl.getState().join(",");
                    d.status = dataView.filterControl.getStatus().join(",");
                    d.stalls = dataView.filterControl.getStalls();
                    d.power = dataView.filterControl.getPower();
                    d.otherEVs = dataView.filterControl.getOtherEVs();
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
                        return data || '';
                    },
                    "className": "number"
                },
                {
                    "data": (row, type, val, meta) => {
                        return `${row.gps.latitude}, ${row.gps.longitude}`;
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
                        return DataView.buildStatus(row);
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
                    "className": "links",
                    "orderable": false
                }
            ],
            "drawCallback": () => {
                $("#supercharger-data-table .status-select img").tooltip({ "container": "body", "placement": "right" });
                $("#supercharger-data-table .links img, #changes-table img.details").tooltip({ "container": "body" });
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
