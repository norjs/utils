
const _ = require('lodash');

/**
 *
 * @type {typeof LogicUtils}
 */
const LogicUtils = require('./LogicUtils.js');

/**
 *
 */
class HttpUtils {

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
