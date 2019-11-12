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
 * @type {boolean}
 */
const ENABLE_LOG_COLORS = IS_DEVELOPMENT ? (process.env.NO_COLORS ? false : true) : false;

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
 * @enum {string}
 * @readonly
 * @fixme Implement AnsiColorUtils and move there
 */
const AnsiColorCode = {

    RESET       : "\x1b[0m",
    BRIGHT      : "\x1b[1m",
    DIM         : "\x1b[2m",
    UNDERSCORE  : "\x1b[4m",
    BLINK       : "\x1b[5m",
    REVERSE     : "\x1b[7m",
    HIDDEN      : "\x1b[8m",

    BLACK       : "\x1b[30m",
    RED         : "\x1b[31m",
    GREEN       : "\x1b[32m",
    YELLOW      : "\x1b[33m",
    BLUE        : "\x1b[34m",
    MAGENTA     : "\x1b[35m",
    CYAN        : "\x1b[36m",
    WHITE       : "\x1b[37m",

    BG_BLACK    : "\x1b[40m",
    BG_RED      : "\x1b[41m",
    BG_GREEN    : "\x1b[42m",
    BG_YELLOW   : "\x1b[43m",
    BG_BLUE     : "\x1b[44m",
    BG_MAGENTA  : "\x1b[45m",
    BG_CYAN     : "\x1b[46m",
    BG_WHITE    : "\x1b[47m"

};

/**
 *
 * @enum {AnsiColorCode|string}
 * @readonly
 */
const LogLevelColorCode = {

    TRACE : AnsiColorCode.CYAN,
    DEBUG : AnsiColorCode.WHITE,
    INFO  : `${AnsiColorCode.BRIGHT}${AnsiColorCode.BLUE}`,
    WARN  : AnsiColorCode.YELLOW,
    ERROR : AnsiColorCode.RED

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
     * @returns {typeof LogLevel}
     */
    static get LogLevel () {
        return LogLevel;
    }

    /**
     *
     * @returns {typeof LogLevel}
     */
    get LogLevel () {
        return this.Class.LogLevel;
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

    /**
     *
     * @returns {string}
     */
    get name () {
        return this._name;
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
                console.log(this._getLine(LogLevelColorCode.TRACE, LogLevel.TRACE, ...args));
            } catch (err) {
                console.error(`${this.nrName}.trace(): Exception: `, err);
            }
        }
    }

    debug (...args) {
        if ( this._logLevel >= LogLevelNumber.DEBUG ) {
            try {
                console.debug(this._getLine(LogLevelColorCode.DEBUG, LogLevel.DEBUG, ...args));
            } catch (err) {
                console.error(`${this.nrName}.debug(): Exception: `, err);
            }
        }
    }

    info (...args) {
        if ( this._logLevel >= LogLevelNumber.INFO ) {
            try {
                console.info(this._getLine(LogLevelColorCode.INFO, LogLevel.INFO, ...args));
            } catch (err) {
                console.error(`${this.nrName}.info(): Exception: `, err);
            }
        }
    }

    warn (...args) {
        if ( this._logLevel >= LogLevelNumber.WARN ) {
            try {
                console.warn(this._getLine(LogLevelColorCode.WARN, LogLevel.WARN, ...args));
            } catch (err) {
                console.error(`${this.nrName}.warn(): Exception: `, err);
            }
        }
    }

    error (...args) {
        if ( this._logLevel >= LogLevelNumber.ERROR ) {
            try {
                console.error(this._getLine(LogLevelColorCode.ERROR, LogLevel.ERROR, ...args));
            } catch (err) {
                console.error(`${this.nrName}.error(): Exception: `, err);
            }
        }
    }

    /**
     *
     * @param color {LogColor|string}
     * @param logLevel {LogLevel|string}
     * @param value {Array.<*>}
     * @returns {string}
     * @private
     */
    _getLine (color, logLevel, ...value) {

        let line = `[${LogUtils.getTime()}] [${logLevel}] [${this._name}] ${LogUtils.getArrayAsString(value)}`;

        if (line.length >= LOGGER_MAX_LINE_LENGTH) {
            line = `${line.substr(0, LOGGER_MAX_LINE_LENGTH)}...`;
        }

        if ( ENABLE_LOG_COLORS && color ) {
            line = `${color}${line}${AnsiColorCode.RESET}`;
        }

        return line;

    }

}

// Exports
export default Logger;
