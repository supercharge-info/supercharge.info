import $ from "jquery";
import Address from "../../site/Address";
import PieColors from "./PieColors";
import SiteCount from "../../site/SiteCount";
import Highcharts from "highcharts";


export default class StatusLocationPieChart {

    constructor(status, type, location) {
        this.status = status;
        this.type = type || 'Country';
        this.location = location;
    }

    draw() {

        const statusSiteCountList = this.location ?
            this.type == 'Country' ?
                SiteCount.getCountListByCountry(this.location) :
                SiteCount.getCountListByState(this.location) :
                SiteCount.getCountListByCountry();
        const status = this.status.toLowerCase();
        const statusLocationCountList = [];

        let otherSum = 0;
        let count = 0;
        $.each(statusSiteCountList.sort((a, b) => b[status] - a[status]), function (index, value) {
            if (value.key !== Address.COUNTRY_WORLD) {
                count++;
                if (count <= 5) {
                    statusLocationCountList.push([value.key, value[status]]);
                } else {
                    otherSum = otherSum + value[status];
                }
            }
        });
        statusLocationCountList.push(['Other', otherSum]);
        while (statusLocationCountList.length > 0 && statusLocationCountList[statusLocationCountList.length - 1][1] == 0) {
            statusLocationCountList.pop();
        }

        Highcharts.chart(status + "-by-location-pie-chart", {
            credits: {
                enabled: false
            },
            chart: {
                plotBackgroundColor: null,
                plotBorderWidth: null,
                plotShadow: false
            },
            title: {
                text: this.status + ' Superchargers per ' + this.type + (otherSum > 0 ? ' <span style="color:#aaaaaa">(top five)</span>' : '')
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
                    colors: PieColors['STATUS_' + status.toUpperCase()],
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
                    name: this.status,
                    data: statusLocationCountList
                }
            ]
        });

    }

}
