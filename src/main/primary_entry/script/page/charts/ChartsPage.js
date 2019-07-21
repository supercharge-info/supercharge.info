import Address from "../../site/Address";
import TotalOpenWorldLineChart from "./TotalOpenWorldLineChart";
import StatusTotalChart from "./StatusTotalChart";
import MonthlyOpenRegionBarChart from "./MonthlyOpenRegionBarChart";
import CountryBarChart from "./CountryBarChart";
import CountryPieChart from "./CountryPieChart";
import StateBarChart from "./StateBarChart";
import StatusDaysBarChart from "./StatusDaysBarChart";
import StallCountChart from "./StallCountChart";

export default class ChartsPage {

    onPageShow() {
        if (!this.initialized) {
            new TotalOpenWorldLineChart().draw();
            new StatusTotalChart('OPEN').draw();
            new MonthlyOpenRegionBarChart().draw();
            new StallCountChart().draw();
            new CountryPieChart().draw();
            new CountryBarChart().draw();
            new StateBarChart(Address.COUNTRY_USA).draw();
            new StateBarChart(Address.COUNTRY_CHINA).draw();
            new StatusDaysBarChart().draw();
            this.initialized = true;
        }
    };

    onPageHide() {
    }

};
