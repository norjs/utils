import LogicUtils from './LogicUtils.js';
import LogUtils from './LogUtils.js';
import PATH from 'path';
import _ from "lodash";

const nrLog = LogUtils.getLogger("ProcessUtils");

/**
 *
 */
export class ProcessUtils {

    /**
     *
     * @param callback {Function|function}
     */
    static setupDestroy (callback) {

        let destroyed = false;

        const closeProcess = () => LogicUtils.tryCatch(
            () => {

                if (destroyed) return;

                destroyed = true;

                callback();

            },
            err => {
                nrLog.error('Exception: ', err);
            }
        );

        process.on('exit', closeProcess);
        process.on('SIGTERM', closeProcess);
        process.on('SIGINT', closeProcess);
        process.on('SIGUSR1', closeProcess);
        process.on('SIGUSR2', closeProcess);
        process.on('uncaughtException', closeProcess);

    }

    /**
     * Require a file relative to current process cwd
     *
     * @param name {string}
     * @return {any}
     */
    static requireFile (name) {
        return require(PATH.resolve(process.cwd(), name));
    }

    /**
     * Prints error to the error log and exits process with error code 1
     *
     * @param err {*}
     */
    static handleError (err) {

        nrLog.error(`Error: `, err);

        process.exit(1);

    }

    /**
     *
     * @returns {string[]}
     */
    static getArguments () {
        return _.slice(process.argv, 2);
    }

    /**
     * Filter argv so that the result only contains arguments without a leading "-" character.
     *
     * @param argv {Array.<string>}
     * @return {Array.<string>}
     */
    static filterFreeArguments (argv) {

        return _.filter(argv, arg => arg.length && arg[0] !== '-');

    }

    /**
     * Filters argv so that it only contains values with leading "-".
     *
     * Also: The leading "-" characters are removed from the result.
     *
     * @param argv {Array.<string>}
     * @return {Array.<string>}
     */
    static filterOptions (argv) {

        return _.filter(argv, arg => arg.length && arg[0] === '-').map(arg => _.trimStart(arg, '-'));

    }

    /**
     * Parses a boolean option value.
     *
     * @param short {string}
     * @param long {string}
     * @param argv {Array.<string>}
     * @return {boolean}
     * @fixme Implement support for detecting "verbose=false" etc
     */
    static parseBooleanOption (argv, short, long = undefined) {

        if (long === undefined) {
            return _.some(argv, arg => arg === short);
        }

        return _.some(argv, arg => arg === short || arg === long);

    }

    /**
     * Parses an array of option values (eg. `["key=value"]`) into an object `{key: "value"}`.
     *
     * If no `"="` is detected, the value will be set as `true`.
     *
     * @param argv {Array}
     * @returns {Object}
     */
    static parseOptionsAsObject (argv) {

        let result = {};

        Object.keys(argv).map(arg => {

            let key, value;

            const index = arg.indexOf('=');

            if (index >= 0) {

                key = arg.substr(0, index);
                value = arg.substr(index+1);

            } else {

                key = arg;
                value = true;

            }

            result[key] = value;

        });

        return result;

    }

}

// Exports
export default ProcessUtils;
