import $ from "jquery";
import countryClient from '../../common/CountryClient';

import Address from "../../site/Address";
import CountryRegionControl from "../../common/CountryRegionControl";
import TotalOpenLocationLineChart from "./TotalOpenLocationLineChart";
import StatusTotalChart from "./StatusTotalChart";
import MonthlyOpenLocationBarChart from "./MonthlyOpenLocationBarChart";
import StatusLocationPieChart from "./StatusLocationPieChart";
import LocationBarChart from "./LocationBarChart";
import StatusDaysBarChart from "./StatusDaysBarChart";
import StallCountChart from "./StallCountChart";
//import Analytics from "../../util/Analytics";
//import WindowUtil from "../../util/WindowUtil";
//import ServiceURL from "../../common/ServiceURL";

export default class ChartsView {

    constructor() {
        this.regionControl = new CountryRegionControl(
            $("#charts-filter-div"),
            $.proxy(this.regionControlCallback, this)
        );

        const changesView = this;
        this.regionControl.init().done($.proxy(this.drawWorld, this));
    }

    regionControlCallback(whichSelect, newValue) {
        $('.highcharts-container').remove();
        if (whichSelect == 'region') {
            if (newValue) {
                this.drawRegion(this.regionControl.regionSelect.find('option:selected').text(), newValue);
            } else {
                this.drawWorld();
            }
        } else {
            if (newValue) {
                this.drawCountry(this.regionControl.countrySelect.find('option:selected').text(), newValue);
            } else if (this.regionControl.regionSelect.val()) {
                this.drawRegion(this.regionControl.regionSelect.find('option:selected').text(), newValue);
            } else {
                this.drawWorld();
            }
        }
    }

    drawWorld() {
        new TotalOpenLocationLineChart().draw();
        new StatusTotalChart('OPEN').draw();
        new MonthlyOpenLocationBarChart().draw();
        new StallCountChart().draw();
        new StatusLocationPieChart('Open').draw();
        new StatusLocationPieChart('Construction').draw();
        new StatusLocationPieChart('Permit').draw();
        new LocationBarChart().draw();
        new StatusDaysBarChart().draw();
    }

    drawRegion(region, regionId) {
        new TotalOpenLocationLineChart('Region', region, regionId).draw();
        new StatusTotalChart('OPEN', 'Country', region, regionId).draw();
        new MonthlyOpenLocationBarChart('Country', region).draw();
        new StatusLocationPieChart('Open', 'Country', region).draw();
        new StatusLocationPieChart('Construction', 'Country', region).draw();
        new StatusLocationPieChart('Permit', 'Country', region).draw();
        new LocationBarChart('Country', region).draw();
        new StatusDaysBarChart('Region', regionId).draw();
        //Analytics.sendEvent("charts", "select-region", newValue);
    }

    drawCountry(country, countryId) {
        const countriesWithStates = [Address.COUNTRY_CANADA, Address.COUNTRY_AUSTRALIA, Address.COUNTRY_CHINA, Address.COUNTRY_USA];
        const state = countriesWithStates.indexOf(country) % 2 ? 'State' : 'Province';

        new TotalOpenLocationLineChart('Country', country, countryId).draw();
        if(countriesWithStates.includes(country)) {
            new StatusTotalChart('OPEN', state, country, countryId).draw();
            new MonthlyOpenLocationBarChart(state, country).draw();
            new StatusLocationPieChart('Open', state, country).draw();
            new StatusLocationPieChart('Construction', state, country).draw();
            new StatusLocationPieChart('Permit', state, country).draw();
            new LocationBarChart(state, country).draw();
        }
        new StatusDaysBarChart('Country', countryId).draw();
        //Analytics.sendEvent("charts", "select-country", newValue);
    }

}
