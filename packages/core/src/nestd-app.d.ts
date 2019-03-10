import { INestdApp, NestdAppOptions } from './interfaces';
import { AppConfig } from './app-config';
import { NestdAppContext } from './nestd-app-context';
import { Module } from './injector/module';
import { NestdContainer } from './injector/container';
export declare class NestdApp extends NestdAppContext implements INestdApp {
    private readonly config;
    private readonly appOptions;
    private readonly logger;
    private app;
    private isInitialized;
    constructor(container: NestdContainer, config: AppConfig, appOptions?: NestdAppOptions);
    startServices(): Promise<void>;
    startModuleServices(module: Module): Promise<void>;
    private hasOnStartHook;
    stopServices(): Promise<void>;
    stopModuleServices(module: Module): Promise<void>;
    private hasOnStopHook;
    init(): Promise<this>;
    getApp(): any;
    start(): Promise<void>;
    stop(): Promise<any>;
}
