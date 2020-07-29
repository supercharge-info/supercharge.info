import Highcharts from "highcharts";
import ServiceURL from "../../common/ServiceURL";
import $ from "jquery";
import Dates from "../../util/Dates";

export default class StallCountChart {


    draw() {
        $.getJSON(ServiceURL.SITE_STALL_COUNT).done($.proxy(this.drawImpl, this));
    }

    drawImpl(counts) {

        const stallCounts = [];

        counts.forEach((count) => {
            const date = Dates.fromString(count.date);
            const dateUTC = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
            stallCounts.push([dateUTC, count.stallCount])
        });

        Highcharts.chart("open-stalls-world-line-chart", {
            chart: {
                zoomType: 'x',
                type: 'spline'
            },
            credits: {
                enabled: false
            },
            title: {
                text: 'Open Superchargers <b>Stalls</b> Globally'
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
                    day: '%b %e',
                    week: '%b %e',
                    month: '%b %e',
                    year: '%b %e'
                }
            },
            yAxis: {
                title: {
                    text: 'Open Stall Count'
                }
            },
            tooltip: {
                formatter: function () {
                    return '<b>Open Stalls</b><br/>' +
                        Highcharts.dateFormat('%b %e %Y', this.x) + '<br/>' +
                        this.y;
                }
            },

            series: [
                {
                    data: stallCounts,
                    color: '#B22222',
                    lineWidth: 1,
                    marker: { radius: 3 }
                }

            ]
        });


    };

};

