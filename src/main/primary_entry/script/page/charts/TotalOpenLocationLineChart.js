import SiteSorting from "../../site/SiteSorting";
import SitePredicates from "../../site/SitePredicates";
import TotalOpen from "./TotalOpen";
import SiteIterator from "../../site/SiteIterator";
import Highcharts from "highcharts";

export default class TotalOpenLocationLineChart {

    constructor(type, location, locationId) {
        this.type = type || 'World';
        this.location = location || 'World Wide';
        this.locationId = locationId;
    }

    draw() {

        const livePerDate = [];
        let count = 0;

        function removePreviousIfSameDate(array, dateUTC) {
            if (array.length > 0 && array[array.length - 1][0] === dateUTC) {
                array.pop();
            }
        }

        let iter = new SiteIterator()
            .withPredicate(SitePredicates.IS_OPEN)
            .withPredicate(SitePredicates.IS_COUNTED);
        if (this.type == 'Region') {
            iter.withPredicate(SitePredicates.buildRegionPredicate(this.locationId));
        } else if (this.type == 'Country') {
            iter.withPredicate(SitePredicates.buildCountryPredicate(this.locationId));
        }
        iter.withSort(SiteSorting.BY_OPENED_DATE)
            .iterate((supercharger) => {
                const date = supercharger.dateOpened;
                const dateUTC = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
                count++;
                removePreviousIfSameDate(livePerDate, dateUTC);
                livePerDate.push([dateUTC, count]);
            });

        const plotLinesArray = TotalOpen.buildVerticalYearPlotLines();
        const location = this.location;


        Highcharts.chart("total-open-location-line-chart", {
            chart: {
                zoomType: 'x',
                type: 'spline'
            },
            credits: {
                enabled: false
            },
            title: {
                text: `Open Superchargers: ${this.location}`
            },
            subtitle: {
                text: null
            },
            legend: {
                enabled: false
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
                    return `<b>${location}</b><br/>` +
                        Highcharts.dateFormat('%b %e %Y', this.x) + '<br/>' +
                        "superchargers: " + this.y;
                }
            },

            series: [
                {
                    data: livePerDate,
                    color: '#B22222',
                    lineWidth: 1,
                    marker: {
                        enabled: livePerDate[livePerDate.length - 1][1] < 100,
                        radius: 3,
                        fillColor: '#B22222'
                    }
                }

            ]
        });


    };

};

