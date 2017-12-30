"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var vueCompiler = require("vue-template-compiler");
var file_util_1 = require("./file-util");
var D = require("debug");
var debug = D('vuetype:ts-file-map');
var TsFileMap = (function () {
    function TsFileMap() {
        this.files = new Map();
    }
    Object.defineProperty(TsFileMap.prototype, "fileNames", {
        get: function () {
            return Array.from(this.files.keys()).filter(function (file) { return isSupportedFile(file); });
        },
        enumerable: true,
        configurable: true
    });
    /**
     * If the file does not exists or it is unsupported type,
     * we does not try emit output or the compiler throws an error
     */
    TsFileMap.prototype.canEmit = function (fileName) {
        var file = this.getFile(fileName);
        return file != null && !!file.text;
    };
    TsFileMap.prototype.getSrc = function (fileName) {
        var file = this.getFile(fileName);
        // If it does not processed yet,
        // register it into map with returning file data
        if (!file) {
            file = this.loadFile(fileName);
            this.registerFile(file);
        }
        return file.text;
    };
    TsFileMap.prototype.getVersion = function (fileName) {
        var file = this.getFile(fileName);
        return file && file.version.toString();
    };
    TsFileMap.prototype.updateFile = function (fileName) {
        var file = this.loadFile(fileName);
        this.registerFile(file);
    };
    /**
     * Load a TS file that specifed by the argument
     * If .vue file is specified, it extract and retain TS code part only.
     */
    TsFileMap.prototype.loadFile = function (fileName) {
        var rawFileName = getRawFileName(fileName);
        var file = this.getFile(fileName) || {
            rawFileName: rawFileName,
            version: 0,
            text: undefined
        };
        var src = file_util_1.readFileSync(rawFileName);
        if (src && isVueFile(rawFileName)) {
            src = extractCode(src);
        }
        if (src !== file.text) {
            file.version += 1;
            file.text = src;
        }
        return file;
    };
    /**
     * Just returns a file object
     *
     * Returns undefined
     *   - Not loaded yet
     * Return TsFile but file.text is undefined
     *   - Loaded but not found or unsupported
     */
    TsFileMap.prototype.getFile = function (fileName) {
        return this.files.get(fileName);
    };
    TsFileMap.prototype.registerFile = function (file) {
        var rawFileName = file.rawFileName;
        if (isVueFile(rawFileName)) {
            // To ensure the compiler can process .vue file,
            // we need to add .ts suffix to file name
            this.files.set(rawFileName + '.ts', file);
        }
        this.files.set(rawFileName, file);
    };
    return TsFileMap;
}());
exports.TsFileMap = TsFileMap;
/**
 * Extract TS code from single file component
 * If there are no TS code, return undefined
 */
function extractCode(src) {
    var script = vueCompiler.parseComponent(src, { pad: true }).script;
    if (script == null || script.lang !== 'ts') {
        return undefined;
    }
    return script.content;
}
function isSupportedFile(fileName) {
    return /\.(tsx?|jsx?)$/.test(fileName);
}
function isVueFile(fileName) {
    return /\.vue(?:\.ts)?$/.test(fileName);
}
// If fileName is already suffixed by `.ts` remove it
function getRawFileName(fileName) {
    if (/\.vue\.ts$/.test(fileName)) {
        return fileName.slice(0, -3);
    }
    return fileName;
}
