"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const services_1 = require("../services");
const injector_1 = require("./injector");
const messages_1 = require("../helpers/messages");
class InstanceLoader {
    constructor(container) {
        this.container = container;
        this.injector = new injector_1.Injector();
        this.logger = new services_1.Logger(InstanceLoader.name, true);
    }
    async createInstancesOfDependencies() {
        const modules = this.container.getModules();
        this.createPrototypes(modules);
        await this.createInstances(modules);
    }
    createPrototypes(modules) {
        for (const [_, module] of modules) {
            this.createPrototypesOfProviders(module);
        }
    }
    async createInstances(modules) {
        await Promise.all([...modules.values()].map(async (module) => {
            await this.createInstancesOfProviders(module);
            const { name } = module.metatype;
            this.logger.log(messages_1.MODULE_INIT_MESSAGE `${name}`);
        }));
    }
    createPrototypesOfProviders(module) {
        for (const wrapper of module.providers.values()) {
            this.injector.loadPrototypeOfInstance(wrapper, module.providers);
        }
    }
    async createInstancesOfProviders(module) {
        await Promise.all([...module.providers.values()].map(async (wrapper) => {
            this.injector.loadInstanceOfProvider(wrapper, module);
        }));
    }
}
exports.InstanceLoader = InstanceLoader;
