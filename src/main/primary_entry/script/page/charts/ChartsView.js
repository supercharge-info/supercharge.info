import $ from "jquery";
import countryClient from '../../common/CountryClient';
import userConfig from "../../common/UserConfig";

import Address from "../../site/Address";
import Analytics from "../../util/Analytics";
import CountryRegionControl from "../../common/CountryRegionControl";
import TotalOpenLocationLineChart from "./TotalOpenLocationLineChart";
import StatusTotalChart from "./StatusTotalChart";
import MonthlyOpenLocationBarChart from "./MonthlyOpenLocationBarChart";
import StatusLocationPieChart from "./StatusLocationPieChart";
import LocationBarChart from "./LocationBarChart";
import StatusDaysBarChart from "./StatusDaysBarChart";
import StallCountChart from "./StallCountChart";

export default class ChartsView {

    constructor() {
        this.regionControl = new CountryRegionControl(
            $("#charts-filter-div"),
            $.proxy(this.regionControlCallback, this)
        );

        const changesView = this;
        this.regionControl.init(userConfig.chartsPageRegionId, userConfig.chartsPageCountryId).done($.proxy(this.drawWorld, this));
    }

    regionControlCallback(whichSelect, newValue) {
        $('.highcharts-container').remove();
        if (whichSelect == 'region') {
            if (newValue) {
                this.drawRegion(this.regionControl.getRegionName(), newValue);
            } else {
                this.drawWorld();
            }
        } else {
            if (newValue) {
                this.drawCountry(this.regionControl.getCountryName(), newValue);
            } else if (this.regionControl.regionSelect.val()) {
                this.drawRegion(this.regionControl.getRegionName(), this.regionControl.getRegionId());
            } else {
                this.drawWorld();
            }
        }

        userConfig.setRegionCountryId("charts", "region", this.regionControl.getRegionId());
        userConfig.setRegionCountryId("charts", "country", this.regionControl.getCountryId());
        Analytics.sendEvent("charts", "select-" + whichSelect, newValue);
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
    }

}
