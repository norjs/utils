
const _ = require('lodash');

const CHILD_PROCESS = require('child_process');

const LogicUtils = require('./LogicUtils.js');

/**
 *
 */
class ChildProcessUtils {

    /**
     * Execute a command as a child process.
     *
     * @param command {string}
     * @param args {Array.<string>}
     *
     * @param cwd {string}
     * @param env {Object.<string, string>} Optional environment params
     * @param argv0 {string}
     * @param detached {boolean}
     * @param uid {number}
     * @param gid {number}
     * @param shell {boolean|string}
     * @param stdout { boolean | Function | {[enabled]: boolean, [onData]: function, [encoding]: string} }
     * @param stderr { boolean | Function | {[enabled]: boolean, [onData]: function, [encoding]: string} }
     * @param unrefEnabled {boolean}
     * @param disconnectEnabled {boolean}
     * @return {Promise.<{childProcess: ChildProcess, status: number, stdout: string, stderr: string, error: *}>} Rejected promises will also have .childProcess set.
     */
    static execute (
        command,
        args,
        {
            cwd = process.cwd()
            , env = {}
            , argv0 = command
            , detached = true
            , uid = undefined
            , gid = undefined
            , shell = false

            , stdout = true
            , stderr = true
            , unrefEnabled = undefined
            , disconnectEnabled = undefined

        } = {}
    ) {

        stdout = ChildProcessUtils._parseStreamOptions(stdout);
        stderr = ChildProcessUtils._parseStreamOptions(stderr);

        const stdio = [
            "ignore",
            stdout.enabled ? "pipe" : "ignore",
            stderr.enabled ? "pipe" : "ignore"
        ];

        const options = {
            cwd: cwd,
            env: _.merge({}, _.cloneDeep(process.env), _.cloneDeep(env || {})),
            argv0,
            stdio,
            detached: !!detached,
            uid,
            gid,
            shell
        };

        /**
         *
         * @type {ChildProcessWithoutNullStreams}
         */
        const proc = CHILD_PROCESS.spawn(command, args, options);

        const promise = new Promise( (resolve, reject) => {

            const handleError = err => {
                err.childProcess = proc;
                reject( err );
            };

            LogicUtils.tryCatch( () => {

                // If command started detached and unref enabled; not waiting for it to finish.
                if ( options.detached && unrefEnabled ) {

                    resolve({childProcess: proc});

                // Handle exit
                } else {

                    let cache = {};

                    ChildProcessUtils._setupStreamReader({
                        stream: proc.stdout,
                        options: stdout,
                        handleError,
                        cache,
                        cacheKey: 'stdout'
                    });

                    ChildProcessUtils._setupStreamReader({
                        stream: proc.stderr,
                        options: stderr,
                        handleError,
                        cache,
                        cacheKey: 'stderr'
                    });

                    proc.on('close', retval => {
                        if (retval === 0) {
                            resolve({childProcess: proc, status: retval, stdout: cache.stdout, stderr: cache.stderr});
                        } else {
                            reject({childProcess: proc, status: retval, stdout: cache.stdout, stderr: cache.stderr});
                        }
                    });

                    // Handle error
                    proc.on('error', err => {
                        err.childProcess = proc;
                        reject( err );
                    });

                }

                if ( disconnectEnabled && proc.connected ) {
                    proc.disconnect();
                }

                if ( unrefEnabled ) {
                    proc.unref();
                }

            }, err => {
                err.childProcess = proc;
                reject(err );
            });

        });

        promise.CHILD = proc;

        return promise;
    }

    /**
     *
     * @param options { boolean | Function | {[enabled]: boolean, [onData]: function, [encoding]: string} }
     * @returns { {[enabled]: boolean, [onData]: function, [encoding]: string} }
     * @private
     */
    static _parseStreamOptions (options) {

        if (_.isBoolean(options)) {
            options = {enabled: options};
        } else if (_.isFunction(options)) {
            options = {
                enabled: true,
                onData: options
            };
        } else if (_.isObject(options)) {
            options = _.cloneDeep(options);
        } else {
            throw new TypeError(`stream options was not an object nor boolean: '${options}'`);
        }

        if ( !_.has(options, 'encoding') ) {
            options.encoding = 'utf8';
        }

        if (!_.isFunction(options.onData)) {
            delete options.onData;
        }

        if ( options.enabled === undefined ) {
            options.enabled = !!(options.onData);
        }

        return options;

    }

    /**
     *
     * @param      stream { stream.Readable }
     * @param     options { {[enabled]: boolean, [onData]: function, [encoding]: string} }
     * @param handleError { Function }
     * @param       cache { Object }
     * @param    cacheKey { string }
     */
    static _setupStreamReader ({stream, options, handleError, cache, cacheKey }) {

        cache[cacheKey] = undefined;

        if (options.enabled) {

            if (options.encoding !== undefined) {
                stream.setEncoding(options.encoding);
            }

            if (options.onData) {

                stream.on('data', data => {
                    LogicUtils.tryCatch( () => options.onData(data), handleError);
                });

            } else {

                cache[cacheKey] = '';

                stream.on('data', data => {
                    cache[cacheKey] += data;
                });

            }

        }

    }

}

// Exports
module.exports = ChildProcessUtils;
