import _ from 'lodash';
import LogUtils from "./LogUtils";
import StringUtils from "./StringUtils";

/**
 *
 */
export class AssertUtils {

    /**
     *
     * @returns {string}
     */
    static get nrName () {
        return "AssertUtils";
    }

    /**
     * Throw an exception if condition fails
     *
     * @param value {string}
     */
    static isString (value) {

        if ( !_.isString(value) ) {
            throw new TypeError(`${this.nrName}.isString(value): value is not a string: ${LogUtils.getAsString(value)}`);
        }

    }

    /**
     * Throw an exception if condition fails
     *
     * @param value {undefined}
     */
    static isUndefined (value) {

        if ( value !== undefined ) {
            throw new TypeError(`${this.nrName}.isUndefined(value): value is not undefined: ${LogUtils.getAsString(value)}`);
        }

    }

    /**
     * Throw an exception if condition fails
     *
     * @param value {*}
     */
    static isDefined (value) {

        if ( value === undefined ) {
            throw new TypeError(`${this.nrName}.isDefined(value): value was not defined: ${LogUtils.getAsString(value)}`);
        }

    }

    /**
     * Throw an exception if condition fails
     *
     * @param value {number}
     */
    static isNumber (value) {

        if ( !_.isNumber(value) ) {
            throw new TypeError(`${this.nrName}.isNumber(value): value is not a number: ${LogUtils.getAsString(value)}`);
        }

    }

    /**
     * Throw an exception if condition fails
     *
     * @param value {boolean}
     */
    static isBoolean (value) {

        if ( !_.isBoolean(value) ) {
            throw new TypeError(`${this.nrName}.isBoolean(value): value is not a boolean: ${LogUtils.getAsString(value)}`);
        }

    }

    /**
     * Throw an exception if condition fails
     *
     * @param value {function|Function}
     */
    static isFunction (value) {

        if ( !_.isFunction(value) ) {
            throw new TypeError(`${this.nrName}.isFunction(value): value is not a function: ${LogUtils.getAsString(value)}`);
        }

    }

    /**
     * Throw an exception if not an object.
     *
     * *Note!* Arrays are not considered as an object here.
     *
     * @param value {object}
     */
    static isObjectOrArray (value) {

        if ( !_.isObject(value) ) {
            throw new TypeError(`${this.nrName}.isObjectOrArray(value): value is not a object or array: ${LogUtils.getAsString(value)}`);
        }

    }

    /**
     * Throw an exception if not an object.
     *
     * *Note!* Arrays are not considered as an object here. See `AssertUtils.isObjectOrArray()`
     *
     * @param value {object}
     */
    static isObject (value) {

        if ( ! (_.isObject(value) && !_.isArray(value) ) ) {
            throw new TypeError(`${this.nrName}.isObject(value): value is not a object: ${LogUtils.getAsString(value)}`);
        }

    }

    /**
     * Throw an exception if condition fails
     *
     * @param value {object}
     */
    static isArray (value) {

        if ( !_.isArray(value) ) {
            throw new TypeError(`${this.nrName}.isArray(value): value is not an array: ${LogUtils.getAsString(value)}`);
        }

    }

    /**
     * Throw an exception if condition fails
     *
     * @param value {object}
     * @param maxLength {number}
     */
    static isArrayWithMaxLength (value, maxLength) {

        if ( ! ( _.isArray(value) && value.length <= maxLength ) ) {
            throw new TypeError(`${this.nrName}.isArrayWithMaxLength(value): value is not an array with max ${maxLength} items: ${LogUtils.getAsString(value)}`);
        }

    }

    /**
     * Throw an exception if condition fails
     *
     * @param value {object}
     * @param maxLength {number}
     */
    static isArrayWithMinLength (value, minLength) {

        if ( ! ( _.isArray(value) && value.length > minLength ) ) {
            throw new TypeError(`${this.nrName}.isArrayWithMaxLength(value): value is not an array with minimum ${minLength} items: ${LogUtils.getAsString(value)}`);
        }

    }

    /**
     * Throw an exception if condition fails
     *
     * @param value {object}
     * @param maxLength {number}
     */
    static isStringWithMaxLength (value, maxLength) {

        if ( ! ( _.isString(value) && value.length <= maxLength ) ) {
            throw new TypeError(`${this.nrName}.isStringWithMaxLength(value): value is not an array with max ${maxLength} items: ${LogUtils.getAsString(value)}`);
        }

    }

    /**
     * Throw an exception if condition fails
     *
     * @param value {object}
     * @param maxLength {number}
     */
    static isStringWithMinLength (value, minLength) {

        if ( ! ( _.isString(value) && value.length > minLength ) ) {
            throw new TypeError(`${this.nrName}.isStringWithMaxLength(value): value is not an array with minimum ${minLength} items: ${LogUtils.getAsString(value)}`);
        }

    }

    /**
     * Throw an exception if not a string or pattern does not match
     *
     * @param value {string}
     * @param pattern {RegExp}
     */
    static isStringPattern (value, pattern) {

        if ( !( _.isString(value) && _.isRegExp(pattern) && pattern.test(value) ) ) {
            throw new TypeError(`${this.nrName}.isStringPattern(value, pattern): value didn't match the pattern: ${LogUtils.getAsString(value)}`);
        }

    }

    /**
     * Throw an exception if condition fails
     *
     * @param value {Function|Function}
     */
    static isCallable (value) {

        if (!_.isFunction(value)) {
            throw new TypeError(`${this.nrName}.isCallable(value): value is not callable: ${LogUtils.getAsString(value)}`);
        }

    }

    /**
     * Throw an exception if condition fails
     *
     * @param value {*}
     */
    static isEqual (value, testValue) {

        if ( value !== testValue ) {
            throw new TypeError(`${this.nrName}.isEqual(value): value did not equal: ${LogUtils.getAsString(value)} !== ${LogUtils.getAsString(testValue)}`);
        }

    }

    /**
     *
     * @param value
     */
    static isDate (value) {

        if ( !(value && value instanceof Date) ) {
            throw new TypeError(`${this.nrName}.isDate(value): value was not Date: ${LogUtils.getAsString(value)}`);
        }

    }

    /**
     * Asserts that the value is a date string, eg. `"2019-11-21T23:41:42Z"`.
     *
     * @param value {string}
     */
    static isDateString (value) {

        if ( !StringUtils.isDateString(value) ) {
            throw new TypeError(`${this.nrName}.isDateString(value): value was not a date string: ${LogUtils.getAsString(value)}`);
        }

    }

    /**
     *
     * @param value
     */
    static isUuidString (value) {

        if (!( _.isString(value) && /^[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$/.test(value) )) {
            throw new TypeError(`${this.nrName}.isUuidString(value): value was not UUID: ${LogUtils.getAsString(value)}`);
        }

    }

    /**
     *
     * @param value
     * @param Type
     */
    static isInstanceOf (value, Type) {

        if (!( _.isObject(value) && value instanceof Type )) {
            throw new TypeError(`${this.nrName}.isInstanceOf(value): value was not instance of ${Type}: ${LogUtils.getAsString(value)}`);
        }

    }

    /**
     * Disables instance creation
     *
     * @private
     */
    constructor () {}

}

// Exports
export default AssertUtils;
