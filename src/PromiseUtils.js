
/**
 *
 */
class PromiseUtils {

    /**
     *
     * @param value {Promise|*}
     * @returns {Promise}
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
