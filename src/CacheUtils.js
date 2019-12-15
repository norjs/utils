import NrCache from "./NrCache";

/**
 *
 */
export class CacheUtils {

    /**
     *
     * @returns {NrCache.<T>}
     * @template T
     */
    static createCache () {
        return new NrCache();
    }

}

// Exports
export default CacheUtils;
