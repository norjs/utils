
/**
 *
 */
class LogUtils {

    /**
     *
     * @returns {string}
     */
    static getTime () {
        return (new Date()).toISOString();
    }

    /**
     *
     * @param value {*}
     * @returns {string}
     */
    static getLine (...value) {
        return `[${LogUtils.getTime()}] ` + value.join(' ');
    }

}

// Exports
module.exports = LogUtils;
