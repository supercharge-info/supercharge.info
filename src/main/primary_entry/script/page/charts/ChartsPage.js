import Address from "../../site/Address";
import TotalOpenLocationLineChart from "./TotalOpenLocationLineChart";
import StatusTotalChart from "./StatusTotalChart";
import MonthlyOpenLocationBarChart from "./MonthlyOpenLocationBarChart";
import LocationBarChart from "./LocationBarChart";
import StatusLocationPieChart from "./StatusLocationPieChart";
import StateBarChart from "./StateBarChart";
import StatusDaysBarChart from "./StatusDaysBarChart";
import StallCountChart from "./StallCountChart";

export default class ChartsPage {

    onPageShow() {
        if (!this.initialized) {
            new TotalOpenLocationLineChart().draw();
            new StatusTotalChart('OPEN').draw();
            new MonthlyOpenLocationBarChart().draw();
            new StallCountChart().draw();
            new StatusLocationPieChart().draw();
            new LocationBarChart().draw();
            new StateBarChart(Address.COUNTRY_USA).draw();
            new StateBarChart(Address.COUNTRY_CHINA).draw();
            new StatusDaysBarChart().draw();
            this.initialized = true;
        }
    };

    onPageHide() {
    }

};
