import EventBus from "../util/EventBus";
import SiteCount from "../site/SiteCount";
import Address from "../site/Address";
import $ from "jquery";
import L from 'leaflet';

/**
 *
 * @constructor
 */
class TotalCountPanel {

    constructor() {
        this.table = $("#total-count-table");
        this.countMapCountry = SiteCount.getCountMapByCountry();
        this.countMapRegion = SiteCount.getCountMapByRegion();
        this.updateView(0, this.countMapCountry[Address.COUNTRY_WORLD]);
        EventBus.addListener("map-viewport-change-event", this.mapViewPortChanged, this);

        TotalCountPanel.USA = L.latLngBounds(L.latLng(24.44715, -125.15625), L.latLng(49.0, -65.961914));
        TotalCountPanel.USAPACIFIC = L.latLngBounds(L.latLng(18.7, -179.999999), L.latLng(71.6, -140.976562));
        TotalCountPanel.CANADA = L.latLngBounds(L.latLng(43.2, -140.976562), L.latLng(83.2, -52.5));
        TotalCountPanel.SOUTHAMERICA = L.latLngBounds(L.latLng(-59.7, -92.2), L.latLng(12.8, -26.0));
        TotalCountPanel.EUROPE = L.latLngBounds(L.latLng(35.38905, -25.0), L.latLng(81.0, 37.265625));
        TotalCountPanel.MEA = L.latLngBounds(L.latLng(-35.0, -17.75), L.latLng(39.783, 63.3333));
        TotalCountPanel.ASIA = L.latLngBounds(L.latLng(-56.0, 46.48), L.latLng(82.0, 179.999999));
        TotalCountPanel.AUSTRALIA = L.latLngBounds(L.latLng(-44.06, 109.951172), L.latLng(-10.68, 156.796875));
        TotalCountPanel.CHINA = L.latLngBounds(L.latLng(18.18, 79.88), L.latLng(53.56, 127.62));
        TotalCountPanel.JAPAN = L.latLngBounds(L.latLng(26.0, 127.62), L.latLng(45.72, 147.436523));

        TotalCountPanel.ALL = {
            "USA": TotalCountPanel.USA,
            "USP": TotalCountPanel.USAPACIFIC, 
            "CAN": TotalCountPanel.CANADA, 
            "SAM": TotalCountPanel.SOUTHAMERICA, 
            "EUR": TotalCountPanel.EUROPE, 
            "MEA": TotalCountPanel.MEA, 
            "ASI": TotalCountPanel.ASIA, 
            "AUS": TotalCountPanel.AUSTRALIA, 
            "CHN": TotalCountPanel.CHINA, 
            "JPN": TotalCountPanel.JAPAN
        };
    }

    mapViewPortChanged(event, latLngBounds) {
        const center = latLngBounds.getCenter();

        if (TotalCountPanel.USA.contains(center)) {
            this.updateView(1, this.countMapCountry[Address.COUNTRY_USA]);
        } else if (TotalCountPanel.CANADA.contains(center)) {
            this.updateView(1, this.countMapCountry[Address.COUNTRY_CANADA]);
        } else if (TotalCountPanel.EUROPE.contains(center)) {
            this.updateView(1, this.countMapRegion[Address.REGION_EUROPE]);
        }
        /* Japan is inside of Asia */
        else if (TotalCountPanel.JAPAN.contains(center)) {
            this.updateView(1, this.countMapCountry[Address.COUNTRY_JAPAN]);
        }
        /* China is inside of Asia */
        else if (TotalCountPanel.CHINA.contains(center)) {
            this.updateView(1, this.countMapCountry[Address.COUNTRY_CHINA]);
        }
        /* Australia is inside of Asia */
        else if (TotalCountPanel.AUSTRALIA.contains(center)) {
            this.updateView(1, this.countMapCountry[Address.COUNTRY_AUSTRAILIA]);
        }
        else if (TotalCountPanel.ASIA.contains(center)) {
            this.updateView(1, this.countMapRegion[Address.REGION_ASIA_PACIFIC]);
        }
        else {
            this.updateView(1, this.countMapRegion[Address.REGION_NORTH_AMERICA]);
        }

    };

    updateView(row, countMap) {
        const row1 = this.table.find("tr").eq(row);
        const nonControlCells = row1.find("td[rowspan!=2]");
        nonControlCells.eq(0).text(countMap.open);
        nonControlCells.eq(1).text(countMap.construction);
        nonControlCells.eq(2).text(countMap.permit);
        nonControlCells.eq(3).text(countMap.key);
    };

}


export default TotalCountPanel;

