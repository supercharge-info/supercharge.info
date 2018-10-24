class Address {

    constructor() {
    }

    static fromJSON(jsonObject) {
        const a = new Address();
        a.street = jsonObject.street;
        a.city = jsonObject.city;
        a.state = jsonObject.state;
        a.zip = jsonObject.zip;
        a.countryId = jsonObject.countryId;
        a.country = jsonObject.country;
        a.regionId = jsonObject.regionId;
        a.region = jsonObject.region;
        return a;
    };

    isNorthAmerica() {
        return this.region === Address.REGION_NORTH_AMERICA;
    };

    isAsia() {
        return this.region === Address.REGION_ASIA_PACIFIC;
    };

    isEurope() {
        return this.region === Address.REGION_EUROPE;
    };


}

/**
 * Country name constants.
 */
Address.COUNTRY_AUSTRAILIA = "Australia";
Address.COUNTRY_CHINA = "China";
Address.COUNTRY_JAPAN = "Japan";
Address.COUNTRY_USA = "USA";
Address.COUNTRY_CANADA = "Canada";
Address.COUNTRY_WORLD = "World";

Address.REGION_EUROPE = "Europe";
Address.REGION_NORTH_AMERICA = "North America";
Address.REGION_ASIA_PACIFIC = "Asia Pacific";


export default Address;


