import TotalOpen from "./TotalOpen";
import SiteSorting from "../../site/SiteSorting";
import SitePredicates from "../../site/SitePredicates";
import SiteIterator from "../../site/SiteIterator";
import Highcharts from "highcharts";


export default class MonthlyOpenLocationBarChart {

    constructor(type, location) {
        this.type = type || 'Region';
        this.location = location;
    }

    draw() {

        const liveByLocationCounts = {};
        const livePerMonthByLocation = {};
        const today = new Date();
        const thisMonth = Date.UTC(today.getFullYear(), today.getMonth());
        const type = (this.type == 'Province' ? 'State' : this.type).toLowerCase();
        const location = this.location;

        new SiteIterator()
            .withPredicate(SitePredicates.IS_OPEN)
            .withPredicate(SitePredicates.IS_COUNTED)
            .iterate((supercharger) => {
                const date = supercharger.dateOpened;
                const monthUTC = Date.UTC(date.getFullYear(), date.getMonth());

                // Skip partial month data to avoid a dropoff
                if (monthUTC == thisMonth) {
                    return;
                } else if (type == 'country' && supercharger.address.region !== location) {
                    return;
                } else if (type == 'state' && supercharger.address.country !== location) {
                    return;
                }

                // Initialize new location
                if (!(supercharger.address[type] in livePerMonthByLocation)) {
                    livePerMonthByLocation[supercharger.address[type]] = {};
                    liveByLocationCounts[supercharger.address[type]] = 0;
                }

                // Get location data
                const locationCountList = livePerMonthByLocation[supercharger.address[type]];

                // Initialize new month
                if (!(monthUTC in locationCountList)) {
                    locationCountList[monthUTC] = 0;
                }

                // Increment supercharger count for this month for this location
                locationCountList[monthUTC]++;
                liveByLocationCounts[supercharger.address[type]]++;
            });

        const plotLinesArray = TotalOpen.buildVerticalYearEndPlotLines();
        const locations = Object.entries(liveByLocationCounts).sort((a, b) => b[1] - a[1]).slice(0, 5).map(a => a[0]);
        let seriesData = Object.entries(livePerMonthByLocation).filter(a => locations.includes(a[0]))
            .sort((a, b) => locations.indexOf(b[0]) - locations.indexOf(a[0])) // Provide consistent order across charts
            .map(a => ({ name: a[0], data: Object.entries(a[1]).map(b => [ Number(b[0]), b[1] ]) }));

        Highcharts.chart("monthly-open-location-bar-chart", {
            chart: {
                type: 'column'
            },
            credits: {
                enabled: false
            },
            title: {
                text: 'Superchargers Opened each Month by ' + this.type + ': ' + (this.location || 'World Wide') + (Object.keys(liveByLocationCounts).length > 5 ? ' <span style="color:#aaaaaa">(top five)</span>' : '')
            },
            subtitle: {
                text: null
            },
            legend: {
                enabled: true,
                borderWidth: 0,
                reversed: true
            },
            xAxis: {
                type: 'datetime',
                dateTimeLabelFormats: {
                    month: '%b %Y'
                },
                plotLines: plotLinesArray
            },
            yAxis: {
                title: {
                    text: 'New Superchargers'
                },
                allowDecimals: false
            },
            plotOptions: {
                column: {
                    stacking: 'normal',
                    dataLabels: {
                        enabled: false
                    }
                }
            },
            series: seriesData
        });
    };

};
