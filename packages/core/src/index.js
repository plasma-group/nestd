"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
var app_ref_host_1 = require("./helpers/app-ref-host");
exports.AppRefHost = app_ref_host_1.AppRefHost;
var module_ref_1 = require("./injector/module-ref");
exports.ModuleRef = module_ref_1.ModuleRef;
var tokens_1 = require("./injector/tokens");
exports.APP_REF = tokens_1.APP_REF;
__export(require("./nestd-app"));
__export(require("./nestd-app-context"));
var nestd_factory_1 = require("./nestd-factory");
exports.NestdFactory = nestd_factory_1.NestdFactory;
__export(require("./services/reflector.service"));
__export(require("./decorators/modules/module.decorator"));
__export(require("./decorators/core/injectable.decorator"));
