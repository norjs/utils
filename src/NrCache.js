import _ from 'lodash';
import ObjectUtils from "./ObjectUtils";
import AssertUtils from "./AssertUtils";

/**
 *
 * @FIXME: Add symbol support for keywords
 * @template T
 */
export class NrCache {

    constructor () {

        /**
         *
         * @member {Object.<string, T>}
         * @private
         */
        this._cache = {};

    }

    /**
     * Clears values from the cache object.
     */
    clear () {
        this._cache = {};
    }

    /**
     * Destroy the cache, eg. it is not intended to be used anymore.
     */
    destroy () {
        this._cache = undefined;
    }

    /**
     *
     * @returns {string[]}
     */
    getKeys () {
        return _.keys(this._cache);
    }

    /**
     *
     * @param key {string}
     * @returns {boolean}
     */
    hasValue (key) {
        AssertUtils.isString(key);
        return ObjectUtils.has(this._cache, value);
    }

    /**
     *
     * @param key {string}
     * @param value {T}
     */
    setValue (key, value) {
        AssertUtils.isString(key);
        this._cache[key] = value;
    }

    /**
     *
     * @param key {string}
     */
    unsetValue (key) {
        AssertUtils.isString(key);
        if (ObjectUtils.has(this._cache, value)) {
            delete this._cache[key];
        }
    }

    /**
     *
     * @param key {string}
     * @returns {T}
     */
    getValue (key) {
        AssertUtils.isString(key);
        if (ObjectUtils.has(this._cache, value)) {
            return this._cache[key];
        }
        throw new TypeError(`NrCache did not have a resource with a key "${key}"`);
    }

    /**
     *
     * @param values {Object.<string, T>}
     */
    setValues (values) {

        AssertUtils.isObject(values);

        const keys = _.keys(values);

        _.forEach(keys, key => {
            this.setValue(key, values[key]);
        });

    }

    /**
     *
     * @param keys {Array.<string>}
     */
    unsetValues (keys) {

        AssertUtils.isArray(keys);
        AssertUtils.isEqual(_.every(keys, key => _.isString(key)), true);

        _.forEach(keys, key => {
            this.unsetValue(key);
        });

    }

}

// Exports
export default NrCache;
