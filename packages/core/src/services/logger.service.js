"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
var Logger_1;
"use strict";
const clc = require("cli-color");
const decorators_1 = require("../decorators");
const enums_1 = require("../enums");
const utils_1 = require("../utils");
let Logger = Logger_1 = class Logger {
    constructor(context, isTimeDiffEnabled = false) {
        this.context = context;
        this.isTimeDiffEnabled = isTimeDiffEnabled;
    }
    log(message, context) {
        const { logger } = Logger_1;
        if (logger === this) {
            Logger_1.log(message, context || this.context, this.isTimeDiffEnabled);
            return;
        }
        logger && logger.log.call(logger, message, context || this.context);
    }
    error(message, trace = '', context) {
        const { logger } = Logger_1;
        if (logger === this) {
            Logger_1.error(message, trace, context || this.context);
            return;
        }
        logger && logger.error.call(logger, message, trace, context || this.context);
    }
    warn(message, context) {
        const { logger } = Logger_1;
        if (logger === this) {
            Logger_1.warn(message, context || this.context, this.isTimeDiffEnabled);
            return;
        }
        logger && logger.warn.call(logger, message, context || this.context);
    }
    static overrideLogger(logger) {
        this.logger = logger ? logger : undefined;
    }
    static setMode(mode) {
        this.contextEnvironment = mode;
    }
    static log(message, context = '', isTimeDiffEnabled = true) {
        this.printMessage(message, clc.green, context, isTimeDiffEnabled);
    }
    static error(message, trace = '', context = '', isTimeDiffEnabled = true) {
        this.printMessage(message, clc.red, context, isTimeDiffEnabled);
        this.printStackTrace(trace);
    }
    static warn(message, context = '', isTimeDiffEnabled = true) {
        this.printMessage(message, clc.yellow, context, isTimeDiffEnabled);
    }
    static isActive() {
        return Logger_1.contextEnvironment !== enums_1.NestdEnvironment.TEST;
    }
    static printMessage(message, color, context = '', isTimeDiffEnabled) {
        if (!this.isActive()) {
            return;
        }
        const output = utils_1.isObject(message)
            ? JSON.stringify(message, null, 2)
            : message;
        process.stdout.write(color(`[Nest] ${process.pid}   - `));
        process.stdout.write(`${new Date(Date.now()).toLocaleString()}   `);
        context && process.stdout.write(this.yellow(`[${context}] `));
        process.stdout.write(color(output));
        this.printTimestamp(isTimeDiffEnabled);
        process.stdout.write(`\n`);
    }
    static printTimestamp(isTimeDiffEnabled) {
        const includeTimestamp = Logger_1.prevTimestamp && isTimeDiffEnabled;
        if (includeTimestamp) {
            process.stdout.write(this.yellow(` +${Date.now() - Logger_1.prevTimestamp}ms`));
        }
        Logger_1.prevTimestamp = Date.now();
    }
    static printStackTrace(trace) {
        if (!this.isActive() || !trace) {
            return;
        }
        process.stdout.write(trace);
        process.stdout.write(`\n`);
    }
};
Logger.contextEnvironment = enums_1.NestdEnvironment.RUN;
Logger.logger = Logger_1;
Logger.yellow = clc.xterm(3);
Logger = Logger_1 = __decorate([
    decorators_1.Service(),
    __param(0, decorators_1.Optional()),
    __param(1, decorators_1.Optional()),
    __metadata("design:paramtypes", [String, Object])
], Logger);
exports.Logger = Logger;
