import _ from 'lodash';
import {LogUtils} from "./LogUtils";

const NODE_ENV = process.env.NODE_ENV ? process.env.NODE_ENV : 'development';

const IS_DEVELOPMENT = NODE_ENV === 'development';

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
            console.log(this._getLine(...args));
        }
    }

    debug (...args) {
        console.debug(this._getLine(...args));
    }

    info (...args) {
        console.info(this._getLine(...args));
    }

    warn (...args) {
        console.warn(this._getLine(...args));
    }

    error (...args) {
        console.error(this._getLine(...args));
    }

    _getLine (...value) {
        return `[${LogUtils.getTime()}] [${this._name}] ${LogUtils.getArrayAsString(value)}`;
    }

}

// Exports
export default Logger;
