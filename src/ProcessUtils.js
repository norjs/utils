import LogicUtils from './LogicUtils.js';
import PATH from 'path';

/**
 *
 */
export class ProcessUtils {

    /**
     *
     * @param callback {Function|function}
     */
    static setupDestroy (callback) {

        let destroyed = false;

        const closeProcess = () => LogicUtils.tryCatch(
            () => {
                if (destroyed) return;
                destroyed = true;

                callback();
            },
            err => {
                console.error('Exception: ' + err)
            }
        );

        process.on('exit', closeProcess);
        process.on('SIGTERM', closeProcess);
        process.on('SIGINT', closeProcess);
        process.on('SIGUSR1', closeProcess);
        process.on('SIGUSR2', closeProcess);
        process.on('uncaughtException', closeProcess);

    }

    /**
     * Require a file relative to current process cwd
     *
     * @param name {string}
     * @return {any}
     */
    static requireFile (name) {
        return require(PATH.resolve(process.cwd(), name));
    }

    /**
     * Prints error to the error log and exits process with error code 1
     *
     * @param err {*}
     */
    static handleError (err) {

        console.error(`Exception: "${err}"`);

        if (err.stack) {
            console.error(err.stack);
        }

        process.exit(1);

    }

}

// Exports
export default ProcessUtils;
