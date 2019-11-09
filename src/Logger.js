import _ from 'lodash';
import {LogUtils} from "./LogUtils";

const NODE_ENV = process.env.NODE_ENV ? process.env.NODE_ENV : 'development';

const IS_DEVELOPMENT = NODE_ENV === 'development';

const LOGGER_MAX_LINE_LENGTH = 500;

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
            try {
                console.log(this._getLine(LogLevel.TRACE, ...args));
            } catch (err) {
                console.error(`${this.nrName}.trace(): Exception: `, err);
            }
        }
    }

    debug (...args) {
        try {
            console.debug(this._getLine(LogLevel.DEBUG, ...args));
        } catch (err) {
            console.error(`${this.nrName}.debug(): Exception: `, err);
        }
    }

    info (...args) {
        try {
            console.info(this._getLine(LogLevel.INFO, ...args));
        } catch (err) {
            console.error(`${this.nrName}.info(): Exception: `, err);
        }
    }

    warn (...args) {
        try {
            console.warn(this._getLine(LogLevel.WARN, ...args));
        } catch (err) {
            console.error(`${this.nrName}.warn(): Exception: `, err);
        }
    }

    error (...args) {
        try {
            console.error(this._getLine(LogLevel.ERROR, ...args));
        } catch (err) {
            console.error(`${this.nrName}.error(): Exception: `, err);
        }
    }

    /**
     *
     * @param logLevel {LogLevel|string}
     * @param value {Array.<*>}
     * @returns {string}
     * @private
     */
    _getLine (logLevel, ...value) {

        let line = `[${LogUtils.getTime()}] [${logLevel}] [${this._name}] ${LogUtils.getArrayAsString(value)}`;

        if (line.length >= LOGGER_MAX_LINE_LENGTH) {
            line = `${line.substr(0, LOGGER_MAX_LINE_LENGTH)}...`;
        }

        return line;

    }

}

// Exports
export default Logger;
