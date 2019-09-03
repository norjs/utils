
const LogicUtils = require('./LogicUtils.js');

/**
 *
 */
class FileUtils {

    /**
     * Watch changes to the source directory recursively and call a callback when it happens.
     *
     * *Note!* Recursive is only available on MacOS and Windows. See more at
     *         https://nodejs.org/api/fs.html#fs_fs_watch_filename_options_listener
     *
     * @param fs {*} The filesystem module
     * @param sourceDir {string} The directory which to watch for changes.
     * @param callback {Function} A function which will be called when changes are detected.
     * @return {Function} A function which will stop the watcher if called.
     */
    static watchDirectory (fs, sourceDir, callback) {

        let watcher = fs.watch(sourceDir, {recursive: true}, () => {
            LogicUtils.tryCatch(callback, err => {
                console.error('Exception: ', err);
            });
        });

        return () => {

            if (watcher) {

                LogicUtils.tryCatch(() => watcher.close(), err => {
                    console.error('Exception: ', err);
                });

                watcher = undefined;

            }

        };

    }

}

// Exports
module.exports = FileUtils;
