"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../../utils");
const constants_1 = require("../../constants");
function Optional() {
    return (target, key, index) => {
        if (!utils_1.isUndefined(index)) {
            const args = Reflect.getMetadata(constants_1.OPTIONAL_DEPS_METADATA, target) || [];
            Reflect.defineMetadata(constants_1.OPTIONAL_DEPS_METADATA, [...args, index], target);
            return;
        }
        const properties = Reflect.getMetadata(constants_1.OPTIONAL_PROPERTY_DEPS_METADATA, target.constructor) || [];
        Reflect.defineMetadata(constants_1.OPTIONAL_PROPERTY_DEPS_METADATA, [...properties, key], target.constructor);
    };
}
exports.Optional = Optional;
