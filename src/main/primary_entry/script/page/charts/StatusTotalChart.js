import TotalOpen from "./TotalOpen";
import SiteSorting from "../../site/SiteSorting";
import SitePredicates from "../../site/SitePredicates";
import SiteIterator from "../../site/SiteIterator";
import Highcharts from "highcharts";


export default class StatusTotalChart {

    constructor(status, type, location, locationId) {
        this.status = status;
        this.type = type || 'Region';
        this.location = location || 'World Wide';
        this.locationId = locationId;
    }

    draw() {

        const byType = {};

        let iter = new SiteIterator()
            .withPredicate(SitePredicates.IS_COUNTED);
        if (this.type == 'Country') {
            iter.withPredicate(SitePredicates.buildRegionPredicate(this.locationId));
        } else if (this.type != 'Region') {
            iter.withPredicate(SitePredicates.buildCountryPredicate(this.locationId));
        }
        iter.iterate((supercharger) => {

                const location = this.type == 'Region' ? supercharger.address.region : this.type == 'Country' ? supercharger.address.country : supercharger.address.state;
                const statusHistory = supercharger.history.map( change => [Date.parse(change.date), change.siteStatus] );
                let enteredStatus = false;

                for(let index = 0; index < statusHistory.length; index++) {
                    let curEntry = statusHistory[index];

                    if(!enteredStatus && curEntry[1] == this.status) {

                        enteredStatus = true;
                        if(!(location in byType)) {
                            byType[location] = {};
                        }
                        byType[location][curEntry[0]] = (byType[location][curEntry[0]] || 0) + 1;

                    } else if(enteredStatus && curEntry[1] != this.status) {

                        enteredStatus = false;
                        byType[location][curEntry[0]] = (byType[location][curEntry[0]] || 0) - 1;

                    }
                }
            });

        // Convert changes to cumulative totals
        const today = Number(new Date(new Date().toISOString().split('T')[0]));
        const locationData = Object.entries(byType).map(a => {
            let count = 0;
            const data = Object.entries(a[1])
                .sort((a,b) => a[0] - b[0])
                .map(a => [Number(a[0]), count += a[1]]);

            // Extend chart from 0 to today
            if(data[data.length - 1][0] < today) {
                data.push([today, data[data.length - 1][1]]);
            }
            data.unshift([data[0][0] - Math.max((data[1][0] - data[0][0]) / 30, 24 * 60 * 60 * 1000), 0]);
            return {
                name: a[0],
                data: data,
                count: count // This will have incremented from the .map() call 1 line above
            };
        }).sort((a,b) => b.count - a.count).slice(0, 10);

        let plotLinesArray = TotalOpen.buildVerticalYearPlotLines();

        Highcharts.chart("total-open-by-location-line-chart", {
            chart: {
                zoomType: 'x',
                type: 'spline'
            },
            credits: {
                enabled: false
            },
            title: {
                text: 'Open Superchargers by ' + this.type + ': ' + this.location + (locationData.length != Object.keys(byType).length ? ' <span style="color:#aaaaaa">(top ten)</span>' : '')
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

            series: locationData.map(r => ({
                name: r.name,
                data: r.data,
                lineWidth: 1,
                marker: {
                    enabled: false,
                    radius: 3
                }
            }))
        });
    }

};
