import _ from 'lodash';
import LogicUtils from './LogicUtils.js';
import StringUtils from './StringUtils.js';
import HttpError from './HttpError.js';
import LogUtils from "./LogUtils";
import JsonUtils from "./JsonUtils";

export const NR_DEFAULT_HOSTNAME = process.env.NR_DEFAULT_HOSTNAME ? process.env.NR_DEFAULT_HOSTNAME : 'localhost';

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
 * @type {Logger}
 */
const nrLog = LogUtils.getLogger("HttpUtils");

/**
 *
 * @enum {number}
 * @readonly
 */
export const NrHttpStatusCode = {

    INTERNAL_SERVER_ERROR : 500

};

/**
 *
 * @enum {string}
 * @readonly
 */
export const NrHttpStatusText = {

    INTERNAL_SERVER_ERROR : "nrErrors.internalServerError"

};

/**
 *
 */
export class HttpUtils {

    /**
     *
     * @returns {typeof HttpError}
     */
    static get HttpError () {
        return HttpError;
    }

    /**
     *
     * @returns {typeof NrHttpStatusCode}
     */
    static get StatusCode () {
        return NrHttpStatusCode;
    }

    /**
     *
     * @returns {typeof NrHttpStatusText}
     */
    static get StatusText () {
        return NrHttpStatusText;
    }

    /**
     * This detects values like `"port"` or `port`.
     *
     * @param value {string|number}
     * @return {boolean}
     */
    static isPort (value) {

        if (_.isNumber(value)) {
            return true;
        }

        if (!_.isString(value)) {
            return false;
        }

        if (value.startsWith('http://localhost:')) {
            return true;
        }

        return /^[0-9]+/.test(value);

    }

    /**
     * This detects values like `"[http://]hostname:port"` or `"[http://]hostname"` where port would be 80
     *
     * @param value {string}
     * @return {boolean}
     */
    static isHostPort (value) {

        if (!_.isString(value)) {
            return false;
        }

        if (value.startsWith('http://')) {
            return true;
        }

        if (value.length === 0) {
            return false;
        }

        if (/^[0-9]+$/.test(value)) {
            return false;
        }

        return /^[a-zA-Z0-9]/.test(value);

    }

    /**
     *
     * @param value {string}
     * @return {boolean}
     */
    static isSocket (value) {

        if (!_.isString(value)) {
            return false;
        }

        if (value.startsWith('socket://')) {
            return true;
        }

        return value.length >= 1 && (value[0] === '.' || value[0] === '/');

    }

    /**
     *
     * @param value {string}
     * @param type {string}
     * @return {boolean}
     */
    static isProto (value, type) {

        return _.isString(value) ? value.startsWith(`${type}://`) : false;

    }

    /**
     *
     * @param value {string}
     * @return {string}
     */
    static getHost (value) {

        if (!_.isString(value)) {
            throw new TypeError(`HttpUtils.getPort(value): Not a string: "${value}"`);
        }

        // Remove possible 'ANY://'
        let i = value.indexOf('://');
        if (i >= 0) {
            value = value.substr(i + 3);
        }

        // Get until next ':', if exists
        i = value.indexOf(':');
        if (i >= 0) {
            return value.substr(0, i) || NR_DEFAULT_HOSTNAME;
        }

        // Get until next '/', if exists
        i = value.indexOf('/');
        if (i >= 0) {
            return value.substr(0, i) || NR_DEFAULT_HOSTNAME;
        }

        return value || NR_DEFAULT_HOSTNAME;

    }

