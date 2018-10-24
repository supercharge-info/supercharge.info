import Strings from "./Strings";
import Objects from "./Objects";


const Dates = {};

/**
 *  Creates a date from a string with this format: YYYY-MM-DD
 */
Dates.fromString = function (string) {
    const parts = string.split('-');
    if (parts.length === 3) {
        return new Date(parts[0], parts[1] - 1, parts[2]);
    }
    throw new Error("invalid date: " + string);
};

/**
 * Converts a date object to a string with format YYYY-MM-DD
 */
Dates.toString = function (date) {
    if (Objects.isNullOrUndef(date)) {
        return "";
    }
    return date.getFullYear() + "-" + Strings.padLeft((date.getMonth() + 1), "0", 2) + "-" + Strings.padLeft(date.getDate(), "0", 2);
};

export default Dates;

