import Highcharts from "highcharts";
import ServiceURL from "../../common/ServiceURL";
import $ from "jquery";
import Dates from "../../util/Dates";
import TotalOpen from "./TotalOpen";

export default class StallCountChart {


    draw() {
        $.getJSON(ServiceURL.SITE_STALL_COUNT).done($.proxy(this.drawImpl, this));
    }

    drawImpl(counts) {

        const stallCounts = [];

        const plotLinesArray = TotalOpen.buildVerticalYearPlotLines();

        counts.forEach((count) => {
            const date = Dates.fromString(count.date);
            const dateUTC = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
            stallCounts.push([dateUTC, count.stallCount]);
        });

        Highcharts.chart("open-stalls-world-line-chart", {
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
                text: 'Open Supercharger <b>Stalls</b> Globally'
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
                    text: 'Open Stall Count'
                }
            },
            tooltip: {
                headerFormat: '<b>Open Stalls</b><br/>',
                pointFormat: '{point.x:%b %e %Y}<br/><b>{point.y:,.0f}</b>'
            },

            series: [
                {
                    data: stallCounts,
                    color: '#B22222',
                    lineWidth: 1
                }

            ]
        });


    }

}

