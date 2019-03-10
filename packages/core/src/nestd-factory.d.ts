import { INestdApp, NestdAppContextOptions, NestdAppOptions, INestdAppContext } from './interfaces';
export declare class NestdFactoryStatic {
    private readonly logger;
    create(module: any, options?: NestdAppOptions): Promise<INestdApp>;
    createAppContext(module: any, options?: NestdAppContextOptions): Promise<INestdAppContext>;
    private createNestdInstance;
    private initialize;
    private createProxy;
    private createExceptionProxy;
    private applyLogger;
}
export declare const NestdFactory: NestdFactoryStatic;
