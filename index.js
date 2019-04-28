/**
 * @type {typeof LogicUtils}
 */
const Logic = require('./Logic');

/**
 * @type {typeof TypeUtils}
 */
const Type = require('./Type');

/**
 *
 * @type {{Type: typeof TypeUtils, LogicUtils: typeof LogicUtils, Logic: typeof LogicUtils, TypeUtils: typeof TypeUtils}}
 */
module.exports = {
    LogicUtils: Logic,
    TypeUtils: Type,
    Logic,
    Type
};
