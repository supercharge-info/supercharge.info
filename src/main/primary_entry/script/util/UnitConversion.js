//import _ from 'lodash'

/**
 * Utility function for converting between units.
 */
const unitConversion = (sourceUnit, targetUnit, precision) =>  (value) => {
    const valueInMeters = 1.0 * value * sourceUnit.meters;
    return parseFloat((valueInMeters / targetUnit.meters).toFixed(precision));
};

export default unitConversion;