import SiteSorting from "../../site/SiteSorting";
import SitePredicates from "../../site/SitePredicates";
import ChartColor from "./ChartColor";
import SiteIterator from "../../site/SiteIterator";
import Highcharts from "highcharts";


export default class StatusDaysBarChart {

    draw() {

        const siteNameList = [];
        const constructionDaysList = [];
        const permitDaysList = [];

        new SiteIterator()
            .withPredicate(SitePredicates.or(SitePredicates.IS_CONSTRUCTION, SitePredicates.IS_PERMIT))
            .withSort(SiteSorting.BY_STATUS_DAYS)
            .iterate((supercharger) => {
                siteNameList.push(supercharger.displayName);
                if (supercharger.isConstruction()) {
                    constructionDaysList.push(supercharger.statusDays);
                    permitDaysList.push(0);
                } else {
                    constructionDaysList.push(0);
                    permitDaysList.push(supercharger.statusDays);
                }
            });


        Highcharts.chart("status-days-bar-chart",
            StatusDaysBarChart._options(siteNameList, constructionDaysList, permitDaysList));


    };

    static _options(siteNameList, constructionDaysList, permitDaysList) {
        return {
            chart: {
                style: {
                    fontFamily: "'Roboto Flex', sans-serif"
                },
                type: 'bar',
                height: 2500
            },
            accessibility: {
                enabled: false
            },
            credits: {
                enabled: false
            },
            title: {
                text: 'Construction/Permit Status Days'
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
                categories: siteNameList
            },
            yAxis: {
                title: {
                    text: 'Days'
                },
                tickInterval: 30,
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
                    data: permitDaysList,
                    color: ChartColor.STATUS_PERMIT
                },
                {
                    name: "Construction",
                    data: constructionDaysList,
                    color: ChartColor.STATUS_CONSTRUCTION
                }
            ]
        }
    }


}





