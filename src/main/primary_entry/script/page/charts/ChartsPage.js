import Address from "../../site/Address";
import TotalOpenWorldLineChart from "./TotalOpenWorldLineChart";
import TotalOpenRegionLineChart from "./TotalOpenRegionLineChart";
import CountryBarChart from "./CountryBarChart";
import CountryPieChart from "./CountryPieChart";
import StateBarChart from "./StateBarChart";
import StatusDaysBarChart from "./StatusDaysBarChart";
import StallCountChart from "./StallCountChart";
import $ from "jquery";

export default class ChartsPage {

    onPageShow() {
        if (!this.initialized) {
            new TotalOpenWorldLineChart().draw();
            new TotalOpenRegionLineChart().draw();
            new StallCountChart().draw();
            new CountryPieChart().draw();
            new CountryBarChart().draw();
            new StateBarChart(Address.COUNTRY_USA).draw();
            new StateBarChart(Address.COUNTRY_CHINA).draw();
            new StatusDaysBarChart().draw();
            this.initialized = true;
        }

        // highcharts 7.0+ tries to be too clever about responsive size and ends up shrinking every chart's height by default
        $('#page-charts div').css("overflow", "visible");
    };

    onPageHide() {
    }


};



