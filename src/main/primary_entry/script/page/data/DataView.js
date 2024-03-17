import $ from "jquery";
import 'datatables.net';
import 'datatables.net-bs';
import EventBus from "../../util/EventBus";
import userConfig from "../../common/UserConfig";
import SiteFilterControl from "../../common/SiteFilterControl";
import Status from "../../site/SiteStatus";
import Supercharger from "../../site/Supercharger";
import MapEvents from "../map/MapEvents";
import WindowUtil from "../../util/WindowUtil";
import ServiceURL from "../../common/ServiceURL";
import Sites from "../../site/Sites";

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
        setTimeout(this.tableAPI.draw, Sites.loading ? 1000 : 1);
        Sites.reloadCallback = () => this.tableAPI.draw(false);
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
            const target = $(event.target);
            if (!target.is('a, b, ul, li, img, .details')) {
                if (target.closest('table').find('div.open').length === 0) {
                    const clickedSiteId = parseInt(target.closest('tr')[0].id);
                    EventBus.dispatch(MapEvents.show_location, clickedSiteId);
                }
            }
        }
    }

    static buildStalls(supercharger) {
        const site = Supercharger.fromJSON(supercharger);

        const showDetail = site && (Object.keys(site.stalls)?.length > 1 || Object.keys(site.plugs)?.length > 1 || site.accessNotes || site.addressNotes || site.facilityName || site.parkingId !== 1);
        var sitestalls = (Object.keys(site.stalls)?.length == 1 ? `${site.numStalls} ${Object.keys(site.stalls)[0]}` : `${site.numStalls}`) +
            (Object.keys(site.plugs)?.length == 1 ? ` ${site.plugImg(Object.keys(site.plugs)[0])}` : '');
        // special case for MagicDock
        if (showDetail && site.numStalls === site.plugs?.nacs && site.plugs?.nacs === site.plugs?.ccs1) {
            sitestalls = `<span class="details" title="MagicDock (NACS+CCS1)">${site.numStalls} ${Object.keys(site.stalls)[0]} <img src="/images/NACS.svg"/><img src="/images/CCS1.svg"/></span>`;
        }

        var content = sitestalls;

        if (showDetail) {
            var entries = '<li><b>Stalls:</b>';
            Object.keys(site.stalls).forEach(s => {
                if (site.stalls[s] > 0) {
                    entries += ` • ${site.stalls[s]} `;
                    if (s === 'accessible') entries += '<img class="details" src="/images/accessible.svg" title="accessible" alt="accessible"/>';
                    else if (s === 'trailerFriendly') entries += '<img class="details" src="/images/trailer.svg" title="trailer-friendly" alt="trailer-friendly"/>';
                    else entries += s;
                }
            });
            entries += '</li><li><b>Plugs:</b>';
            Object.keys(site.plugs).forEach(p => {
                if (site.plugs[p] > 0) {
                    if (p !== 'multi') entries += ` • ${site.plugs[p]} ${site.plugImg(p)}`;
                }
            });
            entries += '</li>';
            if (site.facilityName) {
                entries += `<li><b>Host:</b> ${site.facilityName}`;
                if (site.facilityHours) entries += ` • ${site.facilityHours}`;
                entries += '</li>';
            }
            if (site.parkingId !== 1) {
                const park = Sites.getParking().get(site.parkingId);
                entries += `<li title='${park.description}'><b>Parking:</b> ${park.name}</li>`;
            }
            if (site.addressNotes) entries += `<li class="notes">${site.addressNotes}</li>`;
            if (site.accessNotes) entries += `<li class="notes">${site.accessNotes}</li>`;

            content = `
                <div class="dropdown">
                    <a href="#" class="dropdown-toggle" data-toggle="dropdown"><b class="glyphicon glyphicon-chevron-down btn-xs"></b>${content}</a>
                    <ul class="dropdown-menu dropdown-menu-right">
                        ${entries}
                    </ul>
                </div>`;
        }
        return content;

    }

    static buildStatus(supercharger) {
        const site = Supercharger.fromJSON(supercharger);
        var s = Status.fromString(supercharger.status);
        var content = Status.getImg(site, s);
        if (site.otherEVs)     content += '<img class="details" title="other EVs OK" src="/images/car-electric.svg"/>';
        if (site.solarCanopy)  content += '<img class="details" title="solar canopy" src="/images/solar-power-variant.svg"/>';
        if (site.battery)      content += '<img class="details" title="battery backup" src="/images/battery-charging.svg"/>';
        return content;
    }

    static asLink(href, content, title) {
        const titleAttr = title ? `title='${title}'` : '';
        return `<a href="${href.replace(/"/g, '%22')}" ${titleAttr} target="_blank">${content}</a>`;
    }

    static buildLinks(supercharger) {
        const site = Supercharger.fromJSON(supercharger);
        const addr = site.address;
        const query = encodeURI(`${addr.street||''} ${addr.city||''} ${addr.state||''} ${addr.zip||''} ${addr.country||''}`);
        const gmapLink = DataView.asLink(`https://www.google.com/maps/search/?api=1&query=${query}`, '<img src="/images/gmap.svg" title="Google Map"/>');
        const discussLink = DataView.asLink(
            site.urlDiscuss ? `${ServiceURL.DISCUSS}?siteId=${site.id}` : ServiceURL.DEFAULT_DISCUSS_URL,
            '<img src="/images/forum.svg" title="forum"/>');
        const teslaLink = site.locationId ?
            " • " + DataView.asLink(site.getTeslaLink(), `<img src="/images/red_dot_t.svg" title="tesla.${site.address.isTeslaCN() ? 'cn' : 'com'}"/>`) :
            '';
            const psLink = site.plugshareId ?
            " • " + DataView.asLink(`https://api.plugshare.com/view/location/${site.plugshareId}`, '<img src="https://developer.plugshare.com/logo.svg" title="PlugShare"/>') :
            '';
        const osmLink = site.osmId ?
            " • " + DataView.asLink(`https://www.openstreetmap.org/node/${site.osmId}`, '<img src="/images/osm.svg" title="OpenStreetMap"/>') :
            '';
        return `${gmapLink} • ${discussLink}${teslaLink}${psLink}${osmLink}`;
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
            "order": [[11, "desc"], [0, "asc"]],
            "lengthMenu": [
                [10, 25, 50, 100, 500, 1000],
                [10, 25, 50, 100, 500, 1000]],
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
                    resultSpan.html(`${json.recordsFiltered.toLocaleString()} site${json.recordsFiltered === 1 ? "" : "s"}<span class="shrink"> matched</span>`);
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
                {"data": "address.state", "width": "5%"},
                {"data": "address.zip", "width": "5%"},
                {"data": "address.country", "width": "5%"},
                {
                    "data": (row, type, val, meta) => {
                        return `${row.gps.latitude}, ${row.gps.longitude}`;
                    },
                    "className": "gps",
                    //"orderable": false,
                    "width": "1%"
                },
                {
                    "data": "elevationMeters",
                    "className": "number",
                    "width": "1%"
                },
                {
                    "data": (row, type, val, meta) => {
                        return DataView.buildStalls(row);
                    },
                    "className": "number",
                    "width": "7%"
                },
                {
                    "data": "powerKilowatt",
                    "render": (data, type, row, meta) => {
                        return data || '';
                    },
                    "className": "number",
                    "width": "1%"
                },
                {
                    "data": (row, type, val, meta) => {
                        return DataView.buildStatus(row);
                    },
                    "width": "5%"
                },
                {
                    "data": "dateOpened",
                    "defaultContent": "",
                    "width": "5%"
                },
                {
                    "data": (row, type, val, meta) => {
                        return DataView.buildLinks(row);
                    },
                    "className": "links",
                    "orderable": false,
                    "width": "9%"
                }
            ],
            "drawCallback": () => {
                // Don't bother with tooltips on narrow (usually mobile) devices
                if (window.innerWidth <= 928) return;
                
                $("li img.wait").addClass("show");
                window.dataTooltips = performance.now();
                window.dataIcons = [];
                $("#supercharger-data-table img, #supercharger-data-table span.details").each(function () {
                    window.dataIcons.push($(this));
                });
                clearInterval(window.dataInterval);
                window.dataInterval = setInterval(() => {
                    // Asynchronously initialize tooltips, starting from both ends of the table and working toward the middle
                    for (var i1 = 0; i1 < 40 && window.dataIcons.length > 0; i1++) {
                        window.dataIcons.shift().tooltip({ "container": "body" });
                    }
                    for (var i2 = 0; i2 < 10 && window.dataIcons.length > 0; i2++) {
                        window.dataIcons.pop().tooltip({ "container": "body" });
                    }
                    if (window.dataIcons.length === 0) {
                        clearInterval(window.dataInterval);
                        $("li img.wait").removeClass("show");
                        console.log(`Data tooltips: t=${(performance.now() - window.dataTooltips)}`);
                    }
                }, 100);
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
        window.dataIcons = [];
        $(".tooltip").tooltip("hide");
    }

}
