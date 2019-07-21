import TotalOpen from "./TotalOpen";
import SiteSorting from "../../site/SiteSorting";
import SitePredicates from "../../site/SitePredicates";
import SiteIterator from "../../site/SiteIterator";
import Highcharts from "highcharts";


export default class StatusTotalChart {

    constructor(status) {
        this.status = status;
    }

    draw() {

        const byCountry = {};
        const byRegion = {};

        new SiteIterator()
            .withPredicate(SitePredicates.IS_COUNTED)
            .iterate((supercharger) => {

                const statusHistory = supercharger.history.map( change => [Date.parse(change.date), change.siteStatus] );
                let enteredStatus = false;

                for(let index = 0; index < statusHistory.length; index++) {
                    let curEntry = statusHistory[index];

                    if(!enteredStatus && curEntry[1] == this.status) {

                        enteredStatus = true;
                        if(!(supercharger.address.country in byCountry)) {
                            byCountry[supercharger.address.country] = {};
                        }
                        byCountry[supercharger.address.country][curEntry[0]] = (byCountry[supercharger.address.country][curEntry[0]] || 0) + 1;

                        if(!(supercharger.address.region in byRegion)) {
                            byRegion[supercharger.address.region] = {};
                        }
                        byRegion[supercharger.address.region][curEntry[0]] = (byRegion[supercharger.address.region][curEntry[0]] || 0) + 1;

                    } else if(enteredStatus && curEntry[1] != this.status) {

                        enteredStatus = false;
                        byCountry[supercharger.address.country][curEntry[0]] = (byCountry[supercharger.address.country][curEntry[0]] || 0) - 1;
                        byRegion[supercharger.address.region][curEntry[0]] = (byRegion[supercharger.address.region][curEntry[0]] || 0) - 1;

                    }
                }
            });

        // Convert changes to cumulative totals
        let regionData = [];
        for(let region in byRegion) {
            let count = 0;
            regionData.push({
                name: region,
                data: Object.entries(byRegion[region])
                    .sort((a,b) => a[0] - b[0])
                    .map( statusChange => [Number(statusChange[0]), count += statusChange[1]] ),
                count: count // This will have incremented from the .map() call 1 line above
            });
        }

        let countryData = [];
        for(let country in byCountry) {
            let count = 0;
            countryData.push({
                name: country,
                data: Object.entries(byCountry[country])
                    .sort((a,b) => a[0] - b[0])
                    .map( statusChange => [Number(statusChange[0]), count += statusChange[1]] ),
                count: count // This will have incremented from the .map() call 1 line above
            });
        }

        // Use only top 5 countries as of today's count
        countryData = countryData.sort((a,b) => b.count - a.count).slice(0, 5);

        let plotLinesArray = TotalOpen.buildVerticalYearPlotLines();

        Highcharts.chart("total-open-region-line-chart", {
            chart: {
                zoomType: 'x',
                type: 'spline'
            },
            credits: {
                enabled: false
            },
            title: {
                text: 'Open Superchargers by Region'
            },
            subtitle: {
                text: null
            },
            legend: {
                borderWidth: 0,
                enabled: true
            },
            xAxis: {
                type: 'datetime',
                dateTimeLabelFormats: {
                    month: '%b %e',
                    year: '%b'
                },
                plotLines: plotLinesArray
            },
            yAxis: {
                title: {
                    text: 'Open Count'
                },
                min: 0
            },
            tooltip: {
                formatter: function () {
                    return '<b>' + this.series.name + '</b><br/>' +
                        Highcharts.dateFormat('%b %e %Y', this.x) + '<br/>' +
                        "superchargers: " + this.y;
                }
            },

            series: regionData.map(r => ({
                name: r.name,
                data: r.data,
                lineWidth: 1,
                marker: { radius: 3 }
            }))
        });
    }

};