    /**
     *
     * @param value {string}
     * @return {HttpClientOptionsObject}
     */
    static parseOptionsFromURL (value) {

        if (!_.isString(value)) {
            throw new TypeError(`HttpUtils.parseUrl(value): Not a string: "${value}"`);
        }

        let options = {};

        // Parse protocol 'ANY://'
        let i = value.indexOf('://');
        if (i >= 0) {

            const protocol = options.protocol = value.substr(0, i+1);

            value = value.substr(i + 3);

            if (protocol === 'socket:') {
                options.socketPath = value;
                return options;
            }

            if ( ! ( (protocol === 'http:') || (protocol === 'https:') ) ) {
                throw new TypeError(`HttpUtils.parseOptionsFromURL(value): Unsupported protocol: "${protocol}"`);
            }

        }

        // Parse until next ':', if any
        i = value.indexOf(':');
        if (i >= 0) {

            options.host = value.substr(0, i);

            value = value.substr(i + 1);

            // Remove until next '/', if any
            i = value.indexOf('/');
            if (i >= 0) {
                options.port = StringUtils.strictParseInteger( value.substr(0, i) );
                value = value.substr(i);
            } else {
                options.port = StringUtils.strictParseInteger( value );
                value = undefined;
            }

        } else {

            // Remove until next '/', if any
            i = value.indexOf('/');
            if (i >= 0) {
                options.host = value.substr(0, i);
                value = value.substr(i);
            } else {
                options.host = value;
                value = undefined;
            }

        }

        options.path = value;

        return options;

    }

    /**
     *
     * @param value {string}
     * @return {string}
     */
    static getProtocol (value) {

        if (!_.isString(value)) {
            throw new TypeError(`HttpUtils.getProto(value): Not a string: "${value}"`);
        }

        // Parse 'ANY://', if exists
        const i = value.indexOf('://');
        if (i >= 0) {
            return value.substr(0,i + 1);
        }

        return 'http:';

    }

    /**
     *
     * @param value {string|number}
     * @return {number}
     */
    static getPort (value) {

        if (_.isNumber(value)) {
            return value;
        }

        if (!_.isString(value)) {
            throw new TypeError(`HttpUtils.getPort(value): Not a string: "${value}"`);
        }

        // Remove possible 'ANY://'
        let i = value.indexOf('://');
        if (i >= 0) {
            value = value.substr(i + 3);
        }

        // Remove until next ':', if any
        i = value.indexOf(':');
        if (i >= 0) {
            value = value.substr(i+1);
        }

        if (StringUtils.isInteger(value)) {
            return StringUtils.strictParseInteger(value);
        } else {
            return 80;
        }

    }

    /**
     *
     * @param value {string}
     * @return {string}
     */
    static getSocket (value) {

        if (!_.isString(value)) {
            throw new TypeError(`HttpUtils.getSocket(value): Not a string: "${value}"`);
        }

        if (value.startsWith('socket://')) {
            value = value.substr('socket://'.length);
        }

        return value;
    }

    /**
     *
     * @param value {string}
     * @param type {string}
     * @return {string}
     */
    static getProtoValue (value, type) {

        if (!_.isString(type)) {
            throw new TypeError(`HttpUtils.getProto(value, type): type not a string: "${type}"`);
        }

        const prefix = `${type}://`;

        if (!_.isString(value)) {
            throw new TypeError(`HttpUtils.getProto(value, "${type}"): value not a string: "${value}"`);
        }

        if (!value.startsWith(prefix)) {
            throw new TypeError(`Not a ${type} url: "${value}"`);
        }

        return value.substr(prefix.length);

    }

    /**
     * Returns a label for port configuration for printing user.
     *
     * @param value {string}
     * @return {string}
     */
    static getPortLabel (value) {
        return `http://${NR_DEFAULT_HOSTNAME}:${value}`;
    }

    /**
     * Returns a label for port configuration for printing user.
     *
     * @param value {string}
     * @return {string}
     */
    static getSocketLabel (value) {
        return `socket://${value}`;
    }

    /**
     * Returns a label for port configuration for printing user.
     *
     * @param value {string}
     * @return {string}
     */
    static getLabel (value) {

        if ( HttpUtils.isPort(value) ) {
            return HttpUtils.getPortLabel(value);
        }

        if ( HttpUtils.isSocket(value) ) {
            return HttpUtils.getSocketLabel(value);
        }

        return value;
    }

