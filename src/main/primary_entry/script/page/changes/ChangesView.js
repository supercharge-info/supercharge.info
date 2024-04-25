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
import Objects from "../../util/Objects";
import Strings from "../../util/Strings";

export default class ChangesView {

    constructor(filterDialog) {
        const table = $("#changes-table");
        const tableBody = table.find("tbody");
        tableBody.on('click', ChangesView.handleChangeClick);

        this.tableAPI = table.DataTable(this.initDataTableOptions());
        const tableAPI = this.tableAPI;

        $(tableAPI.table().container()).find('#changes-title').html('Supercharger Change History');

        table.on('click', 'th.dt-control', (event) => {
            const icon = event.target.closest('b');
            if (icon.className.indexOf("right") > 0) {
                tableBody.find("tr.odd, tr.even").each((n, tr) => ChangesView.handleDetailClick(tr, tableAPI, "show"));
                icon.className = icon.className.replace("right", "down");
                icon.title = "hide all details";
            } else {
                tableBody.find("tr.dt-hasChild").each((n, tr) => ChangesView.handleDetailClick(tr, tableAPI, "hide"));
                icon.className = icon.className.replace("down", "right");
                icon.title = "show all details";
            }
        });

        tableBody.on('click', 'td.dt-control', (event) => {
            ChangesView.handleDetailClick(event.target.closest('tr'), tableAPI, '');
            event.preventDefault();
        });

        this.filterControl = new SiteFilterControl(
            $("#changes-filter"),
            this.filterControlCallback.bind(this),
            filterDialog
        );

        this.syncFilters();
    }

    syncFilters() {
        this.filterControl.init();
        setTimeout(this.tableAPI.draw, 100);
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
        userConfig.setStallType(this.filterControl.getStallType());
        userConfig.setPlugType(this.filterControl.getPlugType());
        userConfig.setParking(this.filterControl.getParking());
        userConfig.setOpenTo(this.filterControl.getOpenTo());
        userConfig.setSolar(this.filterControl.getSolar());
        userConfig.setBattery(this.filterControl.getBattery());
        userConfig.setSearch(this.filterControl.getSearch());
        this.filterControl.handleSearchInput();
        this.filterControl.updateVisibility();
    }

    static handleDetailClick(tr, tableAPI, showHide) {
        const row = tableAPI.row(tr);
        if (showHide !== 'show' && row.child.isShown()) row.child.hide();
        else if (showHide !== 'hide' && !row.child.isShown()) {
            row.child(ChangesView.buildChild(tr, row.data())).show();
            $(".tooltip").tooltip("hide");
            $("#changes-table .child img, #changes-table .child span.details").each(function (n, t) {
                $(t).tooltip({ "container": "body" });
            });
        }
    }

