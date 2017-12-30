export interface TsFile {
    rawFileName: string;
    version: number;
    text: string | undefined;
}
export declare class TsFileMap {
    private files;
    readonly fileNames: string[];
    /**
     * If the file does not exists or it is unsupported type,
     * we does not try emit output or the compiler throws an error
     */
    canEmit(fileName: string): boolean;
    getSrc(fileName: string): string | undefined;
    getVersion(fileName: string): string | undefined;
    updateFile(fileName: string): void;
    /**
     * Load a TS file that specifed by the argument
     * If .vue file is specified, it extract and retain TS code part only.
     */
    private loadFile(fileName);
    /**
     * Just returns a file object
     *
     * Returns undefined
     *   - Not loaded yet
     * Return TsFile but file.text is undefined
     *   - Loaded but not found or unsupported
     */
    private getFile(fileName);
    private registerFile(file);
}
