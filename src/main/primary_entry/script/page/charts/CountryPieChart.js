import $ from "jquery";
import Address from "../../site/Address";
import SiteCount from "../../site/SiteCount";
import Highcharts from "highcharts";


export default class CountryPieChart {

    draw() {

        // Make monochrome colors and set them as default for all pies
        Highcharts.getOptions().plotOptions.pie.colors = (function () {
            const colors = [],
                base = '#FF6666';
            let i;

            for (i = 0; i <= 10; i++) {
                // Start out with a darkened base color (negative brighten), and end up with a much brighter color
                colors.push(Highcharts.Color(base).brighten((i - 6) / 11).get());
            }
            return colors;
        }());

        const countrySiteCountList = SiteCount.getCountListByCountry();
        const countryOpenCountList = [];
        let otherSum = 0;
        let count = 0;
        $.each(countrySiteCountList, function (index, value) {
            if (value.key !== Address.COUNTRY_WORLD) {
                count++;
                if (count <= 10) {
                    countryOpenCountList.push([value.key, value.open]);
                } else {
                    otherSum = otherSum + value.open;
                }
            }
        });
        countryOpenCountList.push(['Other', otherSum]);

        const countryStallCountList = SiteCount.getStallCountListByCountry();
        const countryOpenStallCountList = [];
        otherSum = 0;
        count = 0;
        $.each(countryStallCountList, function (index, value) {
            if (value.key !== Address.COUNTRY_WORLD) {
                count++;
                if (count <= 10) {
                    countryOpenStallCountList.push([value.key, value.open]);
                } else {
                    otherSum = otherSum + value.open;
                }
            }
        });
        countryOpenStallCountList.push(['Other', otherSum]);

        var chartOptions = {
            credits: {
                enabled: false
            },
            chart: {
                style: {
                    fontFamily: "'Roboto Flex', sans-serif"
                },
                plotBackgroundColor: null,
                plotBorderWidth: null,
                plotShadow: false
            },
            accessibility: {
                enabled: false
            },
            title: {
                text: 'Open Sites per Country <span style="color:#aaaaaa">(top ten)</span>'
            },
            tooltip: {
                pointFormat: '{series.name}: {point.y}, <b>{point.percentage:.1f}%</b>'
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
                    name: "Open Sites",
                    data: countryOpenCountList
                }
            ]
        };

        const pieContainer = document.getElementById("chart-country-pie");

        const siteContainer = document.createElement("span");
        siteContainer.style.display = "inline-block";
        siteContainer.style.width = "49%";
        pieContainer.appendChild(siteContainer);
        Highcharts.chart(siteContainer, chartOptions);

        chartOptions.title.text = 'Open Stalls per Country <span style="color:#aaaaaa">(top ten)</span>';
        chartOptions.series[0].name = "Open Stalls";
        chartOptions.series[0].data = countryOpenStallCountList;

        const stallContainer = document.createElement("span");
        stallContainer.style.display = "inline-block";
        stallContainer.style.width = "49%";
        pieContainer.appendChild(stallContainer);
        Highcharts.chart(stallContainer, chartOptions);
    }

}