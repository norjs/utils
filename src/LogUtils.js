import _ from 'lodash';
import {Logger} from "./Logger";
import JsonUtils from "./JsonUtils";
import PromiseUtils from "./PromiseUtils";

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

            if ( value.nrName ) {
                return `Function ${value.nrName}`;
            }

            return "Function";
        }

        if ( PromiseUtils.isPromise(value) ) {
            return `Promise`;
        }

        // @TODO: This is a quick workaround for circular structure error.
        //        See issue: https://github.com/norjs/utils/issues/5
        if ( value && _.has(value, '$modelValue') || _.has(value, '$viewValue') ) {

            const modelValue = `$modelValue: ${LogUtils.getAsString(value.$modelValue, {multiLine})}`;
            const viewValue = `, $viewValue: ${LogUtils.getAsString(value.$viewValue, {multiLine})}`;
            const parsers = value && value.$parsers && value.$parsers.length ? `, ${value.$parsers.length} parsers` : "";
            const formatters = value && value.$formatters && value.$formatters.length ? `, ${value.$formatters.length} formatters` : "";
            const validators = value && value.$validators && Object.keys(value.$validators).length ? `, ${Object.keys(value.$validators).length} validators` : "";
            const asyncValidators = value && value.$asyncValidators && Object.keys(value.$asyncValidators).length ? `, ${Object.keys(value.$asyncValidators).length} asyncValidators` : "";
            const viewChangeListeners = value && value.$viewChangeListeners && value.$viewChangeListeners.length ? `, ${value.$viewChangeListeners.length} viewChangeListeners` : "";
            const errors = value && value.$error && Object.keys(value.$error).length ? `, ${Object.keys(value.$error).length} errors` : "";
            const pending = value && value.$pending && Object.keys(value.$pending).length ? `, ${Object.keys(value.$pending).length} pending` : "";

            const untouched = value.$untouched ? 'untouched' : '';
            const touched = value.$touched ? 'touched' : '';
            const pristine = value.$pristine ? '|pristine' : '';
            const dirty = value.$dirty ? '|dirty' : '';
            const valid = value.$valid ? '|valid' : '';
            const invalid = value.$invalid ? '|invalid' : '';

            const flags = `, ${untouched}${touched}${pristine}${dirty}${valid}${invalid}`;

            const name = value.$name ? `"${value.name}": ` : '';

            return `{${name}${modelValue}${viewValue}${parsers}${formatters}${validators}${asyncValidators}${viewChangeListeners}${errors}${pending}${flags}`;

        }

        if ( _.isObject(value) && value.nrName ) {

            if (value.valueOf) {
                return `Object(${value.nrName}:${JsonUtils.stringify(value.valueOf())})`;
            }

            return `Object(${value.nrName}:${JsonUtils.stringify(value)})`;

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
