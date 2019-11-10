import _ from 'lodash';
import {LogUtils} from "./LogUtils";
import StringUtils from "./StringUtils";

/**
 *
 * @type {string}
 */
const NODE_ENV = process.env.NODE_ENV ? _.toLower(process.env.NODE_ENV) : 'development';

/**
 *
 * @type {boolean}
 */
const IS_DEVELOPMENT = NODE_ENV === 'development';

/**
 *
 * @type {number}
 */
const LOGGER_MAX_LINE_LENGTH = process.env.NR_LOG_MAX_LINE_LENGTH ? StringUtils.parseInteger(process.env.NR_LOG_MAX_LINE_LENGTH) : 500;

/**
 * Log levels as a string
 *
 * @enum {string}
 * @readonly
 */
export const LogLevel = {
    TRACE : 'TRACE',
    DEBUG : 'DEBUG',
    INFO  : 'INFO',
    WARN  : 'WARN',
    ERROR : 'ERROR'
};

/**
 * Log levels as a number
 *
 * @enum {number}
 * @readonly
 */
export const LogLevelNumber = {

    /**
     * ALL (6)
     */
    ALL   : 6,

    /**
     * TRACE (5)
     */
    TRACE : 5,

    /**
     * DEBUG (4)
     */
    DEBUG : 4,

    /**
     * INFO (3)
     */
    INFO  : 3,

    /**
     * WARN (2)
     */
    WARN  : 2,

    /**
     * ERROR (1)
     */
    ERROR : 1,

    /**
     * NONE (0)
     */
    NONE  : 0

};

/**
 *
 */
export class LogLevelUtils {

    // noinspection JSUnusedGlobalSymbols
    /**
     *
     * @param level {string}
     * @returns {LogLevel|undefined}
     */
    static parseLogLevel (level) {

        switch (_.trim(_.toUpper(level))) {

            case "ALL"  : return LogLevel.TRACE;
            case "TRACE": return LogLevel.TRACE;
            case "DEBUG": return LogLevel.DEBUG;
            case "INFO" : return LogLevel.INFO;
            case "WARN" : return LogLevel.WARN;
            case "ERROR": return LogLevel.ERROR;
            default:      return undefined;
        }

    }

    /**
     *
     * @param level {string}
     * @returns {LogLevelNumber|undefined}
     */
    static parseLogLevelNumber (level) {

        switch (_.trim(_.toUpper(level))) {

            case "ALL"   : return LogLevelNumber.ALL;
            case "TRACE" : return LogLevelNumber.TRACE;
            case "DEBUG" : return LogLevelNumber.DEBUG;
            case "INFO"  : return LogLevelNumber.INFO;
            case "WARN"  : return LogLevelNumber.WARN;
            case "ERROR" : return LogLevelNumber.ERROR;
            case "NONE"  : return LogLevelNumber.NONE;
            default      : return IS_DEVELOPMENT ? LogLevelNumber.TRACE : LogLevelNumber.INFO;
        }

    }

}

/**
 * Current log level
 * @type {number}
 */
const NR_LOG_LEVEL = process.env.NR_LOG_LEVEL ? LogLevelUtils.parseLogLevelNumber(process.env.NR_LOG_LEVEL) : ( IS_DEVELOPMENT ? LogLevelNumber.TRACE : LogLevelNumber.INFO );

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

        /**
         * @member {number}
         * @private
         */
        this._logLevel = NR_LOG_LEVEL;

    }

    // noinspection JSUnusedGlobalSymbols
    /**
     *
     * @param level {LogLevel|string}
     */
    setLogLevel (level) {

        this._logLevel = LogLevelUtils.parseLogLevelNumber(level);

    }

    trace (...args) {
        if ( IS_DEVELOPMENT && this._logLevel >= LogLevelNumber.TRACE ) {
            try {
                console.log(this._getLine(LogLevel.TRACE, ...args));
            } catch (err) {
                console.error(`${this.nrName}.trace(): Exception: `, err);
            }
        }
    }

    debug (...args) {
        if ( this._logLevel >= LogLevelNumber.DEBUG ) {
            try {
                console.debug(this._getLine(LogLevel.DEBUG, ...args));
            } catch (err) {
                console.error(`${this.nrName}.debug(): Exception: `, err);
            }
        }
    }

    info (...args) {
        if ( this._logLevel >= LogLevelNumber.INFO ) {
            try {
                console.info(this._getLine(LogLevel.INFO, ...args));
            } catch (err) {
                console.error(`${this.nrName}.info(): Exception: `, err);
            }
        }
    }

    warn (...args) {
        if ( this._logLevel >= LogLevelNumber.WARN ) {
            try {
                console.warn(this._getLine(LogLevel.WARN, ...args));
            } catch (err) {
                console.error(`${this.nrName}.warn(): Exception: `, err);
            }
        }
    }

    error (...args) {
        if ( this._logLevel >= LogLevelNumber.ERROR ) {
            try {
                console.error(this._getLine(LogLevel.ERROR, ...args));
            } catch (err) {
                console.error(`${this.nrName}.error(): Exception: `, err);
            }
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
