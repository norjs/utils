
const _ = require('lodash');

/**
 *
 * @type {typeof TypeUtils}
 */
const TypeUtils = require("@norjs/utils/Type");

/**
 *
 * @type {typeof LogicUtils}
 */
const LogicUtils = require('@norjs/utils/Logic');

/**
 *
 */
class HttpUtils {

    /**
     *
     * @param value {string}
     * @return {boolean}
     */
    static isPort (value) {
        return _.isString(value) && /^[0-9]+/.test(value);
    }

    /**
     *
     * @param value {string}
     * @return {number}
     */
    static getPort (value) {

        if (!_.isString(value)) {
            throw new TypeError(`HttpUtils.getPort(value): Not a string: ${value}`);
        }

        return parseInt(value, 10);
    }

    /**
     * Returns a label for port configuration for printing user.
     *
     * @param value {string}
     * @return {string}
     */
    static getPortLabel (value) {
        return `*:${value}`;
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
            server.listen(HttpUtils.getPort(value), callback);
        }

    }

    /**
     *
     * @param http {HttpServerModule}
     * @param onRequest {Function|function} The callback takes (request, response) as params
     * @returns {HttpServerObject}
     */
    static createServer (http, onRequest) {

        // noinspection JSCheckFunctionSignatures
        return http.createServer(
            (req, res) => {

                const result = LogicUtils.tryCatch(
                    () => onRequest(req, res),
                    err => {

                        if (err && err.stack) {
                            console.log('Error: ' + err.stack);
                        } else {
                            console.log('Error: ' + err);
                        }

                        if (!res.headersSent) {
                            res.setHeader('Content-Type', 'application/json');
                            res.writeHead(500, { 'Content-Type': 'application/json' });
                            res.end('{"error": "Exception", "code": 500}');
                        } else {
                            res.end();
                        }

                    }
                );

                if (result && result.catch) {
                    result.catch(err => {
                        console.error('Error: ', err);
                    });
                }

            }
        );

    }

}

// Exports
module.exports = HttpUtils;
