const _ = require('lodash');

/**
 *
 * @type {typeof LogicUtils}
 */
const LogicUtils = require('./LogicUtils.js');

/**
 * @typedef {object} TestResult
 * @property {boolean} value - The test result value, `true` if test was successful.
 * @property {string} [description] - Human readable description why a test failed
 * @property {Array.<TestResult>} [failed] -- Recursive failed tests, if this result was a summary.
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
 * Runtime JSDoc style type checking.
 */
class TypeUtils {

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
            const description = this._getResultDescription(result) || `Value "${this.toString(value)}" is not "${type}"`;
            throw new TypeError(`Assertion failed: ${description}`);
        }
    }

    /**
     * Defines a new type, or overrides existing.
     *
     * @param name {string} Defines a type
     * @param type {PropertiesTestTypeObject|string|testResultFunction} Mapped test types for properties in an object, JSDoc style type string, or a test function.
     */
    static defineType (name, type) {

        if (DEFINE_DEFAULTS_JUST_IN_TIME && !DEFAULTS_DEFINED) {
            this.defineDefaults();
        }

        if (_.isString(type)) {
            this._defineTypeTest(name, this._compileTestFunction(type));
            return;
        }

        if (_.isFunction(type)) {
            this._defineTypeTest(name, type);
            return;
        }

        if (_.isPlainObject(type)) {
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
                // console.debug(`Parsed "${rest}" as `, itemTestFunction);
                return value => _.isArray(value) && this._everyArrayItemResult(value, itemTestFunction, rest, type);
            }
        }

        // *[]
        if (_.endsWith(type, '[]')) {
            let rest = _.trim(type.substr(0, type.length - 2));
            const itemTestFunction = this._compileTestFunction(rest);
            // console.debug(`Parsed "${rest}" as `, itemTestFunction);
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

                    // console.debug(`Parsed "${keyType}" as `, keyTestFunction);
                    // console.debug(`Parsed "${valueType}" as `, valueTestFunction);
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
            return {};
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
                // FIXME: Should we assert something that's asynchronous?
                console.warn(`Tried to assert a promise with asynchronous result type "${rest}", which is ignored.`);
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
            console.error('Error: ', err);
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

        return {
            value: resultValue,
            description: `One in "${list}" failed to test as "${type}" in "${origType}"`
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

        return {
            value: false,
            description: `Object "${this.toString(obj)}" failed to test as "${origType}"`,
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

        _.forEach(_.keys(obj), key => {

            if (!_.has(propertyTestFunctions, key)) {
                // console.debug(`Key "${key}" did not have a test function.`);
                failed.push({
                    value: false,
                    description: `Property "${key}" in "${this.toString(obj)}" was not defined in "${origType}"`,
                });
                return;
            }

            const valueTest = propertyTestFunctions[key];

            const value = obj[key];
            const valueResult = this._callTestFunction(valueTest, value, origType, origType);
            const valueResultValue = this._getResultValue(valueResult);

            // console.debug(`Key "${key}" resulted in "${valueResultValue}" as `, valueResult);

            if (!valueResultValue) {
                failed.push({
                    value: false,
                    description: `Property "${key}" in "${this.toString(obj)}" failed test in "${origType}"`,
                    failed: [valueResult]
                });
            }

        });

        const resultValue = failed.length < 1;

        if (resultValue) return {value:true};

        // console.debug(`failed = `, failed, ` as "${resultValue}"`);

        return {
            value: false,
            description: `Object "${this.toString(obj)}" failed to test as "${origType}"`,
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
                description: `Value "${this.toString(value)}" did not match "${type}"`,
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
                description: `Value "${this.toString(value)}" did not match "${type}"`,
                failed
            }
        }

    }

    /**
     *
     * @param value {*}
     * @return {string}
     * @private
     */
    static toString (value) {
        if (value === undefined) return "undefined";
        if (_.isNull(value)) return "null";
        if (_.isObject(value)) return JSON.stringify(value);
        return `${value}`;
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
        return _.keys(Class.prototype).reduce( (obj, key) => {
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
module.exports = TypeUtils;