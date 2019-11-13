import _ from 'lodash';
import LogicUtils from './LogicUtils.js';
import LogUtils from "./LogUtils";

const nrLog = LogUtils.getLogger("TypeUtils");

/**
 * @typedef {object} TestResult
 * @property {boolean} value - The test result value, `true` if test was successful.
 * @property {string} [description] - Human readable description why a test failed
 * @property {Array.<TestResult>} [failed] -- Recursive failed tests, if this result was a summary.
 */

/**
 * @typedef {object} TypeOptionsObject
 * @property {boolean} acceptUndefinedProperties - If `true`, will not fail for undefined (in the type definition) object properties.
 */

/**
 * Type of test functions.
 *
 * @callback testResultFunction
 * @param value {*}
 * @returns {TestResult|boolean}
 */

/**
 * This is either a test function or an object which contains test functions for each property.
 *
 * See `testResultFunction` and `PropertiesTestFunctionObject` for more.
 *
 * @typedef {testResultFunction|PropertiesTestFunctionObject} valueTestType
 */

/**
 * An object which contains test functions for each property by key name.
 *
 * See `PropertiesTestTypeObject` for un-compiled version.
 *
 * @typedef {Object.<string, valueTestType>} PropertiesTestFunctionObject
 */

/**
 * An object which contains uncompiled test types for each property by key name.
 *
 * See `PropertiesTestFunctionObject` for compiled version.
 *
 * @typedef {Object.<string, string>} PropertiesTestTypeObject
 */

/**
 *
 * @type {boolean}
 */
let DEFINE_DEFAULTS_JUST_IN_TIME = true;

/**
 *
 * @type {boolean}
 */
let DEFAULTS_DEFINED = false;

/**
 * Test functions for each type mapped by type name.
 *
 * @type {Object.<string, function>}
 */
const TESTS = {};

/**
 *
 * @type {Object.<string, TypeOptionsObject>}
 */
const OPTIONS = {};

/**
 * Runtime JSDoc style type checking.
 */
export class TypeUtils {

    /**
     * Tests if a value matches type criteria.
     *
     * @param value {*} Any variable to test
     * @param type {string} JSDoc style type string
     * @returns {boolean}
     */
    static test (value, type) {
        if (DEFINE_DEFAULTS_JUST_IN_TIME && !DEFAULTS_DEFINED) {
            this.defineDefaults();
        }

        const result = this._test(value, type, type);
        return this._getResultValue(result);
    }

    /**
     * Asserts an value to be type.
     *
     * @param value {*} Any variable to assert
     * @param type {string} JSDoc-style string
     * @throws {TypeError} if `value` doesn't match type criteria in `type`
     */
    static assert (value, type) {

        if (DEFINE_DEFAULTS_JUST_IN_TIME && !DEFAULTS_DEFINED) {
            this.defineDefaults();
        }

        const result = this._test(value, type, type);
        if (!this._getResultValue(result)) {
            const description = this._getResultDescription(result) || `Value "${this.stringify(value)}" is not "${type}"`;
            throw new TypeError(`Assertion failed: ${description}`);
        }
    }

    /**
     * Defines a new type, or overrides existing.
     *
     * @param name {string} Defines a type
     * @param type {PropertiesTestTypeObject|string|testResultFunction} Mapped test types for properties in an object, JSDoc style type string, or a test function.
     * @param options {TypeOptionsObject}
     */
    static defineType (name, type, options = {}) {

        if (DEFINE_DEFAULTS_JUST_IN_TIME && !DEFAULTS_DEFINED) {
            this.defineDefaults();
        }

        if (_.isString(type)) {
            this._setTypeOptions(name, options);
            this._defineTypeTest(name, this._compileTestFunction(type));
            return;
        }

        if (_.isFunction(type)) {
            this._setTypeOptions(name, options);
            this._defineTypeTest(name, type);
            return;
        }

        if (_.isPlainObject(type)) {
            this._setTypeOptions(name, options);
            let propertyTestFunctions = {};
            _.keys(type).forEach(key => {
                propertyTestFunctions[key] = this._compileTestFunction(type[key]);
            });
            this._defineTypeTest(name, propertyTestFunctions);
            return;
        }

        throw new TypeError(`Type definition for "${type}" is unknown`);
    }

