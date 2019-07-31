
/**
 *
 * @type {typeof TypeUtils}
 */
const TypeUtils = require("@norjs/utils/Type");

/**
 *
 * @type {typeof LogicUtils}
 */
const LogicUtils = require('@norjs/utils/Logic');

/**
 *
 */
class PromiseUtils {

    /**
     *
     * @param value {Promise|*}
     * @returns {Promise}
     * @private
     */
    static when (value) {

        if (value && value.then) {
            return value;
        }

        return new Promise(resolve => resolve(value));
    }

}

// Exports
module.exports = PromiseUtils;
