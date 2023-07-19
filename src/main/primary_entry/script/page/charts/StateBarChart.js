import $ from "jquery";
import Address from "../../site/Address";
import SiteCount from "../../site/SiteCount";
import Highcharts from "highcharts";
import ChartColor from "./ChartColor";


export default class CountryBarChart {
    constructor(country) {
        this.country = country;
    }

    draw() {

        const stateSiteCountList = SiteCount.getCountListByState(this.country);

        const stateNameList = [];
        const stateOpenCountList = [];
        const stateConstructionCountList = [];
        const statePermitCountList = [];

        $.each(stateSiteCountList, function (index, value) {
            if (value.key !== Address.COUNTRY_WORLD) {
                stateNameList.push(value.key);
                stateOpenCountList.push(value.open);
                stateConstructionCountList.push(value.construction);
                statePermitCountList.push(value.permit);
            }
        });

        const chartTitle = 'Superchargers per ' + (this.country === Address.COUNTRY_CHINA ? 'Province' : 'State') + ': ' + this.country;

        Highcharts.chart("open-per-state-chart-" + this.country, {
            chart: {
                style: {
                    fontFamily: "'Roboto Flex', sans-serif"
                },
                type: 'column'
            },
            accessibility: {
                enabled: false
            },
            credits: {
                enabled: false
            },
            title: {
                text: chartTitle
            },
            subtitle: {
                text: null
            },
            legend: {
                enabled: true,
                borderWidth: 0,
                reversed: true
            },
            xAxis: {
                categories: stateNameList
            },
            yAxis: {
                title: {
                    text: 'Supercharger Count'
                },
                tickInterval: 5,
                allowDecimals: false
            },
            plotOptions: {
                column: {
                    stacking: 'normal',
                    dataLabels: {
                        enabled: false
                    }
                }
            },
            series: [
                {
                    name: "Permit",
                    data: statePermitCountList,
                    color: ChartColor.STATUS_PERMIT
                },
                {
                    name: "Construction",
                    data: stateConstructionCountList,
                    color: ChartColor.STATUS_CONSTRUCTION
                },
                {
                    name: "Open",
                    data: stateOpenCountList,
                    color: ChartColor.STATUS_OPEN
                }
            ]
        });


    }

}