    /**
     * Define default JSDoc and JavaScript types
     */
    static defineDefaults () {

        if (DEFAULTS_DEFINED) {
            return;
        }

        // Basic types
        this._defineTypeTest("string",    value => _.isString(value));
        this._defineTypeTest("number",    value => _.isNumber(value));
        this._defineTypeTest("boolean",   value => _.isBoolean(value));
        this._defineTypeTest("undefined", value => value === undefined);
        this._defineTypeTest("null",      value => _.isNull(value));
        this._defineTypeTest("symbol",    value => _.isSymbol(value));
        this._defineTypeTest("function",  value => _.isFunction(value));
        this._defineTypeTest("Date",      value => value instanceof Date);
        this._defineTypeTest("array",     value => _.isArray(value));
        this._defineTypeTest("object",    value => _.isObject(value));
        this._defineTypeTest("promise",   value => TypeUtils.isPromise(value));
        this._defineTypeTest("Error",   value => value instanceof Error);
        this._defineTypeTest("TypeError",   value => value instanceof TypeError);
        this._defineTypeTest("URIError",   value => value instanceof URIError);
        this._defineTypeTest("SyntaxError",   value => value instanceof SyntaxError);
        this._defineTypeTest("ReferenceError",   value => value instanceof ReferenceError);
        this._defineTypeTest("RangeError",   value => value instanceof RangeError);
        this._defineTypeTest("EvalError",   value => value instanceof EvalError);

        // Aliases
        this._defineAliasType("String", "string");
        this._defineAliasType("Number", "number");
        this._defineAliasType("Boolean", "boolean");
        this._defineAliasType("Symbol", "symbol");
        this._defineAliasType("Function", "function");
        this._defineAliasType("Object", "object");
        this._defineAliasType("Array", "array");
        this._defineAliasType("Promise", "promise");

        DEFAULTS_DEFINED = true;
    }

    /**
     * Define default JSDoc and JavaScript types
     * @param value {boolean}
     */
    static setDefineDefaultsJustInTime (value) {
        DEFINE_DEFAULTS_JUST_IN_TIME = !!value;
    }

    /**
     * Reset everything which `TypeUtils.defineDefaults()` did back to the initial state.
     *
     * This is useful for unit testing.
     */
    static resetInitialState () {
        if (!DEFAULTS_DEFINED) return;
        _.each(_.keys(TESTS), type => {
            delete TESTS[type];
        });
        DEFAULTS_DEFINED = false;
    }

    /**
     *
     * @param value {*}
     * @return {boolean}
     */
    static isPromise (value) {
        return value ? _.isFunction(value.then) : false;
    }

    /**
     * Compiles a test function for type definition.
     *
     * @param type {string} JSDoc style type string
     * @returns {valueTestType}
     * @private
     */
    static _compileTestFunction (type) {

        type = _.trim(type);

        // OR `|` lists
        if (type.indexOf('|') >= 0) {
            const tests = type.split('|').map(i => this._compileTestFunction(i));
            return value => this._testOr(value, tests, type);
        }

        // Intersection `&` lists
        if (type.indexOf('&') >= 0) {
            const tests = type.split('&').map(i => this._compileTestFunction(i));
            return value => this._testIntersection(value, tests, type);
        }

        // `*`
        if (type === '*') {
            return () => true;
        }

        // `array<...>`, `Array<...>`, `array.<...>`, and `Array.<...>`
        if (_.startsWith(type, "array") || _.startsWith(type, "Array")) {
            let rest = _.trim(type.substr("array".length));
            if (rest && rest[0] === '.') {
                rest = _.trim(rest.substr(1));
            }
            if ( _.startsWith(rest, "<") && _.endsWith(rest, '>') ) {
                rest = _.trim(rest.substr(1, rest.length - 2));
                const itemTestFunction = this._compileTestFunction(rest);
                // nrLog.trace(`Parsed "${rest}" as `, itemTestFunction);
                return value => _.isArray(value) && this._everyArrayItemResult(value, itemTestFunction, rest, type);
            }
        }

        // *[]
        if (_.endsWith(type, '[]')) {
            let rest = _.trim(type.substr(0, type.length - 2));
            const itemTestFunction = this._compileTestFunction(rest);
            // nrLog.trace(`Parsed "${rest}" as `, itemTestFunction);
            return value => _.isArray(value) && this._everyArrayItemResult(value, itemTestFunction, rest, type);
        }

        // `object<..., ...>`, `Object<..., ...>`, `object.<..., ...>`, and `Object.<..., ...>`
        if (_.startsWith(type, "object") || _.startsWith(type, "Object")) {
            let rest = _.trim(type.substr("object".length));
            if (rest && rest[0] === '.') {
                rest = _.trim(rest.substr(1));
            }
            if ( _.startsWith(rest, "<") && _.endsWith(rest, '>') ) {
                rest = _.trim(rest.substr(1, rest.length - 2));

                const index = rest.indexOf(',');
                if (index >= 0) {
                    const keyType = _.trim(rest.substr(0, index));
                    const valueType = _.trim(rest.substr(index+1));

                    const keyTestFunction = this._compileTestFunction(keyType);
                    const valueTestFunction = this._compileTestFunction(valueType);

                    // nrLog.trace(`Parsed "${keyType}" as `, keyTestFunction);
                    // nrLog.trace(`Parsed "${valueType}" as `, valueTestFunction);
                    return value => _.isObject(value) && this._everyObjectItemResult(
                        value,
                        keyTestFunction,
                        valueTestFunction,
                        keyType,
                        valueType,
                        type
                    );
                }
            }
        }

        // `{}`
        if (type === '{}') {
            return TESTS['object'];
        }

        // `{key:type[, key2:type2]}`
        if (_.startsWith(type, "{") && _.endsWith(type, "}")) {
            let rest = _.trim(type.substr(1, type.length - 2));
            let parts = _.split(rest, ",").map(i => _.trim(i));

            let propertyTestFunctions = {};

            _.forEach(parts, part => {
                const i = part.indexOf(':');
                let key, value;
                if (i >= 0) {
                    key = _.trim(part.substr(0, i));
                    value = _.trim(part.substr(i+1));
                } else {
                    key = part;
                    value = '*';
                }
                propertyTestFunctions[key] = this._compileTestFunction(value);
            });

            return propertyTestFunctions;
        }

        // `promise<...>`, `Promise<...>`, `promise.<...>`, and `Promise.<...>`
        if (_.startsWith(type, "promise") || _.startsWith(type, "Promise")) {
            let rest = _.trim(type.substr("promise".length));
            if (rest && rest[0] === '.') {
                rest = _.trim(rest.substr(1));
            }
            if ( _.startsWith(rest, "<") && _.endsWith(rest, '>') ) {
                rest = _.trim(rest.substr(1, rest.length - 2));
                // FIXME: Should we assert something that's asynchronous? See https://github.com/norjs/utils/issues/4
                nrLog.warn(`Tried to assert a promise with asynchronous result type "${rest}", which is ignored.`);
                return this._compileTestFunction("Promise");
            }
        }

        // any other registered type
        if (_.has(TESTS, type)) {
            return TESTS[type];
        }

        // Handle unknown format
        throw new TypeError(`Type definition for "${type}" was unknown.`);
    }

