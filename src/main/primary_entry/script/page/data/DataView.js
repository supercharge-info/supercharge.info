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
import Strings from "../../util/Strings";

export default class DataView {

    constructor(filterDialog) {
        this.table = $("#supercharger-data-table");

        this.filterControl = new SiteFilterControl(
            $("#data-filter"),
            this.filterControlCallback.bind(this),
            filterDialog
        );

        const tableAPI = this.table.DataTable(this.initDataTableOptions());
        this.tableAPI = tableAPI;

        const tableBody = this.table.find("tbody");
        tableBody.on('click', DataView.handleDataClick);

        this.table.on('click', 'th.dt-control', (event) => {
            const icon = event.target.closest('b');
            if (icon.className.indexOf("right") > 0) {
                tableBody.find("tr.odd, tr.even").each((n, tr) => DataView.handleDetailClick(tr, tableAPI, "show"));
                icon.className = icon.className.replace("right", "down");
                icon.title = "hide all details";
            } else {
                tableBody.find("tr.dt-hasChild").each((n, tr) => DataView.handleDetailClick(tr, tableAPI, "hide"));
                icon.className = icon.className.replace("down", "right");
                icon.title = "show all details";
            }
        });

        tableBody.on('click', 'td.dt-control', (event) => {
            DataView.handleDetailClick(event.target.closest('tr'), tableAPI, '');
            event.preventDefault();
        });

        this.syncFilters();
    }

    syncFilters() {
        this.filterControl.init();
        setTimeout(this.tableAPI.draw, 100);
    }

    filterControlCallback() {
        this.tableAPI.draw();
        userConfig.setRegionId(this.filterControl.getRegionId());
        userConfig.setCountryId(this.filterControl.getCountryId());
        userConfig.setState(this.filterControl.getState());
        userConfig.setStatus(this.filterControl.getStatus());
        userConfig.setStalls(this.filterControl.getStalls());
        userConfig.setPower(this.filterControl.getPower());
        userConfig.setStallType(this.filterControl.getStallType());
        userConfig.setPlugType(this.filterControl.getPlugType());
        userConfig.setParking(this.filterControl.getParking());
        userConfig.setOtherEVs(this.filterControl.getOtherEVs());
        userConfig.setSolar(this.filterControl.getSolar());
        userConfig.setBattery(this.filterControl.getBattery());
        userConfig.setSearch(this.filterControl.getSearch());
        this.filterControl.updateVisibility();
    }

    static handleDetailClick(tr, tableAPI, showHide) {
        const row = tableAPI.row(tr);
        if (showHide !== 'show' && row.child.isShown()) row.child.hide();
        else if (showHide !== 'hide' && !row.child.isShown()) {
            row.child(DataView.buildChild(tr, row.data())).show();
            $(".tooltip").tooltip("hide");
            $("#changes-table .child img, #changes-table .child span.details").each(function (n, t) {
                $(t).tooltip({ "container": "body" });
            });
        }
    }

    static handleDataClick(event) {
        if (!WindowUtil.isTextSelected()) {
            const target = $(event.target);
            if (!target.is('a, b, ul, li, img, .details, .dt-control')) {
                if (target.closest('table')?.find('div.open')?.length === 0) {
                    const clickedSiteId = parseInt(target.closest('tr')?.data('siteid') ?? 0);
                    if (clickedSiteId > 0) EventBus.dispatch(MapEvents.show_location, clickedSiteId);
                }
            }
        }
    }

