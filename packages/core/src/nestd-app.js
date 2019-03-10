"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("./utils");
const services_1 = require("./services");
const constants_1 = require("./constants");
const nestd_app_context_1 = require("./nestd-app-context");
const exceptions_1 = require("./errors/exceptions");
class NestdApp extends nestd_app_context_1.NestdAppContext {
    constructor(container, config, appOptions = {}) {
        super(container, [], null);
        this.config = config;
        this.appOptions = appOptions;
        this.logger = new services_1.Logger(NestdApp.name, true);
        this.isInitialized = false;
        this.selectContextModule();
    }
    async startServices() {
        for (const module of this.container.getModules().values()) {
            await this.startModuleServices(module);
        }
    }
    async startModuleServices(module) {
        for (const wrapper of module.providers.values()) {
            const provider = wrapper.instance;
            try {
                if (this.hasOnStartHook(provider) && !wrapper.isStarted) {
                    await provider.onStart();
                    wrapper.isStarted = true;
                }
            }
            catch (err) {
                throw new exceptions_1.RuntimeException(err);
            }
        }
    }
    hasOnStartHook(provider) {
        return !utils_1.isUndefined(provider.onStart);
    }
    async stopServices() {
        for (const module of this.container.getModules().values()) {
            await this.stopModuleServices(module);
        }
    }
    async stopModuleServices(module) {
        for (const wrapper of module.providers.values()) {
            const provider = wrapper.instance;
            try {
                if (this.hasOnStopHook(provider)) {
                    await provider.onStop();
                    wrapper.isStarted = false;
                }
            }
            catch (err) {
                throw new exceptions_1.RuntimeException(err);
            }
        }
    }
    hasOnStopHook(provider) {
        return !utils_1.isUndefined(provider.onStop);
    }
    async init() {
        await this.callInitHook();
        await this.callBootstrapHook();
        this.isInitialized = true;
        this.logger.log(constants_1.MESSAGES.APPLICATION_READY);
        return this;
    }
    getApp() {
        return this.app;
    }
    async start() {
        !this.isInitialized && (await this.init());
        this.startServices();
    }
    async stop() {
        this.stopServices();
    }
}
exports.NestdApp = NestdApp;