    /**
     * Tests if a value matches type criteria.
     *
     * @param value {*} Any variable to test
     * @param type {string} JSDoc style type string for the partial type which is going to be tested here
     * @param origType {string} JSDoc style type string for the original full type
     * @returns {TestResult}
     * @private
     */
    static _test (value, type, origType) {
        return this._callTestFunction(this._compileTestFunction(type), value, type, type);
    }

    /**
     * Defines simple type testing function.
     *
     * @param name {string} Defines a type
     * @param test {testResultFunction|PropertiesTestFunctionObject} Testing function which returns boolean result, or testing functions for an object properties.
     * @private
     */
    static _defineTypeTest (name, test) {
        TESTS[name] = test;
    }

    /**
     * Sets type options for a type.
     *
     * @param name {string} The type name
     * @param options {TypeOptionsObject}
     * @private
     */
    static _setTypeOptions (name, options) {
        OPTIONS[name] = options;
    }

    /**
     * @param test {valueTestType}
     * @param value {*}
     * @param type {string}
     * @param origType {string}
     * @return {TestResult}
     */
    static _callTestFunction (test, value, type, origType) {

        if (_.isPlainObject(test)) {
            const propertyTestFunctions = test;
            test = value => _.isObject(value) && this._testEveryObjectPropertyResult(value, propertyTestFunctions, type);
        }

        const result = LogicUtils.tryCatch( () => test(value), err => {
            nrLog.error('Error: ', err);
            return {
                value: false,
                description: 'Test function failed with: ' + err
            };
        });

        if (result === false) return {value: false};
        if (result === true) return {value: true};
        return result;
    }

    /**
     * Defines alias for a type.
     *
     * @param name {string} Defines a type
     * @param type {string} JSDoc style type string
     * @private
     */
    static _defineAliasType (name, type) {
        if (!_.has(TESTS, type)) {
            throw new TypeError(`Could not find a type "${type}" to define alias "${name}"`);
        }
        TESTS[name] = value => TESTS[type](value);
    }

    /**
     *
     * @param result {TestResult|boolean}
     * @returns {boolean}
     * @private
     */
    static _getResultValue (result) {
        if (result === true) return true;
        if (result === false) return false;
        return !!(result && result.value);
    }

