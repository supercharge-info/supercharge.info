import SiteSorting from "../../site/SiteSorting";
import SitePredicates from "../../site/SitePredicates";
import SiteIterator from "../../site/SiteIterator";
import Highcharts from "highcharts";


export default class MonthlyOpenRegionBarChart {

    draw() {

        const livePerMonthByRegion = {};
        const monthDateList = [];
        const today = new Date();
        const thisMonth = Date.UTC(today.getFullYear(), today.getMonth());

        new SiteIterator()
            .withPredicate(SitePredicates.IS_OPEN)
            .withPredicate(SitePredicates.IS_COUNTED)
            .withSort(SiteSorting.BY_OPENED_DATE)
            .iterate((supercharger) => {
                const date = supercharger.dateOpened;
                const monthUTC = Date.UTC(date.getFullYear(), date.getMonth());

                if(monthUTC == thisMonth) {
                    return;
                }
                if(monthDateList.length == 0) {
                    monthDateList.push(monthUTC);
                }
                // This method supports new regions (ie. Africa)
                if(Object.keys(livePerMonthByRegion).indexOf(supercharger.address.region) < 0) {
                    livePerMonthByRegion[supercharger.address.region] = [];
                }

                const regionCountList = livePerMonthByRegion[supercharger.address.region];

                // Add missing months to data
                while(monthDateList[monthDateList.length - 1] != monthUTC) {
                    let prev = new Date(monthDateList[monthDateList.length - 1]);
                    monthDateList.push(Date.UTC(prev.getUTCFullYear(), prev.getUTCMonth() + 1));
                }
                while(regionCountList.length != monthDateList.length) {
                    regionCountList.push(0);
                }

                regionCountList[regionCountList.length - 1]++;
            });

        const regionNameList = Object.keys(livePerMonthByRegion);
        for(let regionName in livePerMonthByRegion) {
            let regionCountList = livePerMonthByRegion[regionName];
            while(monthDateList.length != regionCountList.length) {
                regionCountList.push(0);
            }
        }

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
                categories: monthDateList.map(d => new Date(d).toLocaleString('default', { timeZone: 'UTC', month: 'short', year: 'numeric' } ) )
            },
            yAxis: {
                title: {
                    text: 'Superchargers Opened'
                },
                allowDeecimals: false
            },
            plotOptions: {
                column: {
                    stacking: 'normal',
                    dataLabels: {
                        enabled: false
                    }
                }
            },
            series: Object.entries(livePerMonthByRegion).map(a => ({ name: a[0], data: a[1] }))
        });
    };

};
