import { NestdEnvironment } from '../enums';
export interface LoggerService {
    log(message: any, context?: string): void;
    error(message: any, trace?: string, context?: string): void;
    warn(message: any, context?: string): void;
}
export declare class Logger implements LoggerService {
    private readonly context?;
    private readonly isTimeDiffEnabled;
    private static prevTimestamp?;
    private static contextEnvironment;
    private static logger?;
    private static readonly yellow;
    constructor(context?: string, isTimeDiffEnabled?: boolean);
    log(message: any, context?: string): void;
    error(message: any, trace?: string, context?: string): void;
    warn(message: any, context?: string): void;
    static overrideLogger(logger: LoggerService | boolean): void;
    static setMode(mode: NestdEnvironment): void;
    static log(message: any, context?: string, isTimeDiffEnabled?: boolean): void;
    static error(message: any, trace?: string, context?: string, isTimeDiffEnabled?: boolean): void;
    static warn(message: any, context?: string, isTimeDiffEnabled?: boolean): void;
    protected static isActive(): boolean;
    private static printMessage;
    private static printTimestamp;
    private static printStackTrace;
}