    /**
     *
     * @param server {HttpServerObject}
     * @param value {string}
     * @param callback {Function|function}
     */
    static listen (server, value, callback) {

        if ( HttpUtils.isHostPort(value) ) {
            server.listen(HttpUtils.getPort(value), HttpUtils.getHost(value), callback);
            return;
        }

        if ( HttpUtils.isPort(value) ) {
            server.listen(HttpUtils.getPort(value), NR_DEFAULT_HOSTNAME, callback);
            return;
        }

        if ( HttpUtils.isSocket(value) ) {
            server.listen(HttpUtils.getSocket(value), callback);
            return;
        }

        throw new TypeError(`Unsupported listening configuration: "${value}"`);

    }

    /**
     *
     * @param req
     * @param res
     * @param err
     */
    static handleError (req, res, err) {

        LogicUtils.tryCatch(
            () => {

                if ( err instanceof HttpError ) {

                    if (!res.headersSent) {

                        if (IS_DEVELOPMENT) {

                            HttpUtils.writeErrorJson(
                                res,
                                err.message,
                                err.code,
                                err.headers,
                                {
                                    title: `${err}`,
                                    summary: err.stack ? `${err.stack}` : undefined
                                }
                            );

                        } else {

                            HttpUtils.writeErrorJson(res, err.message, err.code, err.headers);

                        }

                    } else {

                        if ( err && err.stack ) {
                            nrLog.error('Headers were already sent: ', err.stack);
                        } else {
                            nrLog.error('Headers were already sent: ', err);
                        }

                        res.end();

                    }

                    return;
                }

                if ( err && err.stack ) {
                    nrLog.error('Response Error: ' + err.stack);
                } else {
                    nrLog.error('Response Error: ' + err);
                }

                if (!res.headersSent) {

                    if (IS_DEVELOPMENT) {

                        HttpUtils.writeErrorJson(
                            res,
                            NrHttpStatusText.INTERNAL_SERVER_ERROR,
                            NrHttpStatusCode.INTERNAL_SERVER_ERROR,
                            {},
                            {
                                title: `${err}`,
                                summary: err.stack ? `${err.stack}` : undefined
                            }
                        );

                    } else {

                        HttpUtils.writeErrorJson(
                            res,
                            NrHttpStatusText.INTERNAL_SERVER_ERROR,
                            NrHttpStatusCode.INTERNAL_SERVER_ERROR
                        );

                    }

                } else {

                    res.end();

                }

            },
            err2 => {

                nrLog.error('ERROR in error handler: ', err2);

                if (err && err.stack) {
                    nrLog.error('Original error was: ', err.stack);
                } else {
                    nrLog.error('Original error was: ', err);
                }

                res.end();
            }
        );

    }

    /**
     *
     * *NOTE!* Make sure you start listening the 'error' event from returned server object!
     *
     * @param http {HttpServerModule}
     * @param onRequest {Function|function} The callback takes (request, response) as params
     * @returns {HttpServerObject}
     */
    static createJsonServer (http, onRequest) {

        // noinspection JSCheckFunctionSignatures
        return http.createServer(
            (req, res) => {

                const handleError = (err) => {
                    HttpUtils.handleError(req, res, err);
                };

                LogicUtils.tryCatch(
                    () => {

                        const result = onRequest(req, res);

                        if (result && result.then) {

                            result.then( payload => {

                                if (!res.headersSent) {
                                    HttpUtils.writeJson(res, payload );
                                } else {
                                    res.end();
                                }

                            }).catch(handleError);

                        } else {

                            if (!res.headersSent) {
                                HttpUtils.writeJson(res, result );
                            } else {
                                res.end();
                            }

                        }

                    },
                    handleError
                );

            }
        );

    }

    /**
     *
     * @param res {HttpResponseObject}
     * @param data {*}
     * @param code {number}
     * @param headers {Object}
     */
    static writeJson (res, data, code = 200, headers = {}) {

        _.forEach(_.keys(headers), key => {
            res.setHeader(key, headers[key]);
        });

        res.setHeader('Content-Type', 'application/json');

        res.writeHead(code, { 'Content-Type': 'application/json' });

        res.end( JsonUtils.stringify(data) + '\n' );

    }

    /**
     *
     * @param res {HttpResponseObject}
     * @param code {number}
     * @param [error] {string}
     * @param [headers] {Object}
     * @param [payload] {Object}
     */
    static writeErrorJson (res, error, code = 500, headers = {}, payload = {}) {

        HttpUtils.writeJson(res, {error, code, payload}, code, headers);

    }

