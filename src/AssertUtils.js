import _ from 'lodash';
import LogUtils from "./LogUtils";

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
     * Disables instance creation
     *
     * @private
     */
    constructor () {}

}

// Exports
export default AssertUtils;
