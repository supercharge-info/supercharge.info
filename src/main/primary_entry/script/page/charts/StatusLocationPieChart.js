import $ from "jquery";
import Address from "../../site/Address";
import SiteCount from "../../site/SiteCount";
import Highcharts from "highcharts";


export default class StatusLocationPieChart {

    draw() {

        // Make monochrome colors and set them as default for all pies
        Highcharts.getOptions().plotOptions.pie.colors = (function () {
            const colors = [],
                base = '#FF6666';
            let i;

            for (i = 0; i < 10; i += 1) {
                // Start out with a darkened base color (negative brighten), and end up with a much brighter color
                colors.push(Highcharts.Color(base).brighten((i - 3) / 7).get());
            }
            return colors;
        }());

        const stateSiteCountList = SiteCount.getCountListByCountry();
        const countryOpenCountList = [];
        let otherSum = 0;

        let count = 0;
        $.each(stateSiteCountList, function (index, value) {
            if (value.key !== Address.COUNTRY_WORLD) {
                count++;
                if (count <= 5) {
                    countryOpenCountList.push([value.key, value.open]);
                } else {
                    otherSum = otherSum + value.open;
                }
            }
        });
        countryOpenCountList.push(['Other', otherSum]);

        Highcharts.chart("chart-country-pie", {
            credits: {
                enabled: false
            },
            chart: {
                plotBackgroundColor: null,
                plotBorderWidth: null,
                plotShadow: false
            },
            title: {
                text: 'Open Superchargers per Country <span style="color:#aaaaaa">(top five)</span>'
            },
            tooltip: {
                pointFormat: '{series.name}: {point.y}, <b>{point.percentage:.0f}%</b>'
            },
            subtitle: {
                text: null
            },
            plotOptions: {
                pie: {
                    allowPointSelect: true,
                    cursor: 'pointer',
                    dataLabels: {
                        enabled: true,
                        format: '<b>{point.name}</b>',
                        style: {
                            color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
                        },
                        connectorColor: 'silver'
                    }
                }
            },

            series: [
                {
                    type: 'pie',
                    name: "Open",
                    data: countryOpenCountList
                }
            ]
        });

    }

}
