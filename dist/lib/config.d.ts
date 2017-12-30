import ts = require('typescript');
export declare function readConfig(configPath: string, _parseConfigHost?: ts.ParseConfigHost): ts.ParsedCommandLine | undefined;
export declare function findConfig(baseDir: string, _exists?: (filePath: string) => boolean): string | undefined;
