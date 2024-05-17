import SiteSorting from "../../site/SiteSorting";
import SitePredicates from "../../site/SitePredicates";
import SiteIterator from "../../site/SiteIterator";
import Address from "../../site/Address";
import TotalOpen from "./TotalOpen";
import Highcharts from "highcharts";


export default class TotalOpenRegionChart {

    draw() {

        const livePerDateNorthAmerica = [];
        const livePerDateAsia = [];
        const livePerDateEurope = [];

        let countNorthAmerica = 0;
        let countAsia = 0;
        let countEurope = 0;

        function removePreviousIfSameDate(array, dateUTC) {
            if (array.length > 0 && array[array.length - 1][0] === dateUTC) {
                array.pop();
            }
        }

        new SiteIterator()
            .withPredicate(SitePredicates.IS_OPEN_AND_COUNTED)
            .withSort(SiteSorting.BY_OPENED_DATE)
            .iterate((supercharger) => {
                const date = supercharger.dateOpened;
                const dateUTC = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());

                if (supercharger.address.isNorthAmerica()) {
                    countNorthAmerica++;
                    removePreviousIfSameDate(livePerDateNorthAmerica, dateUTC);
                    livePerDateNorthAmerica.push([dateUTC, countNorthAmerica]);

                } else if (supercharger.address.isAsia()) {
                    countAsia++;
                    removePreviousIfSameDate(livePerDateAsia, dateUTC);
                    livePerDateAsia.push([dateUTC, countAsia]);
                }
                else if (supercharger.address.isEurope()) {
                    countEurope++;
                    removePreviousIfSameDate(livePerDateEurope, dateUTC);
                    livePerDateEurope.push([dateUTC, countEurope]);
                }
            });

        const plotLinesArray = TotalOpen.buildVerticalYearPlotLines();


        Highcharts.chart("total-open-region-line-chart", {
            chart: {
                style: {
                    fontFamily: "'Roboto Flex', sans-serif"
                },
                zoomType: 'x',
                type: 'spline'
            },
            accessibility: {
                enabled: false
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
                plotLines: plotLinesArray
            },
            yAxis: {
                title: {
                    text: 'Open Count'
                },
                min: 0
            },
            tooltip: {
                headerFormat: '<b>{series.name}</b><br/>',
                pointFormat: '{point.x:%b %e %Y}<br/>superchargers: <b>{point.y:,.0f}</b>'
            },

            series: [
                {
                    name: Address.REGION_NORTH_AMERICA,
                    data: livePerDateNorthAmerica,
                    lineWidth: 1
                },
                {
                    name: Address.REGION_EUROPE,
                    data: livePerDateEurope,
                    lineWidth: 1
                },
                {
                    name: Address.REGION_ASIA_PACIFIC,
                    data: livePerDateAsia,
                    lineWidth: 1
                }

            ]
        });


    }

}