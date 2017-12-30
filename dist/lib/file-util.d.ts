export declare function readFileSync(filePath: string): string | undefined;
export declare function readFile(filePath: string): Promise<string>;
export declare function writeFile(filePath: string, data: string): Promise<void>;
export declare function unlink(filePath: string): Promise<void>;
export declare function exists(filePath: string): boolean;
export declare function globSync(patterns: string | string[]): string[];
export declare function deepestSharedRoot(pathNames: string[]): string;
