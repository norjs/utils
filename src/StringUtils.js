import _ from 'lodash';
import LogUtils from "./LogUtils";

/**
 *
 */
export class StringUtils {

    /**
     * Parse a string argument to boolean
     *
     * @param value {string}
     * @returns {boolean|undefined}
     */
    static strictParseBoolean (value) {

        if (!_.isString(value)) {
            throw new TypeError(`Not a string: ${value}`);
        }

        switch (_.toLower(value)) {
            case "true": return true;
            case "false": return false;
            default:
                throw new TypeError(`Not a boolean: "${value}"`);
        }

    }

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
     * Parse a string argument to an integer.
     *
     * @param value {string}
     * @returns {number}
     */
    static strictParseInteger (value) {

        if (!_.isString(value)) {
            throw new TypeError(`Not a string: ${value}`);
        }

        if ( !StringUtils.isInteger(value) ) {
            throw new TypeError(`Not an integer: "${value}"`);
        }

        return parseInt(value, 10);

    }

    /**
     * Returns `true` if value is an integer.
     *
     * @param value {string}
     * @returns {boolean}
     */
    static isInteger (value) {

        return _.isString(value) && /^([0-9]|[1-9][0-9]+)$/.test(value);

    }

    /**
     * Parse a string argument to an integer.
     *
     * Only real strings are parsed, otherwise returns `defaultValue`.
     *
     * @param value {*}
     * @param defaultValue { T= }
     * @returns { number | T }
     * @template T
     */
    static parseInteger (value, defaultValue = undefined) {

        try {
            return StringUtils.strictParseInteger(value);
        } catch (err) {
            return defaultValue;
        }

    }

    /**
     * Tests that the value is a date string, eg. `"2019-11-21T23:41:42Z"`.
     *
     * @param value {string}
     * @returns {boolean}
     */
    static isDateString (value) {

        return _.isString(value) && /^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}(\.[0-9]+)?Z$/.test(value);

    }

}

// Exports
export default StringUtils;
