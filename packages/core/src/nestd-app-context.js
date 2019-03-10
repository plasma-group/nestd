"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const iterare_1 = require("iterare");
const services_1 = require("./services");
const utils_1 = require("./utils");
const module_token_factory_1 = require("./injector/module-token-factory");
const container_scanner_1 = require("./injector/container-scanner");
const exceptions_1 = require("./errors/exceptions");
class NestdAppContext {
    constructor(container, scope, contextModule) {
        this.container = container;
        this.scope = scope;
        this.contextModule = contextModule;
        this.moduleTokenFactory = new module_token_factory_1.ModuleTokenFactory();
        this.containerScanner = new container_scanner_1.ContainerScanner(container);
    }
    selectContextModule() {
        const modules = this.container.getModules().values();
        this.contextModule = modules.next().value;
    }
    select(module) {
        const modules = this.container.getModules();
        const moduleMetatype = this.contextModule.metatype;
        const scope = this.scope.concat(moduleMetatype);
        const token = this.moduleTokenFactory.create(module, scope);
        const selectedModule = modules.get(token);
        if (!selectedModule) {
            throw new exceptions_1.UnknownModuleException();
        }
        return new NestdAppContext(this.container, scope, selectedModule);
    }
    get(typeOrToken, options = { strict: false }) {
        if (!(options && options.strict)) {
            return this.find(typeOrToken);
        }
        return this.findInstanceByPrototypeOrToken(typeOrToken, this.contextModule);
    }
    async init() {
        await this.callInitHook();
        await this.callBootstrapHook();
        return this;
    }
    async stop() {
        await this.callDestroyHook();
    }
    useLogger(logger) {
        services_1.Logger.overrideLogger(logger);
    }
    async callInitHook() {
        const modulesContainer = this.container.getModules();
        for (const module of [...modulesContainer.values()].reverse()) {
            await this.callModuleInitHook(module);
        }
    }
    async callModuleInitHook(module) {
        const providers = [...module.providers];
        const [_, { instance: moduleClassInstance }] = providers.shift();
        await Promise.all(iterare_1.default(providers)
            .map(([_, { instance }]) => instance)
            .filter((instance) => !utils_1.isNil(instance))
            .filter(this.hasOnModuleInitHook)
            .map(async (instance) => instance.onModuleInit()));
        if (moduleClassInstance && this.hasOnModuleInitHook(moduleClassInstance)) {
            await moduleClassInstance.onModuleInit();
        }
    }
    hasOnModuleInitHook(instance) {
        return !utils_1.isUndefined(instance.onModuleInit);
    }
    async callDestroyHook() {
        const modulesContainer = this.container.getModules();
        for (const module of modulesContainer.values()) {
            await this.callModuleDestroyHook(module);
        }
    }
    async callModuleDestroyHook(module) {
        const providers = [...module.providers];
        const [_, { instance: moduleClassInstance }] = providers.shift();
        await Promise.all(iterare_1.default(providers)
            .map(([key, { instance }]) => instance)
            .filter((instance) => !utils_1.isNil(instance))
            .filter(this.hasOnModuleDestroyHook)
            .map(async (instance) => instance.onModuleDestroy()));
        if (moduleClassInstance &&
            this.hasOnModuleDestroyHook(moduleClassInstance)) {
            await moduleClassInstance.onModuleDestroy();
        }
    }
    hasOnModuleDestroyHook(instance) {
        return !utils_1.isUndefined(instance.onModuleDestroy);
    }
    async callBootstrapHook() {
        const modulesContainer = this.container.getModules();
        for (const module of [...modulesContainer.values()].reverse()) {
            await this.callModuleBootstrapHook(module);
        }
    }
    async callModuleBootstrapHook(module) {
        const providers = [...module.providers];
        const [_, { instance: moduleClassInstance }] = providers.shift();
        await Promise.all(iterare_1.default(providers)
            .map(([key, { instance }]) => instance)
            .filter((instance) => !utils_1.isNil(instance))
            .filter(this.hasOnAppBotstrapHook)
            .map(async (instance) => instance.onAppBootstrap()));
        if (moduleClassInstance && this.hasOnAppBotstrapHook(moduleClassInstance)) {
            await moduleClassInstance.onAppBootstrap();
        }
    }
    hasOnAppBotstrapHook(instance) {
        return !utils_1.isUndefined(instance.onAppBootstrap);
    }
    find(typeOrToken) {
        return this.containerScanner.find(typeOrToken);
    }
    findInstanceByPrototypeOrToken(metatypeOrToken, contextModule) {
        return this.containerScanner.findInstanceByPrototypeOrToken(metatypeOrToken, contextModule);
    }
}
exports.NestdAppContext = NestdAppContext;
