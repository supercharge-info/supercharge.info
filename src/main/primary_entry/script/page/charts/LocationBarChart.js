import $ from "jquery";
import Address from "../../site/Address";
import SiteCount from "../../site/SiteCount";
import Highcharts from "highcharts";
import ChartColor from "./ChartColor";


export default class LocationBarChart {
    constructor(type, location) {
        this.type = type || 'Country';
        this.location = location;
    }

    draw() {

        const stateSiteCountList = this.type == 'Country' ? SiteCount.getCountListByCountry(this.location) : SiteCount.getCountListByState(this.location);

        const locationNameList = [];
        const locationOpenCountList = [];
        const locationConstructionCountList = [];
        const locationPermitCountList = [];

        const type = this.type;
        const location = this.location;
        let titleLocation = location || 'World Wide';

        $.each(stateSiteCountList, function (index, value) {
            if (value.key !== Address.COUNTRY_WORLD && value.key !== Address.COUNTRY_CHINA && value.key !== Address.COUNTRY_USA && value.key !== 'CA') {
                locationNameList.push(value.key);
                locationOpenCountList.push(value.open);
                locationConstructionCountList.push(value.construction);
                locationPermitCountList.push(value.permit);
            } else if (value.key !== Address.COUNTRY_WORLD) {
                titleLocation = (location || 'World Wide') + ' <span style="color:#aaaaaa">(excluding '
                              + (type == 'Country' ? location ? value.key : 'USA/China' : 'California') + ')</span>';
            }
        });

        const chartTitle = 'Superchargers per ' + this.type + ': ' + titleLocation;

        Highcharts.chart("open-per-location-bar-chart", {
            chart: {
                type: 'column'
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
                categories: locationNameList
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
                    data: locationPermitCountList,
                    color: ChartColor.STATUS_PERMIT
                },
                {
                    name: "Construction",
                    data: locationConstructionCountList,
                    color: ChartColor.STATUS_CONSTRUCTION
                },
                {
                    name: "Open",
                    data: locationOpenCountList,
                    color: ChartColor.STATUS_OPEN
                }
            ]
        });


    };

};