    /**
     *
     * @param req {HttpRequestObject}
     * @returns {string}
     */
    static getUrl (req) {

        let url = req.url;

        const paramsStartIndex = url.indexOf('?');
        if (paramsStartIndex >= 0) {
            url = url.substr(0, paramsStartIndex);
        }

        return _.replace(`${url}/`, /\/+$/, "/");

    }

    /**
     *
     * @param req {HttpRequestObject}
     * @returns {string}
     */
    static getMethod (req) {
        return `${req.method}`;
    }

    /**
     *
     * @param req {HttpRequestObject}
     * @returns {{url: string, method: string}}
     */
    static getRequestAction (req) {
        return {
            url: HttpUtils.getUrl(req),
            method: HttpUtils.getMethod(req)
        };
    }

    /**
     *
     * @param url {string}
     * @param method {string}
     * @param routes {Object}
     * @param args {*} Any argument which should be binded to the route callback
     * @returns {*}
     * @throws {HttpError} May throw HttpErrors
     */
    static routeRequest ({url, method}, routes, ...args) {

        switch (method) {

            case "GET":
            case "HEAD":
            case "POST":
            case "PUT":
            case "DELETE":
            case "CONNECT":
            case "OPTIONS":
            case "TRACE":
            case "PATCH":

                if (_.has(routes, method)) {
                    break;
                }

                nrLog.trace(`.routeRequest(): Method "${method}" wasn't configured in routes`);

                throw new HttpError(405, `Method not allowed: ${method}`);

            default:
                nrLog.trace(`.routeRequest(): Method "${method}" wasn't supported`);
                throw new HttpError(405, `Method not allowed: ${method}`);

        }

        let useDefaultRoute = false;

        const hasDefaultRoute = _.has(routes[method], "DEFAULT");

        if (url.length === 0) {
            if (hasDefaultRoute) {
                useDefaultRoute = true;
            } else {
                nrLog.trace(`.routeRequest(): Request "${method} ${url}": URL was empty.`);
                throw new HttpError(404, `Not Found: ${url}`);
            }
        }

        if (url[0] !== "/") {
            if (hasDefaultRoute) {
                useDefaultRoute = true;
            } else {
                nrLog.trace(`.routeRequest(): Request "${method} ${url}": URL didn't start with "/"`);
                throw new HttpError(404, `Not Found: ${url}`);
            }
        }

        if (!_.has(routes[method], url)) {
            if (hasDefaultRoute) {
                useDefaultRoute = true;
            } else {
                nrLog.trace(`.routeRequest(): Request "${method} ${url}": Route wasn't configured`);
                throw new HttpError(404, `Not Found: ${url}`);
            }
        }

        if (useDefaultRoute) {

            nrLog.trace(`.routeRequest(): Handling request "${method} ${url}" using default route...`);

            if (_.isFunction(routes[method].DEFAULT)) {
                return routes[method].DEFAULT(...args);
            }

            return routes[method].DEFAULT;

        }

        nrLog.trace(`.routeRequest(): Handling request "${method} ${url}"...`);

        if (_.isFunction(routes[method][url])) {
            return routes[method][url](...args);
        }

        return routes[method][url];

    }

    /**
     * Get request body data as Buffer object.
     *
     * @param request {HttpRequestObject}
     * @return {Promise.<Buffer>} The request input data
     */
    static async getRequestDataAsBuffer (request) {
        return new Promise( (resolve, reject) => {

            let chunks = [];

            request.on('data', chunk => {
                LogicUtils.tryCatch(() => {
                    chunks.push(chunk);
                }, reject);
            });

            request.on('end', () => {
                LogicUtils.tryCatch(() => {
                    resolve( Buffer.concat(chunks) );
                }, reject);
            });

        });
    }

    /**
     * Get request body data as JSON.
     *
     * @param request {HttpRequestObject}
     * @param encoding {string}
     * @return {Promise<string | string>} The request input data
     */
    static async getRequestDataAsString (request, encoding = 'utf8') {

        const buffer = await HttpUtils.getRequestDataAsBuffer(request);

        return buffer.toString(encoding);

    }

