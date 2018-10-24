const Asserts = {};

/**
 * Throws an error if the specified object is not an Integer.
 */
Asserts.isInteger = function (testArg, message) {
    if (!((typeof testArg === "number") && (Math.floor(testArg) === testArg))) {
        throw new Error(message);
    }
};

Asserts.isFalse = function (testArg, message) {
    if (testArg) {
        throw new Error(message);
    }
};

Asserts.isTrue = function (testArg, message) {
    if (!testArg) {
        throw new Error(message);
    }
};

export default Asserts;
