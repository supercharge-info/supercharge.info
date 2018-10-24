export default class Objects {

    /**
     * Returns "" if the object is null.
     */
    static nullSafeToString(object) {
        return Objects.isNullOrUndef(object) ? "" : object.toString();
    };

    /**
     * true if null or undefined
     */
    static isNullOrUndef(object) {
        return ((object === null) || (typeof object === 'undefined'));
    };

    /**
     * true if NOT null and NOT undefined
     */
    static isNotNullOrUndef(object) {
        return ((object !== null) && (typeof object !== 'undefined'));
    };

    /**
     * true if a number
     */
    static isNumber(testArg) {
        return (typeof testArg === "number") && !isNaN(testArg);
    };

    /**
     * Returns all properties (hasOwnProperty) of the specified object, sorted alphabetically, ascending.
     */
    static propertiesSorted(object) {
        const keys = [];
        for (let prop in object) {
            if (object.hasOwnProperty(prop)) {
                keys.push(prop);
            }
        }
        keys.sort();
        return keys;
    };


};