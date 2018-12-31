import _ from 'lodash'

/**
 * Utility function for converting between units.
 */
const unitConversion = (sourceUnit, targetUnit, precision) =>  (value) => {
    const valueInMeters = 1.0 * value * sourceUnit.meters;
    return _.round(valueInMeters / targetUnit.meters, precision);
};

export default unitConversion;