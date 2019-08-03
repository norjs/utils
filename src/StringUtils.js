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

}

// Exports
module.exports = StringUtils;
