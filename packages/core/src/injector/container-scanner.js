"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
const modules_container_1 = require("./modules-container");
const exceptions_1 = require("../errors/exceptions");
class ContainerScanner {
    constructor(container) {
        this.container = container;
    }
    find(typeOrToken) {
        this.initFlatContainer();
        return this.findInstanceByPrototypeOrToken(typeOrToken, this.flatContainer);
    }
    findInstanceByPrototypeOrToken(metatypeOrToken, contextModule) {
        const dependencies = new Map([...contextModule.providers]);
        const name = utils_1.isFunction(metatypeOrToken)
            ? metatypeOrToken.name
            : modules_container_1.ModulesContainer;
        const instanceWrapper = dependencies.get(name);
        if (!instanceWrapper) {
            throw new exceptions_1.UnknownElementException();
        }
        return instanceWrapper.instance;
    }
    initFlatContainer() {
        if (this.flatContainer) {
            return;
        }
        const modules = this.container.getModules();
        const initialValue = {
            providers: [],
        };
        const merge = (initial, arr) => [...initial, ...arr];
        this.flatContainer = [...modules.values()].reduce((current, next) => ({
            providers: merge(current.providers, next.providers),
        }), initialValue);
    }
}
exports.ContainerScanner = ContainerScanner;
