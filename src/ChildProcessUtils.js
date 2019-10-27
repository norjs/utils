import _ from 'lodash';
import CHILD_PROCESS from 'child_process';
import LogicUtils from './LogicUtils.js';

/**
 *
 */
export class NorChildProcess {

    /**
     *
     * @param childProcess {ChildProcessWithoutNullStreams}
     */
    constructor (childProcess) {

        /**
         * @member {ChildProcessWithoutNullStreams}
         */
        this._childProcess = childProcess;

        /**
         * @member {number}
         */
        this._pid = childProcess ? childProcess.pid : undefined;

        /**
         * This is a promise for `this._result`.
         *
         * @member {Promise|undefined}
         * @private
         */
        this._resultPromise = undefined;

        /**
         *
         * @member {Object|undefined}
         * @private
         */
        this._result = undefined;

    }

    /**
     *
     * @returns {ChildProcessWithoutNullStreams}
     * @constructor
     */
    get childProcess () {
        return this._childProcess;
    }

    /**
     *
     * @returns {number}
     */
    get pid () {
        return this._pid;
    }

    /**
     *
     * @returns {Promise|undefined}
     */
    get resultPromise () {

        if (this._result) {
            if (this._result.status === 0) {
                return Promise.resolve(this._result);
            } else {
                return Promise.reject(this._result);
            }
        }

        return this._resultPromise;
    }

    /**
     *
     * @returns {Object|undefined}
     */
    get result () {
        return this._result;
    }

    /**
     * Setup a promise to wait for process end, and to set `this.result`
     *
     * @param promise {Promise}
     */
    setResultPromise (promise) {

        this._resultPromise = promise.then(result => {
            this._result = result;
            return result;
        }, err => {
            this._result = err;
            return Promise.reject(err);
        }).finally(() => {
            this._resultPromise = undefined;
        });

    }

}

/**
 *
 */
class ChildProcessUtils {

    /**
     *
     * @returns {typeof NorChildProcess}
     */
    static get ChildProcess () {
        return NorChildProcess;
    }

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
     * @return {NorChildProcess}
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

        const child = new NorChildProcess(proc);

        if ( options.detached && unrefEnabled ) {

            if ( disconnectEnabled && proc.connected ) {
                proc.disconnect();
            }

            if ( unrefEnabled ) {
                proc.unref();
            }

        } else {

            /**
             *
             * @type {Promise}
             */
            child.setResultPromise(
                ChildProcessUtils.waitResults(proc, {stdout, stderr}).finally( () => {

                    if ( disconnectEnabled && proc.connected ) {
                        proc.disconnect();
                    }

                    if ( unrefEnabled ) {
                        proc.unref();
                    }

                })
            );

        }

        return child;

    }

    /**
     *
     * @param proc {ChildProcessWithoutNullStreams}
     * @param stdout { {[enabled]: boolean, [onData]: function, [encoding]: string} }
     * @param stderr { {[enabled]: boolean, [onData]: function, [encoding]: string} }
     * @return {Promise.<{status: number, stdout: string, stderr: string, error: *}>}
     */
    static waitResults (proc, {stdout, stderr}) {
        return new Promise( (resolve, reject) => {

            const handleError = err => {
                reject( err );
            };

            LogicUtils.tryCatch( () => {

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
                        resolve({status: retval, stdout: cache.stdout, stderr: cache.stderr});
                    } else {
                        reject({status: retval, stdout: cache.stdout, stderr: cache.stderr});
                    }
                });

                // Handle error
                proc.on('error', handleError);

            }, handleError);

        });
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

export default ChildProcessUtils;
