
/**
 *
 */
export class PromiseUtils {

    /**
     * Returns true if value is a promise.
     *
     * @param value {*}
     * @returns {boolean}
     */
    static isPromise (value) {
        return !!(value && value.then);
    }

    /**
     *
     * @param value {Promise|*}
     * @returns {Promise}
     */
    static when (value) {

        if (PromiseUtils.isPromise(value)) {
            return value;
        }

        return Promise.resolve(value);
    }

}

// Exports
export default PromiseUtils;
