/**
 * Utility class for converting between units.
 *
 * @constructor
 */
const UnitConversion = function (sourceUnit, targetUnit) {
    this.sourceUnit = sourceUnit;
    this.targetUnit = targetUnit;
};

UnitConversion.prototype.convert = function (value) {
    const valueInMeters = value * this.sourceUnit.meters;
    return Math.round(valueInMeters / this.targetUnit.meters);
};

export default UnitConversion;

