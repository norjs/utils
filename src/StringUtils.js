const _ = require('lodash');

/**
 *
 */
class StringUtils {

    /**
     * Parse a string argument to boolean
     *
     * @param value {string}
     * @param defaultValue {boolean|undefined}
     * @returns {boolean|undefined}
     */
    static parseBoolean (value, defaultValue = undefined) {
        switch (_.toLower(value)) {
            case "true": return true;
            case "false": return false;
            default: return defaultValue;
        }
    }

    /**
     * Parse a string argument to an integer
     *
     * @param value {string|undefined}
     * @returns {number|undefined}
     */
    static parseInteger (value) {
        if (value === undefined) return undefined;
        return parseInt(value, 10);
    }

}

// Exports
module.exports = StringUtils;
