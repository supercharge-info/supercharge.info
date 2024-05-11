import SiteSorting from "../../site/SiteSorting";
import SitePredicates from "../../site/SitePredicates";
import TotalOpen from "./TotalOpen";
import SiteIterator from "../../site/SiteIterator";
import Highcharts from "highcharts";

export default class TotalOpenWorldLineChart {

    draw() {

        const livePerDate = [];
        let count = 0;

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
                count++;
                removePreviousIfSameDate(livePerDate, dateUTC);
                livePerDate.push([dateUTC, count]);
            });

        const plotLinesArray = TotalOpen.buildVerticalYearPlotLines();

        return Highcharts.chart("total-open-world-line-chart", {
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
                text: 'Open Superchargers'
            },
            subtitle: {
                text: null
            },
            legend: {
                enabled: false
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
                headerFormat: '<b>World Wide</b><br/>',
                pointFormat: '{point.x:%b %e %Y}<br/>superchargers: <b>{point.y:,.0f}</b>'
            },
            series: [
                {
                    data: livePerDate,
                    color: '#B22222',
                    lineWidth: 1
                }

            ]
        });

    }

}

