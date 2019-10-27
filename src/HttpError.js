import _ from 'lodash';
import HTTP from 'http';

/** User definable object for codes
 *
 * @type {Object.<number, Function>}
 */
const CODES = {};

/** Exception type for HTTP errors
 *
 * Use it like:
 *
 *  - `throw new HttpError(404)`, or
 *  - `throw new HttpError(404, "Not Found")`, or
 *  - `throw new HttpError(404, "Not Found", {customHeader:123})`
 *
 * The order of arguments is not important; type is.
 *
 */
export class HTTPError extends Error {

    /**
     *
     * @param args {*}
     */
    constructor (...args) {

        let headers = undefined;
        let msg = undefined;
        let code = undefined;
        _.forEach(args, (arg) => {
            if(_.isObject(arg)) {
                headers = arg;
            }
            if(_.isString(arg)) {
                msg = arg;
            }
            if(_.isNumber(arg)) {
                code = arg;
            }
        });

        code = code || 500;
        msg = msg || (''+code+' '+HTTP.STATUS_CODES[code]);
        headers = headers || {};

        super();

        Error.captureStackTrace(this, HTTPError);

        this.code = code;
        this.message = msg;
        this.headers = headers;

    }

    // noinspection JSMethodCanBeStatic
    /**
     *
     * @returns {string}
     */
    get name () {
        return 'HTTP Error';
    }

    /**
     *
     * You may also create custom exception for our HTTP error 401:
     *
     *      HTTPError.codes[401] = () => new HTTPError(401, 'Login required', {
     * 			'WWW-Authenticate':'OpenID realm="My Realm"',
     * 			'location':'https://example.com/signin'
     * 		});
     *
     * @returns {Object<number, Function>}
     */
    static get codes () {
        return CODES;
    }

    /** Create HTTP exception */
    static create (code, msg, headers) {
        return (HTTPError.codes[code] && HTTPError.codes[code](code, msg, headers)) || new HTTPError(code, msg, headers);
    }

}

// Exports
export default HTTPError;
