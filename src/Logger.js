import _ from 'lodash';
import {LogUtils} from "./LogUtils";

const NODE_ENV = process.env.NODE_ENV ? process.env.NODE_ENV : 'development';

const IS_DEVELOPMENT = NODE_ENV === 'development';

/**
 *
 * @enum {string}
 * @readonly
 */
export const LogLevel = {
    TRACE: 'TRACE',
    DEBUG: 'DEBUG',
    INFO: 'INFO',
    WARN: 'WARN',
    ERROR: 'ERROR'
};

/**
 *
 */
export class Logger {

    static get nrName () {
        return "NrLogger";
    }

    get Class () {
        return Logger;
    }

    get nrName () {
        return this.Class.nrName;
    }

    /**
     *
     * @param name {string}
     */
    constructor (name) {

        if (!(name && _.isString(name))) {
            throw new TypeError(`${this.nrName}: new Logger() with illegal name: ${name}`);
        }

        /**
         *
         * @member {string}
         * @private
         */
        this._name = name;

    }

    trace (...args) {
        if (IS_DEVELOPMENT) {
            console.log(this._getLine(LogLevel.TRACE, ...args));
        }
    }

    debug (...args) {
        console.debug(this._getLine(LogLevel.DEBUG, ...args));
    }

    info (...args) {
        console.info(this._getLine(LogLevel.INFO, ...args));
    }

    warn (...args) {
        console.warn(this._getLine(LogLevel.WARN, ...args));
    }

    error (...args) {
        console.error(this._getLine(LogLevel.ERROR, ...args));
    }

    /**
     *
     * @param logLevel {LogLevel|string}
     * @param value {Array.<*>}
     * @returns {string}
     * @private
     */
    _getLine (logLevel, ...value) {
        return `[${LogUtils.getTime()}] [${logLevel}] [${this._name}] ${LogUtils.getArrayAsString(value)}`;
    }

}

// Exports
export default Logger;
