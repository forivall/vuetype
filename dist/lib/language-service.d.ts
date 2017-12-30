import ts = require('typescript');
import { TsFileMap } from './ts-file-map';
export interface Result<T> {
    result: T | null;
    errors: string[];
}
export declare class LanguageService {
    private options;
    private files;
    private tsService;
    constructor(rootFileNames: string[], options: ts.CompilerOptions);
    updateFile(fileName: string): void;
    getDts(fileName: string): Result<string>;
    private collectErrorMessages(fileName);
}
export declare class LanguageServiceHost implements ts.LanguageServiceHost {
    private files;
    private options;
    private moduleResolutionFiles;
    private moduleResolutionHost;
    constructor(files: TsFileMap, options: ts.CompilerOptions);
    getScriptFileNames(): string[];
    getScriptVersion(fileName: string): string;
    getScriptSnapshot(fileName: string): ts.IScriptSnapshot;
    getCurrentDirectory(): string;
    getCompilationSettings(): ts.CompilerOptions;
    getDefaultLibFileName(options: ts.CompilerOptions): string;
    resolveModuleNames(moduleNames: string[], containingFile: string, reusedNames?: string[]): ts.ResolvedModule[];
}
