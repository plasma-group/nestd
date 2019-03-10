"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
const module_ref_1 = require("./module-ref");
const modules_container_1 = require("./modules-container");
const tokens_1 = require("./tokens");
const exceptions_1 = require("../errors/exceptions");
const reflector_service_1 = require("../services/reflector.service");
const app_ref_host_1 = require("../helpers/app-ref-host");
class Module {
    constructor(_metatype, _scope, container) {
        this._metatype = _metatype;
        this._scope = _scope;
        this.container = container;
        this._relatedModules = new Set();
        this._providers = new Map();
        this._injectables = new Map();
        this._exports = new Set();
        this.addCoreInjectables(container);
        this._id = utils_1.randomString();
    }
    get id() {
        return this._id;
    }
    get scope() {
        return this._scope;
    }
    get relatedModules() {
        return this._relatedModules;
    }
    get providers() {
        return this._providers;
    }
    get exports() {
        return this._exports;
    }
    get instance() {
        if (!this._providers.has(this._metatype.name)) {
            throw new exceptions_1.RuntimeException();
        }
        const module = this._providers.get(this._metatype.name);
        return module.instance;
    }
    get metatype() {
        return this._metatype;
    }
    addCoreInjectables(container) {
        this.addModuleAsProvider();
        this.addModuleRef();
        this.addReflector(container.getReflector());
        this.addAppRef(container.getAppRef());
        this.addModulesContainer(container.getModulesContainer());
        this.addAppRefHost(container.getAppRefHost());
    }
    addModuleRef() {
        const moduleRef = this.createModuleRefMetatype();
        this._providers.set(module_ref_1.ModuleRef.name, {
            name: module_ref_1.ModuleRef.name,
            metatype: module_ref_1.ModuleRef,
            isResolved: true,
            instance: new moduleRef(),
        });
    }
    addModuleAsProvider() {
        this._providers.set(this._metatype.name, {
            name: this._metatype.name,
            metatype: this._metatype,
            isResolved: false,
            instance: null,
        });
    }
    addReflector(reflector) {
        this._providers.set(reflector_service_1.Reflector.name, {
            name: reflector_service_1.Reflector.name,
            metatype: reflector_service_1.Reflector,
            isResolved: true,
            instance: reflector,
        });
    }
    addAppRef(appRef) {
        this._providers.set(tokens_1.APP_REF, {
            name: tokens_1.APP_REF,
            metatype: {},
            isResolved: true,
            instance: appRef || {},
        });
    }
    addModulesContainer(modulesContainer) {
        this._providers.set(modules_container_1.ModulesContainer.name, {
            name: modules_container_1.ModulesContainer.name,
            metatype: modules_container_1.ModulesContainer,
            isResolved: true,
            instance: modulesContainer,
        });
    }
    addAppRefHost(appRefHost) {
        this._providers.set(app_ref_host_1.AppRefHost.name, {
            name: app_ref_host_1.AppRefHost.name,
            metatype: app_ref_host_1.AppRefHost,
            isResolved: true,
            instance: appRefHost,
        });
    }
    addInjectable(injectable) {
        this._injectables.set(injectable.name, {
            name: injectable.name,
            metatype: injectable,
            isResolved: false,
            instance: null,
        });
    }
    addProvider(provider) {
        if (this.isCustomProvider(provider)) {
            return this.addCustomProvider(provider, this._providers);
        }
        this._providers.set(provider.name, {
            name: provider.name,
            metatype: provider,
            isResolved: false,
            instance: null,
        });
        return provider.name;
    }
    isCustomProvider(provider) {
        return !utils_1.isNil(provider.provide);
    }
    addCustomProvider(provider, collection) {
        const { provide } = provider;
        const name = utils_1.isFunction(provide) ? provide.name : provide;
        const providerWithName = Object.assign({}, provider, { name });
        if (this.isCustomClass(providerWithName)) {
            this.addCustomClass(providerWithName, collection);
        }
        else if (this.isCustomFactory(providerWithName)) {
            this.addCustomFactory(providerWithName, collection);
        }
        else if (this.isCustomValue(providerWithName)) {
            this.addCustomValue(providerWithName, collection);
        }
        return name;
    }
    isCustomClass(provider) {
        return !utils_1.isUndefined(provider.useClass);
    }
    isCustomFactory(provider) {
        return !utils_1.isUndefined(provider.useFactory);
    }
    isCustomValue(provider) {
        return !utils_1.isUndefined(provider.useValue);
    }
    isDynamicModule(exported) {
        return exported && exported.module;
    }
    addCustomClass(provider, collection) {
        const { name, useClass } = provider;
        collection.set(name, {
            name,
            metatype: useClass,
            isResolved: false,
            instance: null,
        });
    }
    addCustomFactory(provider, collection) {
        const { name, useFactory: factory, inject } = provider;
        collection.set(name, {
            name,
            metatype: factory,
            instance: null,
            isResolved: false,
            inject: inject || [],
            isNotMetatype: true,
        });
    }
    addCustomValue(provider, collection) {
        const { name, useValue: value } = provider;
        collection.set(name, {
            name,
            metatype: null,
            instance: value,
            isResolved: true,
            isNotMetatype: true,
            async: value instanceof Promise,
        });
    }
    addExportedProvider(exported) {
        const addExportedUnit = (token) => {
            this._exports.add(this.validateExportedProvider(token));
        };
        if (this.isCustomProvider(exported)) {
            return this.addCustomExportedProvider(exported);
        }
        else if (utils_1.isString(exported) || utils_1.isSymbol(exported)) {
            return addExportedUnit(exported);
        }
        else if (this.isDynamicModule(exported)) {
            const { module } = exported;
            return addExportedUnit(module.name);
        }
        addExportedUnit(exported.name);
    }
    addCustomExportedProvider(exported) {
        const provide = exported.provide;
        if (utils_1.isString(provide) || utils_1.isSymbol(provide)) {
            this._exports.add(this.validateExportedProvider(provide));
            return;
        }
        this._exports.add(this.validateExportedProvider(provide.name));
    }
    validateExportedProvider(token) {
        if (this._providers.has(token)) {
            return token;
        }
        const imported = [...this._relatedModules.values()];
        const importedRefNames = imported
            .filter((item) => item)
            .map(({ metatype }) => metatype)
            .filter((metatype) => metatype)
            .map(({ name }) => name);
        if (!importedRefNames.includes(token)) {
            const { name } = this.metatype;
            throw new exceptions_1.UnknownExportException(name);
        }
        return token;
    }
    addRelatedModule(relatedModule) {
        this._relatedModules.add(relatedModule);
    }
    createModuleRefMetatype() {
        const self = this;
        return class extends module_ref_1.ModuleRef {
            constructor() {
                super(self.container);
            }
            get(typeOrToken, options = { strict: true }) {
                if (!(options && options.strict)) {
                    return this.find(typeOrToken);
                }
                return this.findInstanceByPrototypeOrToken(typeOrToken, self);
            }
            async create(type) {
                if (!(type && utils_1.isFunction(type) && type.prototype)) {
                    throw new exceptions_1.InvalidClassException(type);
                }
                return this.instantiateClass(type, self);
            }
        };
    }
}
exports.Module = Module;
