import { RuntimeException } from './exceptions';
export declare class ExceptionHandler {
    private static readonly logger;
    handle(exception: RuntimeException | Error): void;
}
