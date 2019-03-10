import { InjectorDependencyContext } from '../injector/injector';
import { Module } from '../injector/module';
export declare const UNKNOWN_DEPENDENCIES_MESSAGE: (type: string | symbol, unknownDependenciesContext: InjectorDependencyContext, module: Module) => string;
export declare const UNKNOWN_EXPORT_MESSAGE: (text: any, module: string) => string;
export declare const INVALID_MODULE_MESSAGE: (text: any, scope: string) => string;
export declare const INVALID_CLASS_MESSAGE: (text: any, value: any) => string;
export declare const UNHANDLED_RUNTIME_EXCEPTION = "Unhandled Runtime Exception.";
