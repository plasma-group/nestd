"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const hash = require("object-hash");
const fast_safe_stringify_1 = require("fast-safe-stringify");
const constants_1 = require("../constants");
class ModuleTokenFactory {
    create(metatype, scope, dynamicModuleMetadata) {
        const reflectedScope = this.reflectScope(metatype);
        const isSingleScoped = reflectedScope === true;
        const opaqueToken = {
            module: this.getModuleName(metatype),
            dynamic: this.getDynamicMetadataToken(dynamicModuleMetadata),
            scope: isSingleScoped ? this.getScopeStack(scope) : reflectedScope,
        };
        return hash(opaqueToken);
    }
    getDynamicMetadataToken(dynamicModuleMetadata) {
        return dynamicModuleMetadata ? fast_safe_stringify_1.default(dynamicModuleMetadata) : '';
    }
    getModuleName(metatype) {
        return metatype.name;
    }
    getScopeStack(scope) {
        const reversedScope = scope.reverse();
        const firstGlobalIndex = reversedScope.findIndex((s) => this.reflectScope(s) === 'global');
        scope.reverse();
        const stack = firstGlobalIndex >= 0
            ? scope.slice(scope.length - firstGlobalIndex - 1)
            : scope;
        return stack.map((module) => module.name);
    }
    reflectScope(metatype) {
        const scope = Reflect.getMetadata(constants_1.SHARED_MODULE_METADATA, metatype);
        return scope ? scope : 'global';
    }
}
exports.ModuleTokenFactory = ModuleTokenFactory;
