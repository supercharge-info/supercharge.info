export default class Unit {

    /**
     *
     * @param name 'Meters'
     * @param code 'm' (abbreviation)
     * @param meters '1.0' equivalent in meters
     */
    constructor(name, code, meters) {
        this.name = name;
        this.code = code;
        this.meters = meters;
    };

    getName() {
        return this.name;
    };

    getCode() {
        return this.code;
    };

    isMiles() {
        return this.code === "mi";
    };

    isKilometers() {
        return this.code === "km";
    };

    isMeters() {
        return this.code === "m";
    };

    isMetric() {
        return this.isKilometers() || this.isMeters();
    }
}



