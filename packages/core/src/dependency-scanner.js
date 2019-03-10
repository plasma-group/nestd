"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("./constants");
const utils_1 = require("./utils");
const app_config_1 = require("./app-config");
const exceptions_1 = require("./errors/exceptions");
class DependencyScanner {
    constructor(container, metadataScanner, appConfig = new app_config_1.AppConfig()) {
        this.container = container;
        this.metadataScanner = metadataScanner;
        this.appConfig = appConfig;
        this.applicationProvidersApplyMap = [];
    }
    async scan(module) {
        await this.scanForModules(module);
        await this.scanModulesForDependencies();
        this.container.bindGlobalScope();
    }
    async scanForModules(module, scope = [], ctxRegistry = []) {
        await this.storeModule(module, scope);
        ctxRegistry.push(module);
        if (this.isForwardReference(module)) {
            module = module.forwardRef();
        }
        const modules = !this.isDynamicModule(module)
            ? this.reflectMetadata(module, constants_1.METADATA.MODULES)
            : [
                ...this.reflectMetadata(module.module, constants_1.METADATA.MODULES),
                ...(module.imports || []),
            ];
        for (const innerModule of modules) {
            if (ctxRegistry.includes(innerModule)) {
                continue;
            }
            await this.scanForModules(innerModule, [].concat(scope, module), ctxRegistry);
        }
    }
    async storeModule(module, scope) {
        if (module && module.forwardRef) {
            return this.container.addModule(module.forwardRef(), scope);
        }
        return this.container.addModule(module, scope);
    }
    async scanModulesForDependencies() {
        const modules = this.container.getModules();
        for (const [token, { metatype }] of modules) {
            await this.reflectRelatedModules(metatype, token, metatype.name);
            this.reflectProviders(metatype, token);
            this.reflectExports(metatype, token);
        }
    }
    async reflectRelatedModules(module, token, context) {
        const modules = [
            ...this.reflectMetadata(module, constants_1.METADATA.MODULES),
            ...this.container.getDynamicMetadataByToken(token, constants_1.METADATA.MODULES),
            ...this.container.getDynamicMetadataByToken(token, constants_1.METADATA.IMPORTS),
        ];
        for (const related of modules) {
            await this.storeRelatedModule(related, token, context);
        }
    }
    async reflectProviders(module, token) {
        const providers = [
            ...this.reflectMetadata(module, constants_1.METADATA.SERVICES),
            ...this.container.getDynamicMetadataByToken(token, constants_1.METADATA.SERVICES),
        ];
        for (const provider of providers) {
            this.storeProvider(provider, token);
            this.reflectProviderMetadata(provider, token);
        }
    }
    reflectProviderMetadata(provider, token) {
        const metadata = this.reflectMetadata(provider, constants_1.PROVIDERS_METADATA);
        for (const data of metadata) {
            this.storeProvider(data, token);
        }
    }
    reflectExports(module, token) {
        const exports = [
            ...this.reflectMetadata(module, constants_1.METADATA.EXPORTS),
            ...this.container.getDynamicMetadataByToken(token, constants_1.METADATA.EXPORTS),
        ];
        for (const exported of exports) {
            this.storeExportedComponent(exported, token);
        }
    }
    reflectKeyMetadata(component, key, method) {
        let prototype = component.prototype;
        do {
            const descriptor = Reflect.getOwnPropertyDescriptor(prototype, method);
            if (!descriptor) {
                continue;
            }
            return Reflect.getMetadata(key, descriptor.value);
        } while (
        // tslint:disable-next-line:no-conditional-assignment
        (prototype = Reflect.getPrototypeOf(prototype)) &&
            prototype !== Object.prototype &&
            prototype);
        return undefined;
    }
    async storeRelatedModule(related, token, context) {
        if (utils_1.isUndefined(related)) {
            throw new exceptions_1.CircularDependencyException(context);
        }
        if (related && related.forwardRef) {
            return this.container.addRelatedModule(related.forwardRef(), token);
        }
        return this.container.addRelatedModule(related, token);
    }
    storeProvider(provider, token) {
        const isCustomProvider = provider && !utils_1.isNil(provider.provide);
        if (!isCustomProvider) {
            this.container.addProvider(provider, token);
            return;
        }
        const applyProvidersMap = this.getApplyProvidersMap();
        const providersKeys = Object.keys(applyProvidersMap);
        const type = provider.provide;
        if (!providersKeys.includes(type)) {
            this.container.addProvider(provider, token);
            return;
        }
        const providerToken = utils_1.randomString();
        this.applicationProvidersApplyMap.push({
            type,
            moduleKey: token,
            providerKey: providerToken,
        });
        this.container.addProvider(Object.assign({}, provider, { provide: providerToken }), token);
    }
    storeExportedComponent(exported, token) {
        this.container.addExportedComponent(exported, token);
    }
    reflectMetadata(metatype, metadataKey) {
        return Reflect.getMetadata(metadataKey, metatype) || [];
    }
    applyApplicationProviders() {
        const applyProvidersMap = this.getApplyProvidersMap();
        for (const { moduleKey, providerKey, type } of this
            .applicationProvidersApplyMap) {
            const modules = this.container.getModules();
            const { providers } = modules.get(moduleKey);
            const { instance } = providers.get(providerKey);
            applyProvidersMap[type](instance);
        }
    }
    getApplyProvidersMap() {
        return {};
    }
    isDynamicModule(module) {
        return module && !!module.module;
    }
    isForwardReference(module) {
        return module && !!module.forwardRef;
    }
}
exports.DependencyScanner = DependencyScanner;
