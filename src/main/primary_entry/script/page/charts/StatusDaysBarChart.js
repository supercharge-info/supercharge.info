import SiteSorting from "../../site/SiteSorting";
import SitePredicates from "../../site/SitePredicates";
import ChartColor from "./ChartColor";
import SiteIterator from "../../site/SiteIterator";
import Highcharts from "highcharts";


export default class StatusDaysBarChart {

    draw() {

        const siteNameList = [];
        const constructionDaysList = [];
        const planDaysList = [];

        new SiteIterator()
            .withPredicate(SitePredicates.or(SitePredicates.IS_CONSTRUCTION, SitePredicates.IS_PERMIT, SitePredicates.IS_PLAN, SitePredicates.IS_VOTING))
            .withSort(SiteSorting.BY_STATUS_DAYS)
            .iterate((supercharger) => {
                siteNameList.push(supercharger.displayName);
                if (supercharger.isConstruction()) {
                    constructionDaysList.push(supercharger.statusDays);
                    planDaysList.push(0);
                } else {
                    constructionDaysList.push(0);
                    planDaysList.push(supercharger.statusDays);
                }
            });


        Highcharts.chart("status-days-bar-chart",
            StatusDaysBarChart._options(siteNameList, constructionDaysList, planDaysList));


    }

    static _options(siteNameList, constructionDaysList, planDaysList) {
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
                text: 'Construction/Plan Status Days'
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
                    name: "Plan",
                    data: planDaysList,
                    color: ChartColor.STATUS_PLAN
                },
                {
                    name: "Construction",
                    data: constructionDaysList,
                    color: ChartColor.STATUS_CONSTRUCTION
                }
            ]
        };
    }


}





