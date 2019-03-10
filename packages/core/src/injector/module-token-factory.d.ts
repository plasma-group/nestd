import { DynamicModule, Type } from '../interfaces';
export declare class ModuleTokenFactory {
    create(metatype: Type<any>, scope: Type<any>[], dynamicModuleMetadata?: Partial<DynamicModule> | undefined): string;
    getDynamicMetadataToken(dynamicModuleMetadata: Partial<DynamicModule> | undefined): string;
    getModuleName(metatype: Type<any>): string;
    getScopeStack(scope: Type<any>[]): string[];
    private reflectScope;
}
