const Numbers = {};

/**
 * Returns a random integer between min and max
 */
Numbers.getRandomInt = function (min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

export default Numbers;

