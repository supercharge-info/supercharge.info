import $ from "jquery";
import ChartColor from "./ChartColor";
import Highcharts from "highcharts";
import TotalOpen from "./TotalOpen";
import ServiceURL from "../../common/ServiceURL";
import dayjs from "dayjs";

export default class StatusPaceChart {

    /**
     * Changes by date
     *
     * RETURNED MAP:
     *
     *  {
     *    '2012-11-19': { 'OPEN': 4 },
     *    '2012-12-16': { 'OPEN': 2 },
     *    ...
     *    '2024-03-21': { 'OPEN': 3, 'CLOSED_TEMP': 1, 'CONSTRUCTION': 3, 'PERMIT': 3 },
     *    ...
     *  }
     */
    draw() {
        var utc = require('dayjs/plugin/utc');
        dayjs.extend(utc);
        $.getJSON(ServiceURL.CHANGES_BY_DATE).done($.proxy(this.drawImpl, this));
    }

    drawImpl(changes) {
        const mapOpen = {}, mapConstruction = {}, mapPlan = {}, mapClosed = {};
        const changesByDateOpen = [];
        const changesByDateConstruction = [];
        const changesByDatePlan = [];
        const changesByDateClosed = [];

        $.each(changes, function (key, value) {
            const date = dayjs(key).utc();
            //const qtr = Math.floor(date.month() / 3) * 3;
            const utc = Date.UTC(date.year(), date.month(), 1, 0, 0, 0);
            if (value.OPEN > 0 || value.EXPANDING > 0) mapOpen[utc] = (mapOpen[utc] ?? 0) + (value.OPEN ?? 0) + (value.EXPANDING ?? 0);
            if (value.CONSTRUCTION > 0) mapConstruction[utc] = (mapConstruction[utc] ?? 0) + value.CONSTRUCTION;
            if (value.PLAN > 0 || value.PERMIT > 0 || value.VOTING > 0) mapPlan[utc] = (mapPlan[utc] ?? 0) + (value.PLAN ?? 0) + (value.PERMIT ?? 0) + (value.VOTING ?? 0);
            if (value.CLOSED_TEMP > 0 || value.CLOSED_PERM > 0) mapClosed[utc] = (mapClosed[utc] ?? 0) + (value.CLOSED_TEMP ?? 0) + (value.CLOSED_PERM ?? 0);
        });
        var d;
        for (d in mapOpen) changesByDateOpen.push([parseInt(d), mapOpen[d]]);
        for (d in mapConstruction) changesByDateConstruction.push([parseInt(d), mapConstruction[d]]);
        for (d in mapPlan) changesByDatePlan.push([parseInt(d), mapPlan[d]]);
        for (d in mapClosed) changesByDateClosed.push([parseInt(d), mapClosed[d]]);

        const plotLinesArray = TotalOpen.buildVerticalYearPlotLines();

        Highcharts.chart("chart-status-pace-bar", {
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
                text: 'Changes by Month'
            },
            subtitle: {
                text: null
            },
            legend: {
                enabled: true,
                borderWidth: 0
            },
            xAxis: {
                type: 'datetime',
                plotLines: plotLinesArray
            },
            yAxis: {
                //type: 'logarithmic',
                title: {
                    text: 'Change Count'
                },
                labels: {
                    format: '{value:.0f}'
                }//,
                //min: 0.1
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
                    name: "Closed",
                    data: changesByDateClosed,
                    color: ChartColor.STATUS_CLOSED
                },
                {
                    name: "Plan",
                    data: changesByDatePlan,
                    color: ChartColor.STATUS_PLAN
                },
                {
                    name: "Construction",
                    data: changesByDateConstruction,
                    color: ChartColor.STATUS_CONSTRUCTION
                },
                {
                    name: "Open",
                    data: changesByDateOpen,
                    color: ChartColor.STATUS_OPEN
                }
            ],
            tooltip: {
                shared: true,
                headerFormat: '<b><i>{point.key}</i></b><br/>',
                footerFormat: '<b>Total Changes: {point.total}</b>'
            }

        });

    }

}

