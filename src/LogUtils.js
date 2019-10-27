import _ from 'lodash';
import {Logger} from "./Logger";

/**
 *
 */
export class LogUtils {

    /**
     *
     * @returns {typeof Logger}
     */
    static get Logger () {
        return Logger;
    }

    /**
     *
     * @returns {string}
     */
    static getTime () {
        return (new Date()).toISOString();
    }

    /**
     *
     * @param value {*}
     * @returns {string}
     */
    static getAsString (value) {

        if (value === undefined) {
            return "undefined";
        }

        if (_.isString(value)) {
            return value;
        }

        if (_.isNull(value)) {
            return "null";
        }

        if (_.isFunction(value)) {
            return "Function";
        }

        return JSON.stringify(value);

    }

    /**
     *
     * @param args {Array.<*>}
     * @return {string}
     */
    static getArrayAsString (args) {
        return _.map(args, arg => _.trim(LogUtils.getAsString(arg))).join(' ');
    }

    /**
     *
     * @param value {*}
     * @returns {string}
     */
    static getLine (...value) {
        return `[${LogUtils.getTime()}] ${LogUtils.getArrayAsString(value)}`;
    }

    /**
     *
     * @param name {string}
     * @returns {Logger}
     */
    static getLogger (name) {
        return new Logger(name);
    }

}

// Exports
export default LogUtils;
