
const _ = require('lodash');

const CHILD_PROCESS = require('child_process');

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
     * @param stdio {Array}
     * @param detached {boolean}
     * @param uid {number}
     * @param gid {number}
     * @param shell {boolean|string}
     * @param stdoutEnabled {boolean}
     * @param stderrEnabled {boolean}
     * @param unrefEnabled {boolean}
     * @param disconnectEnabled {boolean}
     * @return {Promise}
     */
    execute (
        command,
        args,
        {
            cwd = process.cwd()
            , env = {}
            , argv0 = command
            , stdio = ["ignore", "pipe", "pipe"]
            , detached = true
            , uid = undefined
            , gid = undefined
            , shell = false

            , stdoutEnabled = undefined
            , stderrEnabled = undefined
            , unrefEnabled = undefined
            , disconnectEnabled = undefined

        } = {}
    ) {

        if (!stdio) {

            stdio = ["ignore", "pipe", "pipe"];
            stdoutEnabled = true;
            stderrEnabled = true;

        } else {

            if (!stdoutEnabled && stdio && stdio.length >= 2 && stdio[1] === "pipe") {
                stdoutEnabled = true;
            }

            if (!stderrEnabled && stdio && stdio.length >= 3 && stdio[2] === "pipe") {
                stderrEnabled = true;
            }

        }

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

        // Run the process
        const proc = CHILD_PROCESS.spawn(command, args, options);

        const promise = new Promise( (resolve, reject) => {
            LogicUtils.tryCatch( () => {

                // If command started detached and unref enabled; not waiting for it to finish.
                if ( options.detached && unrefEnabled ) {

                    resolve({});

                // Handle exit
                } else {

                    let stdout = '';
                    let stderr = '';

                    if (stdoutEnabled) {
                        proc.stdout.setEncoding('utf8');
                        proc.stdout.on('data', data => {
                            stdout += data;
                        });
                    }

                    if (stderrEnabled) {
                        proc.stderr.setEncoding('utf8');
                        proc.stderr.on('data', data => {
                            stderr += data;
                        });
                    }

                    proc.on('close', retval => {
                        if (retval === 0) {
                            resolve({"retval": retval, "stdout": stdout, "stderr": stderr});
                        } else {
                            reject({"retval": retval, "stdout": stdout, "stderr": stderr});
                        }
                    });

                    // Handle error
                    proc.on('error', err => {
                        reject(err);
                    });

                }

                if ( disconnectEnabled && proc.connected ) {
                    proc.disconnect();
                }

                if ( unrefEnabled ) {
                    proc.unref();
                }

            }, err => {
                reject(err);
            });

        });

        promise.CHILD = proc;

        return promise;
    }

}

// Exports
module.exports = ChildProcessUtils;
