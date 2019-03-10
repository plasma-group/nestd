import { NestdContainer } from './container';
import { Module } from './module';
export declare class InstanceLoader {
    private readonly container;
    private readonly injector;
    private readonly logger;
    constructor(container: NestdContainer);
    createInstancesOfDependencies(): Promise<void>;
    createPrototypes(modules: Map<string, Module>): void;
    private createInstances;
    private createPrototypesOfProviders;
    private createInstancesOfProviders;
}
