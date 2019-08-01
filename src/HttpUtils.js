
const _ = require('lodash');

/**
 *
 * @type {typeof LogicUtils}
 */
const LogicUtils = require('./LogicUtils.js');

/**
 *
 * @type {typeof HttpError}
 */
const HttpError = require('./HttpError.js');

/**
 *
 */
class HttpUtils {

    /**
     *
     * @returns {typeof HttpError}
     */
    get HttpError () {
        return HttpError;
    }

    /**
     *
     * @param value {string|number}
     * @return {boolean}
     */
    static isPort (value) {
        if (_.isNumber(value)) return true;
        return _.isString(value) && /^[0-9]+/.test(value);
    }

    /**
     *
     * @param value {string}
     * @return {boolean}
     */
    static isSocket (value) {
        return _.isString(value) && value.length >= 1 && value[0] === '.';
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

        return parseInt(value, 10);
    }

    /**
     *
     * @param value {string}
     * @return {number}
     */
    static getSocket (value) {

        if (!_.isString(value)) {
            throw new TypeError(`HttpUtils.getSocket(value): Not a string: "${value}"`);
        }

        return value;
    }

    /**
     * Returns a label for port configuration for printing user.
     *
     * @param value {string}
     * @return {string}
     */
    static getPortLabel (value) {
        return `localhost:${value}`;
    }

    /**
     * Returns a label for port configuration for printing user.
     *
     * @param value {string}
     * @return {string}
     */
    static getSocketLabel (value) {
        return `socket:${value}`;
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

        if ( HttpUtils.isPort(value) ) {
            server.listen(HttpUtils.getPort(value), "localhost", callback);
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
     * @param http {HttpServerModule}
     * @param onRequest {Function|function} The callback takes (request, response) as params
     * @returns {HttpServerObject}
     */
    static createJsonServer (http, onRequest) {

        // noinspection JSCheckFunctionSignatures
        return http.createServer(
            (req, res) => {

                const handleError = (err) => {

                    LogicUtils.tryCatch(
                        () => {

                            if (err instanceof HttpError) {
                                HttpUtils.writeErrorJson(res, err.message, err.code, err.headers);
                                return;
                            }

                            if (err && err.stack) {
                                console.error('Error: ' + err.stack);
                            } else {
                                console.error('Error: ' + err);
                            }

                            if (!res.headersSent) {
                                HttpUtils.writeErrorJson(res, "Exception", 500);
                            } else {
                                res.end();
                            }

                        },
                        err => {
                            console.error('ERROR in error handler: ', err);
                            res.end();
                        }
                    );

                };

                LogicUtils.tryCatch(
                    () => {

                        const result = onRequest(req, res);

                        if (result && result.then) {

                            result.then( payload => {

                                if (!res.headersSent) {
                                    HttpUtils.writeJson(res, {payload} );
                                } else {
                                    res.end();
                                }

                            }).catch(handleError);

                        } else {

                            if (!res.headersSent) {
                                HttpUtils.writeJson(res, {payload: result} );
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

        res.end( JSON.stringify(data) );

        console.log('WOOT: We are here.')

    }

    /**
     *
     * @param res {HttpResponseObject}
     * @param code {number}
     * @param error {string}
     * @param headers {Object}
     */
    static writeErrorJson (res, error, code = 500, headers = {}) {

        HttpUtils.writeJson(res, {error, code}, code, headers);

    }

    /**
     *
     * @param req {HttpRequestObject}
     * @returns {string}
     */
    static getUrl (req) {
        return _.replace(`${req.url}/`, /\/+$/, "/");
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
    static routeRequest({url, method}, routes, ...args) {

        console.log(`WOOT: url = "${url}", method = "${method}"`);

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

                throw new HttpError(405, `Method not allowed: "${method}"`);

            default:
                throw new HttpError(405, `Method not allowed: "${method}"`);

        }

        if (url.length === 0) {
            throw new HttpError(404, `Not Found: "${url}"`);
        }

        if (url[0] !== "/") {
            throw new HttpError(404, `Not Found: "${url}"`);
        }

        if (!_.has(routes[method], url)) {
            throw new HttpError(404, `Not Found: "${url}"`);
        }

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
     * @protected
     */
    static getRequestDataAsBuffer (request) {
        return new Promise( (resolve, reject) => {
            LogicUtils.tryCatch(
                () => {
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

                },
                reject
            );
        });
    }

    /**
     * Get request body data as JSON.
     *
     * @param request {HttpRequestObject}
     * @param encoding {string}
     * @return {Promise<string | string>} The request input data
     * @protected
     */
    static getRequestDataAsString (request, encoding = 'utf8') {
        return HttpUtils.getRequestDataAsBuffer(request).then(buffer => buffer.toString(encoding) );
    }

    /**
     * Get request body data as JSON.
     *
     * @param request {HttpRequestObject}
     * @return {Promise.<*|undefined>} The request input data. If request data is an empty string, an `undefined` will be returned.
     * @protected
     */
    static getRequestDataAsJson (request) {
        return HttpUtils.getRequestDataAsString(request).then(dataString => {
            if (dataString === "") {
                return undefined;
            } else {
                return JSON.parse(dataString);
            }
        });
    }

}

// Exports
module.exports = HttpUtils;
