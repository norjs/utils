import _ from 'lodash';
import LogUtils from './LogUtils.js';
import LogicUtils from './LogicUtils.js';
import HttpUtils from './HttpUtils.js';
import HttpError from './HttpError.js';

const nrLog = LogUtils.getLogger("PtthUtils");

/**
 *
 */
export class PtthUtils {

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
     * Creates a HTTP request using an existing socket.
     *
     * Same syntax as in `http.request(options, callback)`, except you can provide a socket.
     *
     * @param http
     * @param socket
     * @param options { string | HttpClientOptionsObject }
     * @param callback {Function}
     * @returns {*}
     */
    static request (http, socket, options, callback) {

        if (!http) throw new TypeError(`PtthUtils.request(http, socket): Http invalid: ${http}`);

        if (!socket) throw new TypeError(`PtthUtils.request(http, socket): Socket invalid: ${socket}`);

        if (!options) throw new TypeError(`PtthUtils.connect(): options was not defined: ${options}`);

        if (!_.isFunction(callback)) throw new TypeError(`PtthUtils.connect(): callback was not a function: ${callback}`);

        if (_.isString(options)) {
            options = HttpUtils.parseOptionsFromURL(options);
        }

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

        nrLog.error(LogUtils.getLine(`ERROR: The socket was already created.`));

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

        nrLog.log(LogUtils.getLine(`"${ request.method } ${ request.url }": Switching Protocols to PTTH/1.0`));

        // noinspection JSUnresolvedFunction
        socket.setKeepAlive(true);

        socket.write('HTTP/1.1 101 Switching Protocols\r\n' +
            'Upgrade: PTTH/1.0\r\n' +
            'Connection: Upgrade\r\n' +
            '\r\n');

    }

    /**
     *
     * @param request
     * @param socket
     * @param head
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
                    nrLog.error(LogUtils.getLine('Error: ' + err.stack));
                } else {
                    nrLog.error(LogUtils.getLine('Error: ' + err));
                }

                replySent = true;
                socket.end(`HTTP/1.1 500 Internal Server Error`);

            },
            err => {
                nrLog.error(LogUtils.getLine('ERROR in error handler: '), err);
                if (!replySent) {
                    socket.end(`HTTP/1.1 500 Internal Server Error`);
                }
            }
        );

    }

    /**
     * Connects to a remote server and start a connection upgrade for reversed HTTP (PTTH/1.0), eg. reversing the HTTP
     * direction, so that the client will be the server, and server can be a client.
     *
     * @param http
     * @param options {string|object}
     * @param onUpgrade { function(response, socket, head): T }
     * @returns {Promise.<T>} The promise will return the return value from onUpgrade() attribute
     * @template T
     */
    static connect (http, options, onUpgrade) {

        if (!http) throw new TypeError(`PtthUtils.connect(): http was not defined: ${http}`);

        if (!options) throw new TypeError(`PtthUtils.connect(): options was not defined: ${options}`);

        if (_.isString(options)) {
            options = HttpUtils.parseOptionsFromURL(options);
        }

        if (!_.isFunction(onUpgrade)) throw new TypeError(`PtthUtils.connect(): onUpgrade was not a function: ${onUpgrade}`);

        return new Promise( (resolve, reject) => {

            LogicUtils.tryCatch(
                () => {

                    const requestOptions = _.merge({
                        headers: {
                            'Connection': 'Upgrade',
                            'Upgrade': 'PTTH/1.0'
                        },
                        timeout: 0
                    }, options);

                    const request = http.request(requestOptions);

                    request.on('error', err => reject(err));

                    request.on('upgrade', (response, socket, upgradeHead) => {
                        LogicUtils.tryCatch(() => {
                            resolve( onUpgrade(response, socket, upgradeHead) );
                        }, err => reject(err));
                    });

                    request.end();

                },
                err => reject(err)
            );

        });

    }

    /**
     * Handles connection upgrade to a HTTP server after successful client request.
     *
     * @param http
     * @param response
     * @param socket
     * @param upgradeHead
     * @param server
     */
    static onClientUpgrade (http, server, response, socket, upgradeHead) {

        socket.setKeepAlive(true);

        PtthUtils.connectSocketToServer(server, socket);

    }

    /**
     *
     * @param server
     * @param socket
     * @fixme Figure out a public API to do the same thing, see https://github.com/norjs/utils/issues/2
     */
    static connectSocketToServer (server, socket) {

        server._socket = socket;

        server.emit('connection', server._socket);

    }

}

// Exports
export default PtthUtils;
