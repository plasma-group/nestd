"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("../constants");
const module_1 = require("./module");
const compiler_1 = require("./compiler");
const modules_container_1 = require("./modules-container");
const app_ref_host_1 = require("../helpers/app-ref-host");
const reflector_service_1 = require("../services/reflector.service");
const exceptions_1 = require("../errors/exceptions");
class NestdContainer {
    constructor(config = void 0) {
        this.config = config;
        this.globalModules = new Set();
        this.moduleCompiler = new compiler_1.ModuleCompiler();
        this.dynamicModulesMetadata = new Map();
        this.reflector = new reflector_service_1.Reflector();
        this.modules = new modules_container_1.ModulesContainer();
        this.appRefHost = new app_ref_host_1.AppRefHost();
    }
    get appConfig() {
        return this.config;
    }
    setAppRef(appRef) {
        this.appRef = appRef;
        if (!this.appRefHost) {
            return;
        }
        this.appRefHost.appRef = appRef;
    }
    getAppRef() {
        return this.appRef;
    }
    async addModule(metatype, scope) {
        if (!metatype) {
            throw new exceptions_1.InvalidModuleException(scope);
        }
        const { type, dynamicMetadata, token } = await this.moduleCompiler.compile(metatype, scope);
        if (this.modules.has(token)) {
            return;
        }
        const module = new module_1.Module(type, scope, this);
        this.modules.set(token, module);
        this.addDynamicMetadata(token, dynamicMetadata, [].concat(scope, type));
        if (this.isGlobalModule(type)) {
            this.addGlobalModule(module);
        }
    }
    addDynamicMetadata(token, dynamicModuleMetadata, scope) {
        if (!dynamicModuleMetadata) {
            return undefined;
        }
        this.dynamicModulesMetadata.set(token, dynamicModuleMetadata);
        const { imports } = dynamicModuleMetadata;
        this.addDynamicModules(imports, scope);
    }
    addDynamicModules(modules, scope) {
        if (!modules) {
            return undefined;
        }
        for (const module of modules) {
            this.addModule(module, scope);
        }
    }
    isGlobalModule(metatype) {
        return !!Reflect.getMetadata(constants_1.GLOBAL_MODULE_METADATA, metatype);
    }
    addGlobalModule(module) {
        this.globalModules.add(module);
    }
    getModules() {
        return this.modules;
    }
    async addRelatedModule(relatedModule, token) {
        if (!this.modules.has(token)) {
            return;
        }
        const module = this.modules.get(token);
        const parent = module.metatype;
        const scope = [].concat(module.scope, parent);
        const { token: relatedModuleToken } = await this.moduleCompiler.compile(relatedModule, scope);
        const related = this.modules.get(relatedModuleToken);
        module.addRelatedModule(related);
    }
    addProvider(provider, token) {
        if (!provider) {
            throw new exceptions_1.CircularDependencyException();
        }
        if (!this.modules.has(token)) {
            throw new exceptions_1.UnknownModuleException();
        }
        const module = this.modules.get(token);
        return module.addProvider(provider);
    }
    addInjectable(injectable, token) {
        if (!this.modules.has(token)) {
            throw new exceptions_1.UnknownModuleException();
        }
        const module = this.modules.get(token);
        module.addInjectable(injectable);
    }
    addExportedComponent(exported, token) {
        if (!this.modules.has(token)) {
            throw new exceptions_1.UnknownModuleException();
        }
        const module = this.modules.get(token);
        module.addExportedProvider(exported);
    }
    bindGlobalScope() {
        for (const [_, module] of this.modules) {
            this.bindGlobalsToRelatedModules(module);
        }
    }
    bindGlobalsToRelatedModules(module) {
        for (const globalModule of this.globalModules) {
            this.bindGlobalModuleToModule(module, globalModule);
        }
    }
    bindGlobalModuleToModule(module, globalModule) {
        if (module === globalModule) {
            return;
        }
        module.addRelatedModule(globalModule);
    }
    getDynamicMetadataByToken(token, metadataKey) {
        const metadata = this.dynamicModulesMetadata.get(token);
        if (metadata && metadata[metadataKey]) {
            return metadata[metadataKey];
        }
        return [];
    }
    getReflector() {
        return this.reflector;
    }
    getAppRefHost() {
        return this.appRefHost;
    }
    getModulesContainer() {
        if (!this.modulesContainer) {
            this.modulesContainer = this.getModules();
        }
        return this.modulesContainer;
    }
}
exports.NestdContainer = NestdContainer;
