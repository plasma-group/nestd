"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("./utils");
const services_1 = require("./services");
const app_config_1 = require("./app-config");
const metadata_scanner_1 = require("./metadata-scanner");
const dependency_scanner_1 = require("./dependency-scanner");
const nestd_app_context_1 = require("./nestd-app-context");
const nestd_app_1 = require("./nestd-app");
const constants_1 = require("./constants");
const container_1 = require("./injector/container");
const instance_loader_1 = require("./injector/instance-loader");
const exceptions_zone_1 = require("./errors/exceptions-zone");
class NestdFactoryStatic {
    constructor() {
        this.logger = new services_1.Logger('NestFactory', true);
    }
    async create(module, options) {
        const appConfig = new app_config_1.AppConfig();
        const container = new container_1.NestdContainer(appConfig);
        this.applyLogger(options);
        await this.initialize(module, container, appConfig);
        return this.createNestdInstance(new nestd_app_1.NestdApp(container, appConfig, options));
    }
    async createAppContext(module, options) {
        const container = new container_1.NestdContainer();
        this.applyLogger(options);
        await this.initialize(module, container);
        const modules = container.getModules().values();
        const root = modules.next().value;
        const context = this.createNestdInstance(new nestd_app_context_1.NestdAppContext(container, [], root));
        return context.init();
    }
    createNestdInstance(instance) {
        return this.createProxy(instance);
    }
    async initialize(module, container, config = new app_config_1.AppConfig(), app = null) {
        const instanceLoader = new instance_loader_1.InstanceLoader(container);
        const dependenciesScanner = new dependency_scanner_1.DependencyScanner(container, new metadata_scanner_1.MetadataScanner(), config);
        container.setAppRef(app);
        try {
            this.logger.log(constants_1.MESSAGES.APPLICATION_START);
            await exceptions_zone_1.ExceptionsZone.asyncRun(async () => {
                await dependenciesScanner.scan(module);
                await instanceLoader.createInstancesOfDependencies();
                dependenciesScanner.applyApplicationProviders();
            });
        }
        catch (e) {
            process.abort();
        }
    }
    createProxy(target) {
        const proxy = this.createExceptionProxy();
        return new Proxy(target, {
            get: proxy,
            set: proxy,
        });
    }
    createExceptionProxy() {
        return (receiver, prop) => {
            if (!(prop in receiver)) {
                return;
            }
            if (utils_1.isFunction(receiver[prop])) {
                return (...args) => {
                    let result;
                    exceptions_zone_1.ExceptionsZone.run(() => {
                        result = receiver[prop](...args);
                    });
                    return result;
                };
            }
            return receiver[prop];
        };
    }
    applyLogger(options) {
        if (!options) {
            return;
        }
        !utils_1.isNil(options.logger) && services_1.Logger.overrideLogger(options.logger);
    }
}
exports.NestdFactoryStatic = NestdFactoryStatic;
exports.NestdFactory = new NestdFactoryStatic();
