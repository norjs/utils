import _ from 'lodash';
import {Logger} from "./Logger";
import JsonUtils from "./JsonUtils";

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
     * @param multiLine {boolean}
     * @returns {string}
     */
    static getAsString (value, {
        multiLine = false
    } = {}) {

        if (value instanceof Error) {

            if (value.stack) {
                return `${value.stack}`;
            }

            return `${value}`;

        }

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

        // @TODO: This is a quick workaround for circular structure error.
        //        See issue: https://github.com/norjs/utils/issues/5
        if ( value && _.has(value, '$modelValue') || _.has(value, '$viewValue') ) {

            return LogUtils.getAsString({
                $modelValue: value.$modelValue,
                $viewValue: value.$viewValue
            }, {
                multiLine
            });

        }

        try {

            if (multiLine) {
                return JsonUtils.stringify(value, {space: 2});
            } else {
                return JsonUtils.stringify(value);
            }

        } catch (err) {

            console.error(`Exception: `, err);
            // console.debug(`Value was: `, value);

            return this.getAsString(err, {
                multiLine
            });

        }

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
