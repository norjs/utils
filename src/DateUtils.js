import _ from 'lodash';
import LogUtils from "./LogUtils";

/**
 *
 */
export class DateUtils {

    /**
     *
     * @param value {Date|number|string}
     * @returns {string}
     */
    static parseToString (value) {

        if ( value && value instanceof Date ) {
            return value.toISOString();
        }

        if ( _.isNumber(value) ) {
            return new Date(value).toISOString();
        }

        if ( _.isString(value) ) {
            return value;
        }

        throw new TypeError(`DateUtils.parseToString(): Could not parse to date string: ${LogUtils.getAsString(value)}`);

    }

}

// Exports
export default DateUtils;
