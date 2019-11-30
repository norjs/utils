import _ from 'lodash';
import AssertUtils from "./AssertUtils";

/**
 *
 */
export class StringUtils {

    static get nrName () {
        return "StringUtils";
    }

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

    /**
     * Replaces placeholders in a format string like `"%0, %1, %2"` to match values in an array.
     *
     * @param format {string} The format string with placeholders
     * @param params {Array.<*>} The values in an array
     * @param strict {boolean} If enabled, will throw an exception if variable wasn't found
     * @returns {string} Replaced values
     * @private
     */
    static _formatString (format, params, strict = false) {

        AssertUtils.isString(format);
        AssertUtils.isArray(params);

        return format.replace(
            /%([0-9]+)/g,
            (match, key) => {

                const index = this.parseInteger(key);

                if ( _.isNumber(index) && index < params.length ) {
                    return params[index];
                }

                if ( strict ) {
                    throw new TypeError(`${ this.nrName }.formatString(): Param ${ match } was not found`);
                }

                return match;

            }
        );

    }

    /**
     * Replaces placeholders in a format string like `"%0, %1, %2"` to match values in an array.
     *
     * If the value cannot be found, the placeholder is left untouched.
     *
     * @param format {string} The format string with placeholders
     * @param params {Array.<*>} The values in an array
     * @returns {string} Replaced values
     */
    static formatStringWithArray (format, params) {
        return this._formatString(format, params, false);
    }

    /**
     * Replaces placeholders in a format string like `"%0, %1, %2"` to match values in an array.
     *
     * If the value cannot be found, an exception is thrown.
     *
     * @param format {string} The format string with placeholders
     * @param params {Array.<*>} The values in an array
     * @returns {string} Replaced values
     */
    static strictFormatStringWithArray (format, params) {
        return this._formatString(format, params, true);
    }

    /**
     * Replaces placeholders in a format string like `"%0, %1, %2"` to match values in an array.
     *
     * If the value cannot be found, the placeholder is left untouched.
     *
     * @param format {string} The format string with placeholders
     * @param params {*} The values in an array
     * @returns {string} Replaced values
     */
    static formatString (format, ...params) {
        return this._formatString(format, params, false);
    }

    /**
     * Replaces placeholders in a format string like `"%0, %1, %2"` to match values in an array.
     *
     * If the value cannot be found, an exception is thrown.
     *
     * @param format {string} The format string with placeholders
     * @param params {*} The values in an array
     * @returns {string} Replaced values
     */
    static strictFormatString (format, ...params) {
        return this._formatString(format, params, true);
    }

}

// Exports
export default StringUtils;