    static handleChangeClick(event) {
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

    static buildSiteName(changeRow) {
        const site = Sites.getById(changeRow.siteId);
        if (Objects.isNullOrUndef(site) || Objects.isNullOrUndef(site.address)) {
            return changeRow.siteName;
        }
        var hoverText = '';
        if (site.address.street)  hoverText += site.address.street;
        if (site.address.city)    hoverText += ' • ' + site.address.city;
        if (site.address.state)   hoverText += ' ' + site.address.state;
        if (site.address.zip)     hoverText += ' ' + site.address.zip;
        if (site.address.country) hoverText += ' • ' + site.address.country;
        return `<span class="address" title="${hoverText}">${changeRow.siteName}</span>`;
    }

    static buildStatus(changeRow) {
        const site = Sites.getById(changeRow.siteId);

        const isUpdate = changeRow.changeType.toLowerCase() === 'update';
        const s = Status.fromString(changeRow.siteStatus);

        // includes title (for fancy tooltip) and alt (for copy/paste as text)
        var prev = isUpdate && changeRow.prevStatus ?
            Status.getImg(site, Status.fromString(changeRow.prevStatus), 'text-muted') :
            (isUpdate ? "?" : "");
        return `${prev} ${isUpdate ? "➜" : "+"} ${Status.getImg(site, s)}`;
    }

    static buildStallPlugSummary(changeRow) {
        const site = Sites.getById(changeRow.siteId);
        const count = changeRow.prevCount > 0 && changeRow.prevCount !== changeRow.stallCount 
            ? `${changeRow.prevCount}➜<b>${changeRow.stallCount}</b>`
            : changeRow.stallCount;
            
        if (!site) {
            return `${count} stalls`;
        }

        return site.getStallPlugSummary(true, count) + (site.otherEVs ? ' <img title="other EVs OK" src="/images/car-electric.svg"/>' : '');
    }

    static buildSiteDetails(changeRow) {
        const site = Sites.getById(changeRow.siteId);
        if (!site) return changeRow.powerKilowatt > 0 ? `≤ ${changeRow.powerKilowatt} kW` : '';

        var content = site.formatPower('');
        if (site.solarCanopy)  content += ' <img title="solar canopy" src="/images/solar-power-variant.svg"/>';
        if (site.battery)      content += ' <img title="battery backup" src="/images/battery-charging.svg"/>';
        
        const s = site.status;
        if (Objects.isNotNullOrUndef(s) && s !== Status.fromString(changeRow.siteStatus)) {
            content += ` • <span class='text-muted status-select ${s.value}'>now <img src='${s.getIcon(site)}' title='${s.getTitle(site)}' alt='${s.getTitle(site)}'/></span>`;
        }
        return content;
    }

    /*
    static buildDetails(changeRow) {
        const site = Sites.getById(changeRow.siteId);
        const count = changeRow.prevCount > 0 && changeRow.prevCount !== changeRow.stallCount 
            ? `${changeRow.prevCount}➜<b>${changeRow.stallCount}</b>`
            : changeRow.stallCount;
            
        if (!site) {
            const kw = changeRow.powerKilowatt > 0 ? ` • up to ${changeRow.powerKilowatt} kW` : '';
            return `${count} stalls${kw}`;
        }

        var content = '<span class="details">' + site.getStallPlugSummary(true, count) + site.formatPower(' • ');

        // TODO: distinguish NACS vs others?
        if (site.otherEVs)     content += ' <img title="other EVs OK" src="/images/car-electric.svg"/>';
        if (site.solarCanopy)  content += ' <img title="solar canopy" src="/images/solar-power-variant.svg"/>';
        if (site.battery)      content += ' <img title="battery backup" src="/images/battery-charging.svg"/>';
        
        const s = site.status;
        if (Objects.isNotNullOrUndef(s) && s !== Status.fromString(changeRow.siteStatus)) {
            content += ` • <span class='text-muted status-select ${s.value}'>now <img src='${s.getIcon(site)}' title='${s.getTitle(site)}' alt='${s.getTitle(site)}'/></span>`;
        }
        return content + '</span>';
    }
    */

    static buildChild(parentTR, changeRow) {
        const site = Sites.getById(changeRow.siteId);
        if (!site) return '';

        var left = site.hours ? `<div class="limited">${site.hours}</div>` : '';
        left += $(parentTR).find(".address").attr("title").replace(/•/g, "<br/>");
        if (site.addressNotes) left += `<div class="notes"><b>Address notes:</b><br/>${site.addressNotes}</div>`;

        var right = `<b>Stalls:</b>`;
        Object.keys(site.stalls).forEach(s => {
            if (site.stalls[s] > 0) {
                right += ` • ${site.stalls[s]} `;
                if (s === 'accessible') right += '<img src="/images/accessible.svg" title="Accessible" alt="Accessible"/>';
                else if (s === 'trailerFriendly') right += '<img src="/images/trailer.svg" title="Trailer-friendly" alt="Trailer-friendly"/>';
                else right += Strings.upperCaseInitial(s);
            } else if (s === 'accessible') {
                right += ' • <img src="/images/no-accessible.svg" title="NOT Accessible"/>';
            } else if (s === 'trailerFriendly') {
                right += ' • <img src="/images/no-trailer.svg" title="NOT Trailer-friendly"/>';
            }
        });
        right += '<br/><b>Plugs:</b>';
        Object.keys(site.plugs).forEach(p => {
            if (site.plugs[p] > 0) {
                if (p !== 'multi') right += ` • ${site.plugs[p]} ${site.plugImg(p)}`;
            }
        });
        if (site.facilityName) {
            right += `<br/><b>Host:</b> ${site.facilityName}`;
            if (site.facilityHours) right += ` • ${site.facilityHours}`;
        }
        const park = Sites.getParking().get(site.parkingId);
        right += `<div title='${park?.description ?? '(unknown)'}'><b>Parking:</b> ${park?.name ?? '(unknown)'}</div>`;
        if (site.accessNotes) right += `<div class="notes"><b>Access notes:</b><br/>${site.accessNotes}</div>`;

        return `
            <table class="child">
                <tr>
                    <td width="1%"></td>
                    <td width="55%">${left}</td>
                    <td width="1%"></td>
                    <td width="43%" class="details">${right}</td>
                </tr>
            </table>`;
    }

    static buildLinks(changeRow) {
        const site = Sites.getById(changeRow.siteId);
        const gmapLink = site?.getGmapLink() ?? '';
        const discussLink = ChangesView.asLink(
            site?.urlDiscuss ? `${ServiceURL.DISCUSS}?siteId=${changeRow.siteId}` : ServiceURL.DEFAULT_DISCUSS_URL,
            '<img src="/images/forum.svg" title="forum"/>');
        const teslaLink = site?.getTeslaLink() ?? '';
        const psLink = site?.getPlugShareLink() ?? '';
        const osmLink = site?.getOsmLink() ?? '';
        return `${gmapLink} ${psLink} ${osmLink} ${discussLink} ${teslaLink}`;
    }

    static asLink(href, content, title) {
        const titleAttr = title ? `title='${title}'` : '';
        return `<a href="${href?.replace(/"/g, '%22')}" ${titleAttr} target="scinfolink">${content}</a>`;
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
            "deferRender": true,
            "lengthMenu": [10, 20, 25, 50, 100, 500, 1000],
            "pageLength": 25,
            "ajax": {
                url: ServiceURL.CHANGES,
                dataFilter: (data) => {
                    const json = JSON.parse(data);
                    json.draw = json.pageId;
                    json.recordsTotal = json.recordCountTotal;
                    json.recordsFiltered = json.recordCount;
                    json.data = json.results;
                    var resultSpan = $("#changes-result-count");
                    resultSpan.html(`${json.recordsFiltered.toLocaleString()} entr${json.recordsFiltered === 1 ? "y" : "ies"}<span class="shrink"> matched</span>`);
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
                    d.stallType = changesView.filterControl.getStallType()?.join(",");
                    d.plugType = changesView.filterControl.getPlugType()?.join(",");
                    d.parking = changesView.filterControl.getParking()?.join(",");
                    d.openTo = changesView.filterControl.getOpenTo()?.join(",");
                    d.solarCanopy = changesView.filterControl.getSolar();
                    d.battery = changesView.filterControl.getBattery();
                    d.search = changesView.filterControl.getSearch();
                }
            },
            "rowId": "id",
            "columns": [
                {
                    "className": "dt-control",
                    "orderable": false,
                    "data": null,
                    "defaultContent": "",
                    "width": "1%"
                },
                {
                    "data": (row, type, val, meta) => {
                        return ChangesView.buildSiteName(row);
                    },
                    "width": "36%"
                },
                {
                    "data": (row, type, val, meta) => {
                        return `<span class="wide">${row.dateFormatted}</span><span class="narrow">${row.date}</span>`;
                    },
                    "width": "12%"
                },
                {
                    "data": (row, type, val, meta) => {
                        return ChangesView.buildStatus(row);
                    },
                    "className": "status",
                    "width": "8%"
                },
                {
                    "data": (row, type, val, meta) => {
                        return ChangesView.buildStallPlugSummary(row);
                    },
                    "className": "details",
                    "width": "15%"
                },
                {
                    "data": (row, type, val, meta) => {
                        return ChangesView.buildSiteDetails(row);
                    },
                    "className": "details",
                    "width": "16%"
                },
                {
                    "data": (row, type, val, meta) => {
                        return ChangesView.buildLinks(row);
                    },
                    "className": "links",
                    "width": "12%"
                }
            ],
            "createdRow": (row, data, index) => {
                const rowJq = $(row);
                rowJq.attr('data-siteid', data.siteId);
                if (data.siteStatus === 'OPEN' || data.siteStatus === 'EXPANDING') {
                    rowJq.addClass('success');
                }
            },
            "drawCallback": () => {
                // Don't bother with tooltips on narrow (usually mobile) devices
                if (window.innerWidth <= 928) return;
                
                $("li img.wait").addClass("show");
                window.changesTooltips = performance.now();
                window.changesIcons = [];
                $("#changes-table img, #changes-table span.details").each(function () {
                    window.changesIcons.push($(this));
                });

                const icon = $('#changes-table th.dt-control b')[0];
                icon.className = icon.className.replace("down", "right");
                icon.title = "show all details";

                clearInterval(window.changesInterval);
                window.changesInterval = setInterval(() => {
                    // Asynchronously initialize tooltips, starting from both ends of the table and working toward the middle
                    for (var i1 = 0; i1 < 40 && window.changesIcons.length > 0; i1++) {
                        window.changesIcons.shift().tooltip({ "container": "body" });
                    }
                    for (var i2 = 0; i2 < 10 && window.changesIcons.length > 0; i2++) {
                        window.changesIcons.pop().tooltip({ "container": "body" });
                    }
                    if (window.changesIcons.length === 0) {
                        clearInterval(window.changesInterval);
                        $("li img.wait").removeClass("show");
                        console.log(`Changes tooltips: t=${(performance.now() - window.changesTooltips)}`);
                    }
                }, 100);
            },
            "dom": "" +
                "<'row'<'col-sm-3'><'#changes-title.col-sm-6'><'col-sm-3'l>>" +
                "<'row'<'col-sm-12'tr>>" +
                "<'row'<'col-sm-12 text-center'p>>" +
                "<'row'<'col-sm-12 text-center'i>>"
        };

    }

    hideTooltips() {
        window.changesIcons = [];
        $(".tooltip").tooltip("hide");
    }

}
