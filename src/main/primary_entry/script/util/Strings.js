export default class Strings {

    static padLeft(string, padString, length) {
        let result = '' + string;
        while (result.length < length) {
            result = padString + result;
        }
        return result;
    }

    static emptyIfNull(string) {
        return string === null ? "" : string;
    }

    /**
     * True if not undefined, not null, not zero length, and not all white space.
     */
    static isNotEmpty(object) {
        return object !== null && (typeof object === 'string') && object.trim().length > 0;
    }

    static equalsIgnoreCase(s1, s2) {
        if (s1 !== null && s2 !== null) {
            return s1.toLowerCase() === s2.toLowerCase();
        }
        return s1 === null && s2 === null;
    }


}

