import TotalOpen from "./TotalOpen";
import SiteSorting from "../../site/SiteSorting";
import SitePredicates from "../../site/SitePredicates";
import SiteIterator from "../../site/SiteIterator";
import Highcharts from "highcharts";


export default class MonthlyOpenRegionBarChart {

    constructor(state) {
        this.state = state;
    }

    draw() {

        const topFive = {};
        const byRegion = {};

        let curDate = undefined;

        new SiteIterator()
            .withPredicate(SitePredicates.IS_OPEN)
            .withPredicate(SitePredicates.IS_COUNTED)
            .withSort(SiteSorting.BY_OPENED_DATE)
            .iterate((supercharger) => {
                const date = supercharger.dateOpened;
                const monthUTC = Date.UTC(date.getFullYear(), date.getMonth());

                // Skip partial month data to avoid a dropoff
                if(monthUTC == thisMonth) {
                    return;
                }

                // This method supports new regions (ie. Africa)
                if(!(supercharger.address.region in livePerMonthByRegion)) {
                    livePerMonthByRegion[supercharger.address.region] = {};
                }

                // Get region data
                const regionCountList = livePerMonthByRegion[supercharger.address.region];

                // Initialize new month
                if(!(monthUTC in regionCountList)) {
                    regionCountList[monthUTC] = 0;
                }

                // Increment supercharger count for this month for this region
                regionCountList[monthUTC]++;
            });

        let seriesData = Object.entries(livePerMonthByRegion).map(a => ({ name: a[0], data: Object.entries(a[1]).map(b => [ Number(b[0]), b[1] ]) }));
        let plotLinesArray = TotalOpen.buildVerticalYearEndPlotLines();

        Highcharts.chart("monthly-open-region-bar-chart", {
            chart: {
                type: 'column'
            },
            credits: {
                enabled: false
            },
            title: {
                text: 'Superchargers Opened each Month by Region'
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