    /**
     * Get request body data as JSON.
     *
     * @param request {HttpRequestObject}
     * @return {Promise.<*|undefined>} The request input data. If request data is an empty string, an `undefined` will be returned.
     */
    static async getRequestDataAsJson (request) {

        const dataString = await HttpUtils.getRequestDataAsString(request);

        if (dataString === "") {
            return undefined;
        } else {
            return JSON.parse(dataString);
        }

    }

    /**
     *
     * @param fromRequest { HttpRequestObject | HttpClientResponseObject }
     * @param toRequest { HttpResponseObject | HttpClientRequestObject }
     * @param encoding {string} If chunk in 'data' event is a string, this will be used as the encoding.
     * @returns {Promise}
     */
    static proxyDataTo (fromRequest, toRequest, {
        encoding = 'utf8'
    } = {}) {
        return new Promise( (resolve, reject) => {

            fromRequest.on('data', (chunk) => {
                LogicUtils.tryCatch( () => {

                    if (_.isString(chunk)) {
                        toRequest.write(chunk, encoding);
                    } else {
                        toRequest.write(chunk);
                    }

                // FIXME: If an error happens, we should remove the 'end' listener? See https://github.com/norjs/utils/issues/3
                }, reject);
            });

            fromRequest.on('end', () => { resolve(); });

        });
    }

    /**
     *
     * @param options {string|Object}
     * @returns {HttpClientOptionsObject}
     */
    static parseClientOptions (options) {

        if (_.isObject(options)) {
            return options;
        }

        if (!_.isString(options)) {
            throw new TypeError(`HttpUtils.parseOptions(options): illegal value: ${options}`);
        }

        if ( HttpUtils.isHostPort(options) ) {
            return {
                host: HttpUtils.getHost(options),
                port: HttpUtils.getPort(options)
            };
        }

        if ( HttpUtils.isPort(options) ) {
            return {
                host: NR_DEFAULT_HOSTNAME,
                port: HttpUtils.getPort(options)
            };
        }

        if ( HttpUtils.isSocket(options) ) {
            return {
                socketFile: HttpUtils.getSocket(options)
            };
        }

        throw new TypeError(`Unsupported configuration string: "${options}"`);

    }

    /**
     * Get request query parameters.
     *
     * @params {*} url
     * @params {HttpRequestObject} request
     * @returns {{}}
     */
    static getParams (url, request) {
        return url.parse(request.url, true).query;
    }

    /**
     * Returns a value converted as 'Set-Cookie' header(s).
     *
     * Example: `response.setHeader('Set-Cookie', HttpUtils.getSetCookieHeaders({type: 'ninja', language: 'javascript'}));`
     *
     * @param value {Object}
     * @param secure {boolean} Only secure connections accepted.
     * @param httpOnly {boolean} The cookie is available only to the server, not JavaScript.
     * @param expires {string} A date like `"Wed, 21 Oct 2015 07:28:00 GMT"`
     * @param domain {string} Optional domain
     * @param path {string} Optional path
     * @param sameSite {string} Possible values: `"Strict"` or `"Lax"`
     * @returns {Array.<string>}
     */
    static getSetCookieHeaders (
        value,
        {
            secure = true
            , httpOnly = true
            , expires = undefined
            , domain = undefined
            , path = undefined
            , sameSite = undefined
        } = {}
    ) {

        return _.map(
            _.keys(value),
            key => `${ this._escapeForCookie(key) }=${ this._escapeForCookie(value[key]) }${ 
                domain ? `; Domain=${domain}` : '' }${ 
                path ? `; Path=${path}` : '' }${
                sameSite ? `; SameSite=${sameSite}` : '' }${ 
                expires ? `; Expires=${expires}` : '' }${ 
                secure ? '; Secure' : '' }${ 
                httpOnly ? '; HttpOnly' : '' }`
        );

    }

    static _escapeForCookie (value) {

        return encodeURIComponent(value);

    }

}

// Exports
export default HttpUtils;
