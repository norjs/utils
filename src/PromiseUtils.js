
/**
 *
 */
class PromiseUtils {

    /**
     *
     * @param value {Promise|*}
     * @returns {Promise}
     * @private
     */
    static when (value) {

        if (value && value.then) {
            return value;
        }

        return new Promise(resolve => resolve(value));
    }

}

// Exports
module.exports = PromiseUtils;