    /**
     *
     * @param result {TestResult}
     * @returns {string}
     * @private
     */
    static _getResultDescription (result) {
        return result && result.description ? result.description : undefined;
    }

    /**
     *
     * @param list {Array.<*>} Array of values
     * @param test {valueTestType} Item test function
     * @param type {string|PropertiesTestFunctionObject} The item type string
     * @param origType {string} The full type string
     * @returns {TestResult}
     * @private
     */
    static _everyArrayItemResult (list, test, type, origType) {
        const results = [];

        _.forEach(list, item => {
            const result = this._callTestFunction(test, item, type, origType);
            const resultValue = this._getResultValue(result);
            if (!resultValue) results.push(result);
        });

        const resultValue = !results.length;

        if (resultValue) return {value:true};

        const failedDescription = _.filter(results, f => !f.value && f.description).map(f => f.description).join(', ');

        return {
            value: resultValue,
            description: `One in "${list}" failed to test as "${type}" in "${origType}": ${failedDescription}`
        };
    }

    /**
     *
     * @param obj {Object} Object
     * @param keyTest {valueTestType} Key test function
     * @param valueTest {valueTestType} Value test function
     * @param keyType {string} The item type string
     * @param valueType {string} The value type string
     * @param origType {string} The full type string
     * @returns {TestResult}
     * @private
     */
    static _everyObjectItemResult (obj, keyTest, valueTest, keyType, valueType, origType) {
        const results = [];

        _.forEach(_.keys(obj), key => {
            const keyResult = this._callTestFunction(keyTest, key, keyType, origType);
            const keyResultValue = this._getResultValue(keyResult);
            if (!keyResultValue) results.push(keyResult);

            const value = obj[key];
            const valueResult = this._callTestFunction(valueTest, value, valueType, origType);
            const valueResultValue = this._getResultValue(valueResult);
            if (!valueResultValue) results.push(valueResult);

        });

        const resultValue = !results.length;

        if (resultValue) return {value:true};

        const failedDescription = _.filter(results, f => !f.value && f.description).map(f => f.description).join(', ');

        return {
            value: false,
            description: `Object "${this.stringify(obj)}" failed to test as "${origType}": ${failedDescription}`,
            failed: results
        };
    }

    /**
     *
     * @param obj {Object} Object
     * @param propertyTestFunctions {PropertiesTestFunctionObject} Property test functions
     * @param origType {string} The full type string
     * @returns {TestResult}
     * @private
     */
    static _testEveryObjectPropertyResult (obj, propertyTestFunctions, origType) {
        const failed = [];

        /**
         * @type {TypeOptionsObject}
         */
        const options = _.has(OPTIONS, origType) ? OPTIONS[origType] : {};

        _.forEach(_.keys(obj), key => {

            if (!_.has(propertyTestFunctions, key)) {
                // nrLog.trace(`Key "${key}" did not have a test function.`);

                if (options.acceptUndefinedProperties) {
                    return;
                }

                failed.push({
                    value: false,
                    description: `Property "${key}" in "${this.stringify(obj)}" was not defined in "${origType}"`,
                });
                return;
            }

            const valueTest = propertyTestFunctions[key];

            const value = obj[key];
            const valueResult = this._callTestFunction(valueTest, value, origType, origType);
            const valueResultValue = this._getResultValue(valueResult);

            // nrLog.trace(`Key "${key}" resulted in "${valueResultValue}" as `, valueResult);

            if (!valueResultValue) {
                failed.push({
                    value: false,
                    description: `Property "${key}" in "${this.stringify(obj)}" failed test in "${origType}"`,
                    failed: [valueResult]
                });
            }

        });

        const resultValue = failed.length < 1;

        if (resultValue) return {value:true};

        // nrLog.trace(`failed = `, failed, ` as "${resultValue}"`);

        const failedDescription = _.filter(failed, f => !f.value && f.description).map(f => f.description).join(', ');

        return {
            value: false,
            description: `Object "${this.stringify(obj)}" failed to test as "${origType}": ${failedDescription}`,
            failed
        };
    }

    /**
     *
     * @param value {*}
     * @param tests {Array.<valueTestType>}
     * @param type {string}
     * @private
     */
    static _testOr (value, tests, type) {
        const failed = [];
        if (_.some(_.map(tests, test => this._callTestFunction(test, value, type, type)), result => {
            if (this._getResultValue(result)) {
                return true;
            } else {
                failed.push(result);
                return false;
            }
        })) {
            return {value:true};
        } else {
            return {
                value: false,
                description: `Value "${this.stringify(value)}" did not match "${type}"`,
                failed
            }
        }
    }

