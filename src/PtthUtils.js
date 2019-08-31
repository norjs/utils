
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
class PtthUtils {

    /**
     *
     * @param request
     * @param socket
     * @param head
     * @returns {boolean} True if protocols were switched
     */
    static onServerUpgrade (request, socket, head) {

        if (request.headers['upgrade'] !== 'PTTH/1.0') {

            PtthUtils.onUpgradeNotPtthProtocolError(request, socket, head);

            return false;
        }

        PtthUtils.onSwitchingProtocols(request, socket, head);

        return true;

    }

    /**
     *
     * @param http
     * @param socket
     * @param options
     * @param callback {Function}
     * @returns {*}
     */
    static request (http, socket, options, callback) {

        if (!http) throw new TypeError(`PtthUtils.request(http, socket): Http invalid: ${http}`);

        if (!socket) throw new TypeError(`PtthUtils.request(http, socket): Socket invalid: ${socket}`);

        const myOptions = _.merge({
            createConnection: () => socket,
            headers: {
                connection: 'keep-alive'
            }
        }, options);

        return http.request(myOptions, callback);

    }

    /**
     *
     * @param request
     * @param socket
     * @param head
     */
    static onSocketAlreadyCreatedError (request, socket, head) {

        console.error(`ERROR: The socket was already created.`);

        socket.end('HTTP/1.1 500 Internal Error');

    }

    /**
     * Called when there is a upgrade call, but it was not for PTTH/1.0.
     *
     * Should write an error message.
     *
     * @param request
     * @param socket
     * @param head
     */
    static onUpgradeNotPtthProtocolError (request, socket, head) {

        socket.end('HTTP/1.1 400 Bad Request');

    }

    /**
     * Called when Switching Protocols 101 must be called to the socket.
     *
     * @param request
     * @param socket
     * @param head
     */
    static onSwitchingProtocols (request, socket, head) {

        console.log(`Upgrade request "${ request.method }" "${ request.url }": Switching Protocols to PTTH/1.0`);

        socket.write('HTTP/1.1 101 Switching Protocols\r\n' +
            'Upgrade: PTTH/1.0\r\n' +
            'Connection: Upgrade\r\n' +
            '\r\n');

    }

    /**
     *
     * @param request
     * @param socket
     * @param err
     */
    static handleError (request, socket, head, err) {

        let replySent = false;

        LogicUtils.tryCatch(
            () => {

                if (err instanceof HttpError) {
                    replySent = true;
                    socket.end(`HTTP/1.1 ${err.code} ${err.message}`);
                    return;
                }

                if (err && err.stack) {
                    console.error('Error: ' + err.stack);
                } else {
                    console.error('Error: ' + err);
                }

                replySent = true;
                socket.end(`HTTP/1.1 500 Internal Server Error`);

            },
            err => {
                console.error('ERROR in error handler: ', err);
                if (!replySent) {
                    socket.end(`HTTP/1.1 500 Internal Server Error`);
                }
            }
        );

    }

}

// Exports
module.exports = PtthUtils;
