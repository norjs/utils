import _ from 'lodash';

/**
 *
 */
export class JsonUtils {

    /**
     * Circular reference safe JSON stringifier.
     *
     * @param value {*}
     * @returns {string}
     */
    static stringify (value) {

        const knownObjects = [];

        return JSON.stringify(value, (key, value) => {

            if (!_.isObject(value)) {
                return value;
            }

            const index = knownObjects.indexOf(value);
            if (index < 0) {
                knownObjects.push(value);
                return value;
            }

            // It's circular reference.
            return {'$ref': `circular#${index}`};

        });

    }

}

// Exports
export default JsonUtils;
