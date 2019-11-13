import _ from 'lodash';
import LogUtils from "./LogUtils";

/**
 *
 * @enum {string}
 * @readonly
 */
export const AnsiColorCode = {

    RESET       : "\x1b[0m",
    BRIGHT      : "\x1b[1m",
    DIM         : "\x1b[2m",
    UNDERSCORE  : "\x1b[4m",
    BLINK       : "\x1b[5m",
    REVERSE     : "\x1b[7m",
    HIDDEN      : "\x1b[8m",

    BLACK       : "\x1b[30m",
    RED         : "\x1b[31m",
    GREEN       : "\x1b[32m",
    YELLOW      : "\x1b[33m",
    BLUE        : "\x1b[34m",
    MAGENTA     : "\x1b[35m",
    CYAN        : "\x1b[36m",
    WHITE       : "\x1b[37m",

    BG_BLACK    : "\x1b[40m",
    BG_RED      : "\x1b[41m",
    BG_GREEN    : "\x1b[42m",
    BG_YELLOW   : "\x1b[43m",
    BG_BLUE     : "\x1b[44m",
    BG_MAGENTA  : "\x1b[45m",
    BG_CYAN     : "\x1b[46m",
    BG_WHITE    : "\x1b[47m"

};

/**
 *
 */
export class ColorUtils {

    /**
     * Removes ANSI color escapes from a string.
     *
     * @param value {string}
     * @returns {string}
     */
    static stripColors (value) {

        if (!_.isString(value)) {
            throw new TypeError(`ColorUtils.stripColors(): value not a string: "${LogUtils.getAsString(value)}"`);
        }

        return value.replace(/\x1b\[[0-9]+m/g, "");

    }

}

// Exports
export default ColorUtils;
