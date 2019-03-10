"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const services_1 = require("../services");
const exceptions_1 = require("./exceptions");
class ExceptionHandler {
    handle(exception) {
        if (!(exception instanceof exceptions_1.RuntimeException)) {
            ExceptionHandler.logger.error(exception.message, exception.stack);
            return;
        }
        ExceptionHandler.logger.error(exception.what(), exception.stack);
    }
}
ExceptionHandler.logger = new services_1.Logger(ExceptionHandler.name);
exports.ExceptionHandler = ExceptionHandler;
