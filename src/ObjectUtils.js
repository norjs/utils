import _ from "lodash";

/**
 *
 */
export class ObjectUtils {

    /**
     * Converts an object to different format by remapping it's property names using two compatible enum objects.
     *
     * @param value {Object}
     * @param fromEnum {Object}
     * @param toEnum {Object}
     * @returns {Object}
     */
    static remapObjectKeys (value, fromEnum, toEnum) {

        return _.reduce(
            Object.keys(fromEnum),
            (obj, id) => {
                const dbKey = fromEnum[id];

                if (this.has(toEnum, id)) {

                    const propertyKey = toEnum[id];

                    if ( this.has(value, dbKey) ) {
                        obj[propertyKey] = value[dbKey];
                    }

                } else {

                    nrLog.warn(`ObjectUtils.remapObjectKeys(value, fromEnum, toEnum): Warning! toEnum did not have property ${id} defined.`);

                }

                return obj;
            },
            {}
        );

    }

    /**
     * Safe check for property existance.
     *
     * @param obj
     * @param name
     */
    static has (obj, name) {
        return Object.prototype.hasOwnProperty.call(obj, name);
    }

}

// Exports
export default ObjectUtils;