    static buildChild(parentTR, dataRow) {
        const site = Supercharger.fromJSON(dataRow);

        var left = site.hours ? `<div class="limited">${site.hours}</div>` : '';
        var right = `<div><b>Stalls:</b>`;

        Object.keys(site.stalls).forEach(s => {
            if (site.stalls[s] > 0) {
                right += ` • ${site.stalls[s]} `;
                if (s === 'accessible') right += '<img class="details" src="/images/accessible.svg" title="Accessible" alt="Accessible"/>';
                else if (s === 'trailerFriendly') right += '<img class="details" src="/images/trailer.svg" title="Trailer-friendly" alt="Trailer-friendly"/>';
                else right += Strings.upperCaseInitial(s);
            }
        });
        right += '</div><div><b>Plugs:</b>';
        Object.keys(site.plugs).forEach(p => {
            if (site.plugs[p] > 0) {
                if (p !== 'multi') right += ` • ${site.plugs[p]} ${site.plugImg(p)}`;
            }
        });
        right += "</div>";
        if (site.facilityName) {
            left += `<div><b>Host:</b> ${site.facilityName}`;
            if (site.facilityHours) left += ` • ${site.facilityHours}`;
            left += "</div>";
        }
        const park = Sites.getParking().get(site.parkingId);
        left += `<div title='${park?.description ?? '(unknown)'}'><b>Parking:</b> ${park?.name ?? '(unknown)'}</div>`;

        if (site.addressNotes) left += `<div class="notes"><b>Address notes:</b><br/>${site.addressNotes}</div>`;
        if (site.accessNotes) right += `<div class="notes"><b>Access notes:</b><br/>${site.accessNotes}</div>`;


        return `
            <table class="child">
                <tr>
                    <td width="1%"></td>
                    <td width="49%">${left}</td>
                    <td width="1%"></td>
                    <td width="39%">${right}</td>
                    <td width="1%"></td>
                    <td width="9%" class="links">${DataView.buildLinks(site)}</td>
                </tr>
            </table>`;
    }

    static buildStalls(supercharger) {
        const site = Supercharger.fromJSON(supercharger);
        return site.getStallPlugSummary(true);
    }

    static buildPower(supercharger) {
        const site = Supercharger.fromJSON(supercharger);
        return (site.stallType && site.plugType ? '' : '≤ ') + site.powerKilowatt;

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

    static buildLinks(site) {
        const gmapLink = site.getGmapLink();
        const discussLink = DataView.asLink(
            site.urlDiscuss ? `${ServiceURL.DISCUSS}?siteId=${site.id}` : ServiceURL.DEFAULT_DISCUSS_URL,
            '<img src="/images/forum.svg" title="forum"/>');
        const teslaLink = site.getTeslaLink();
        const psLink = site.getPlugShareLink();
        const osmLink = site.getOsmLink();
        return `${gmapLink} ${psLink} ${osmLink} ${discussLink} ${teslaLink}`;
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
            "order": [[12, "desc"], [1, "asc"]],
            "lengthMenu": [10, 20, 25, 50, 100, 500, 1000],
            "pageLength": 20,
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
                    d.stallType = dataView.filterControl.getStallType()?.join(",");
                    d.plugType = dataView.filterControl.getPlugType()?.join(",");
                    d.parking = dataView.filterControl.getParking()?.join(",");
                    d.otherEVs = dataView.filterControl.getOtherEVs();
                    d.solarCanopy = dataView.filterControl.getSolar();
                    d.battery = dataView.filterControl.getBattery();
                    d.search = dataView.filterControl.getSearch();
                    if (d.order[0]?.column) d.order[0].column -= 1;
                }
            },
            "rowId": "id",
            "columns": [
                {
                    "className": "dt-control",
                    "orderable": false,
                    "data": "",
                    "defaultContent": "",
                    "width": "1px"
                },
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
                    "width": "5%"
                },
                {
                    "data": "elevationMeters",
                    "className": "number",
                    "width": "7%"
                },
                {
                    "data": "stallCount",
                    "render": (data, type, row, meta) => {
                       return DataView.buildStalls(row);
                    },
                    "className": "number",
                    "width": "7%"
                },
                {
                    "data": "powerKilowatt",
                    "render": (data, type, row, meta) => {
                        return DataView.buildPower(row);
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
                }
            ],
            "createdRow": (row, data, index) => {
                const rowJq = $(row);
                rowJq.attr('data-siteid', data.id);
            },
            "drawCallback": () => {
                // Don't bother with tooltips on narrow (usually mobile) devices
                if (window.innerWidth <= 928) return;
                
                $("li img.wait").addClass("show");
                window.dataTooltips = performance.now();
                window.dataIcons = [];
                $("#supercharger-data-table th, #supercharger-data-table img, #supercharger-data-table span.details").each(function () {
                    window.dataIcons.push($(this));
                });

                const icon = this.table.find('th.dt-control b')[0];
                icon.className = icon.className.replace("down", "right");
                icon.title = "show all details";

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
