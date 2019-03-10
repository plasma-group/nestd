"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("../../constants");
const validateKeys = (keys) => {
    for (const key of keys) {
        if (!Object.values(constants_1.METADATA).includes(key)) {
            throw new Error(`Invalid property '${key}' in @Module() decorator.`);
        }
    }
};
function Module(metadata) {
    const propsKeys = Object.keys(metadata);
    validateKeys(propsKeys);
    return (target) => {
        for (const property in metadata) {
            if (metadata.hasOwnProperty(property)) {
                Reflect.defineMetadata(property, metadata[property], target);
            }
        }
    };
}
exports.Module = Module;