    /**
     *
     * @param value {*}
     * @param tests {Array.<valueTestType>}
     * @param type {string}
     * @private
     */
    static _testIntersection (value, tests, type) {

        /**
         *
         * @type {Object.<string, Function>}
         */
        let propertyTestFunctions = {};

        const objTests = _.filter(tests, test => _.isPlainObject(test));
        if (objTests.length) {
            propertyTestFunctions = _.reduce(objTests, (obj, test) => {
                _.keys(test).forEach(key => {
                    obj[key] = test[key];
                });
                return obj;
            }, propertyTestFunctions);
        }

        const objTestFunc = value => _.isObject(value) && this._testEveryObjectPropertyResult(value, propertyTestFunctions, type);

        const finalTests = _.concat([objTestFunc], _.filter(tests, test => !_.isPlainObject(test)));

        const failed = [];
        if (_.every(_.map(finalTests, test => this._callTestFunction(test, value, type, type)), result => {
            if (this._getResultValue(result)) {
                return true;
            } else {
                failed.push(result);
                return false;
            }
        })) {
            return {value:true};
        } else {
            return {
                value: false,
                description: `Value "${this.stringify(value)}" did not match "${type}"`,
                failed
            }
        }

    }

    /**
     * Turns anything to shortened human readable string presentation.
     *
     * @param value {*}
     * @return {string}
     */
    static stringify (value) {

        const limit = 80;

        if (value === undefined) return "undefined";

        if (_.isNull(value)) return "null";

        if (_.isFunction(value)) return "function";

        if (_.isObject(value)) {

            if (value instanceof Error) {
                return this._shortifyText(`${value}`, limit);
            }

            let result;

            if (value && !_.isPlainObject(value) && _.isFunction(value.toString) ) {
                return this._shortifyText(`${value.toString()}`, limit);
            }

            /**
             * Cache for circular references.
             *
             * @type {Array.<Object>}
             */
            let cache = [];

            try {
                result = this._shortifyText(JSON.stringify(
                    value,
                    (key, value) => {
                        if (_.isObject(value) && !_.isNull(value)) {

                            if (cache.indexOf(value) !== -1) {
                                // Duplicate reference found
                                try {
                                    // If this value does not reference a parent it can be deduped
                                    return JSON.parse(JSON.stringify(value));
                                } catch (error) {
                                    // discard key if value cannot be deduped
                                    return '__CIRCULAR_REFERENCE__';
                                }
                            }

                            // Store value in our collection
                            cache.push(value);
                        }
                        return value;
                    }
                ), limit);
            } finally {
                cache = undefined;
            }
            return result;
        }

        return this._shortifyText(`${value}`, limit);
    }

    /**
     * Use `TypeUtils.stringify(value)` instead because `toString()` has conflicting
     * interface in ES6.
     *
     * @param value {*}
     * @return {string}
     * @deprecated
     */
    static toString (value) {
        return this.stringify(value);
    }

    /**
     *
     * @param value {string}
     * @param limit {number}
     * @private
     */
    static _shortifyText (value, limit) {
        if (limit >= 5+3 && value.length >= limit) {
            return `${value.substr(0, limit - (5+3))} ... ${value.substr(value.length - 3)}`;
        }
        return value;
    }

    /**
     * Get property names from Class prototype.
     *
     * @param Class {function}
     * @return {string[]}
     */
    static getClassPropertyNames (Class) {
        return Object.getOwnPropertyNames(Class.prototype);
    }

    /**
     * Converts a class into object method property mapping.
     *
     * Useful for mapping non-real interface classes.
     *
     * @param Class {function} The class
     * @return {Object.<string, string>} Mapping of each property in prototype to specific type.
     */
    static classToObjectPropertyTypes (Class) {
        return this.getClassPropertyNames(Class).reduce( (obj, key) => {
            const value = Class.prototype[key];
            if (_.isFunction(value)) {
                obj[key] = 'function';
            }
            else if (_.isArray(value)) {
                obj[key] = 'array';
            }
            else if (_.isObject(value)) {
                obj[key] = 'object';
            }
            else if (_.isString(value)) {
                obj[key] = 'string';
            }
            else if (_.isNumber(value)) {
                obj[key] = 'number';
            }
            else if (_.isBoolean(value)) {
                obj[key] = 'boolean';
            }
            return obj;
        }, {});
    }

    /**
     * Will create a test function for a class instance.
     *
     * @param Class {Function} The class to test for
     * @returns {function(*): boolean}
     */
    static classToTestType (Class) {
        return value => value instanceof Class;
    }

}

/**
 *
 * @type {typeof TypeUtils}
 */
export default TypeUtils;
