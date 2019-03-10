"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("../constants");
const utils_1 = require("../utils");
const exceptions_1 = require("../errors/exceptions");
class Injector {
    loadPrototypeOfInstance({ metatype, name }, collection) {
        if (!collection) {
            return;
        }
        const target = collection.get(name);
        if (target.isResolved || !utils_1.isNil(target.inject) || !metatype.prototype) {
            return;
        }
        collection.set(name, Object.assign({}, collection.get(name), { instance: Object.create(metatype.prototype) }));
    }
    async loadInstanceOfProvider(wrapper, module) {
        const providers = module.providers;
        await this.loadInstance(wrapper, providers, module);
    }
    applyDoneHook(wrapper) {
        let done;
        wrapper.done$ = new Promise((resolve, reject) => {
            done = resolve;
        });
        wrapper.isPending = true;
        return done;
    }
    async loadInstance(wrapper, collection, module) {
        if (wrapper.isPending) {
            return wrapper.done$;
        }
        const done = this.applyDoneHook(wrapper);
        const { name, inject } = wrapper;
        const targetWrapper = collection.get(name);
        if (utils_1.isUndefined(targetWrapper)) {
            throw new exceptions_1.RuntimeException();
        }
        if (targetWrapper.isResolved) {
            return;
        }
        const callback = async (instances) => {
            const properties = await this.resolveProperties(wrapper, module, inject);
            const instance = await this.instantiateClass(instances, wrapper, targetWrapper);
            this.applyProperties(instance, properties);
            done();
        };
        await this.resolveConstructorParams(wrapper, module, inject, callback);
    }
    async resolveConstructorParams(wrapper, module, inject, callback) {
        const dependencies = utils_1.isNil(inject)
            ? this.reflectConstructorParams(wrapper.metatype)
            : inject;
        const optionalDependenciesIds = utils_1.isNil(inject)
            ? this.reflectOptionalParams(wrapper.metatype)
            : [];
        let isResolved = true;
        const instances = await Promise.all(dependencies.map(async (param, index) => {
            try {
                const paramWrapper = await this.resolveSingleParam(wrapper, param, { index, dependencies }, module);
                if (!paramWrapper.isResolved && !paramWrapper.forwardRef) {
                    isResolved = false;
                }
                return paramWrapper.instance;
            }
            catch (err) {
                const isOptional = optionalDependenciesIds.includes(index);
                if (!isOptional) {
                    throw err;
                }
                return;
            }
        }));
        isResolved && (await callback(instances));
    }
    reflectConstructorParams(type) {
        const paramtypes = Reflect.getMetadata(constants_1.PARAMTYPES_METADATA, type) || [];
        const selfParams = this.reflectSelfParams(type);
        for (const { index, param } of selfParams) {
            paramtypes[index] = param;
        }
        return paramtypes;
    }
    reflectOptionalParams(type) {
        return Reflect.getMetadata(constants_1.OPTIONAL_DEPS_METADATA, type) || [];
    }
    reflectSelfParams(type) {
        return Reflect.getMetadata(constants_1.SELF_DECLARED_DEPS_METADATA, type) || [];
    }
    async resolveSingleParam(wrapper, param, dependencyContext, module) {
        if (utils_1.isUndefined(param)) {
            throw new exceptions_1.UndefinedDependencyException(wrapper.name, dependencyContext, module);
        }
        const token = this.resolveParamToken(wrapper, param);
        return this.resolveProviderInstance(module, utils_1.isFunction(token) ? token.name : token, dependencyContext, wrapper);
    }
    resolveParamToken(wrapper, param) {
        if (!param.forwardRef) {
            return param;
        }
        wrapper.forwardRef = true;
        return param.forwardRef();
    }
    async resolveProviderInstance(module, name, dependencyContext, wrapper) {
        const providers = module.providers;
        const instanceWrapper = await this.lookupProvider(providers, module, Object.assign({}, dependencyContext, { name }), wrapper);
        if (!instanceWrapper.isResolved && !instanceWrapper.forwardRef) {
            await this.loadInstanceOfProvider(instanceWrapper, module);
        }
        if (instanceWrapper.async) {
            instanceWrapper.instance = await instanceWrapper.instance;
        }
        return instanceWrapper;
    }
    async lookupProvider(providers, module, dependencyContext, wrapper) {
        const { name } = dependencyContext;
        const scanInExports = () => {
            return this.lookupProviderInExports(dependencyContext, module, wrapper);
        };
        return providers.has(name) ? providers.get(name) : scanInExports();
    }
    async lookupProviderInExports(dependencyContext, module, wrapper) {
        const instanceWrapper = await this.lookupProviderInRelatedModules(module, dependencyContext.name);
        if (utils_1.isNil(instanceWrapper)) {
            throw new exceptions_1.UnknownDependenciesException(wrapper.name, dependencyContext, module);
        }
        return instanceWrapper;
    }
    async lookupProviderInRelatedModules(module, name, moduleRegistry = []) {
        let providerRef = null;
        const relatedModules = module.relatedModules || new Set();
        const children = [...relatedModules.values()].filter((item) => item);
        for (const relatedModule of children) {
            if (moduleRegistry.includes(relatedModule.id)) {
                continue;
            }
            moduleRegistry.push(relatedModule.id);
            const { providers, exports } = relatedModule;
            if (!exports.has(name) || !providers.has(name)) {
                const instanceRef = await this.lookupProviderInRelatedModules(relatedModule, name, moduleRegistry);
                if (instanceRef) {
                    return instanceRef;
                }
                continue;
            }
            providerRef = providers.get(name);
            if (!providerRef.isResolved && !providerRef.forwardRef) {
                await this.loadInstanceOfProvider(providerRef, relatedModule);
                break;
            }
        }
        return providerRef;
    }
    async resolveProperties(wrapper, module, inject) {
        if (!utils_1.isNil(inject)) {
            return [];
        }
        const properties = this.reflectProperties(wrapper.metatype);
        const instances = await Promise.all(properties.map(async (item) => {
            try {
                const dependencyContext = {
                    key: item.key,
                    name: item.name,
                };
                const paramWrapper = await this.resolveSingleParam(wrapper, item.name, dependencyContext, module);
                return (paramWrapper && paramWrapper.instance) || undefined;
            }
            catch (err) {
                if (!item.isOptional) {
                    throw err;
                }
                return undefined;
            }
        }));
        return properties.map((item, index) => (Object.assign({}, item, { instance: instances[index] })));
    }
    reflectProperties(type) {
        const properties = Reflect.getMetadata(constants_1.PROPERTY_DEPS_METADATA, type) || [];
        const optionalKeys = Reflect.getMetadata(constants_1.OPTIONAL_PROPERTY_DEPS_METADATA, type) || [];
        return properties.map((item) => (Object.assign({}, item, { name: item.type, isOptional: optionalKeys.includes(item.key) })));
    }
    applyProperties(instance, properties) {
        if (!utils_1.isObject(instance)) {
            return undefined;
        }
        properties
            .filter((item) => !utils_1.isNil(item.instance))
            .forEach((item) => (instance[item.key] = item.instance));
    }
    async instantiateClass(instances, wrapper, targetMetatype) {
        const { metatype, inject } = wrapper;
        if (utils_1.isNil(inject)) {
            targetMetatype.instance = wrapper.forwardRef
                ? Object.assign(targetMetatype.instance, new metatype(...instances))
                : new metatype(...instances);
        }
        else {
            const factoryResult = targetMetatype.metatype(...instances);
            targetMetatype.instance = await factoryResult;
        }
        targetMetatype.isResolved = true;
        return targetMetatype.instance;
    }
}
exports.Injector = Injector;
