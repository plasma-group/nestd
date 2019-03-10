"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
const getInstanceName = (instance) => {
    return instance && instance.name;
};
const getDependencyName = (dependency) => {
    return (
    // use class name
    getInstanceName(dependency) ||
        // use injection token (symbol)
        (utils_1.isSymbol(dependency) && dependency.toString()) ||
        // use string directly
        dependency ||
        // otherwise
        '+');
};
const getModuleName = (module) => {
    return (module && getInstanceName(module.metatype)) || 'current';
};
exports.UNKNOWN_DEPENDENCIES_MESSAGE = (type, unknownDependenciesContext, module) => {
    const { index, dependencies, key } = unknownDependenciesContext;
    let message = `Nestd can't reslve dependencies of the ${type.toString()}`;
    if (utils_1.isNil(index)) {
        message += `. Please make sure that the "${key.toString()}" property is available in the current context.`;
        return message;
    }
    const dependenciesName = (dependencies || []).map(getDependencyName);
    dependenciesName[index] = '?';
    message += ` (`;
    message += dependenciesName.join(', ');
    message += `). Please make sure that the argument at index [${index}] is available in the ${getModuleName(module)} context.`;
    return message;
};
exports.UNKNOWN_EXPORT_MESSAGE = (text, module) => `Nestd cannot export a component/module that is not a part of the currently processed module (${module}). Please verify whether each exported unit is available in this particular context.`;
exports.INVALID_MODULE_MESSAGE = (text, scope) => `Nestd cannot create the module instance. Often, this is because of a circular dependency between modules. Use forwardRef() to avoid it. (Read more https://docs.nestjs.com/fundamentals/circular-dependency.) Scope [${scope}]`;
exports.INVALID_CLASS_MESSAGE = (text, value) => `ModuleRef cannot instantiate class (${value} is not constructable).`;
exports.UNHANDLED_RUNTIME_EXCEPTION = `Unhandled Runtime Exception.`;
