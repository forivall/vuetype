"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ts = require("typescript");
var ts_file_map_1 = require("./ts-file-map");
var D = require("debug");
var debug = D('vuetype:language-service');
var LanguageService = (function () {
    function LanguageService(rootFileNames, options) {
        var _this = this;
        this.options = options;
        this.files = new ts_file_map_1.TsFileMap();
        rootFileNames.forEach(function (file) {
            _this.files.updateFile(file);
        });
        var serviceHost = new LanguageServiceHost(this.files, options);
        this.tsService = ts.createLanguageService(serviceHost, ts.createDocumentRegistry());
    }
    LanguageService.prototype.updateFile = function (fileName) {
        this.files.updateFile(fileName);
    };
    LanguageService.prototype.getDts = function (fileName) {
        fileName = normalize(fileName);
        // Unsupported files or not found
        if (!this.files.canEmit(fileName)) {
            return {
                result: null,
                errors: []
            };
        }
        debug('getting emit output for %s', fileName);
        var output = this.tsService.getEmitOutput(fileName, true);
        if (!output.emitSkipped) {
            var result = output.outputFiles
                .filter(function (file) { return /\.d\.ts$/.test(file.name); })[0].text;
            return {
                result: result,
                errors: []
            };
        }
        return {
            result: null,
            errors: this.collectErrorMessages(fileName)
        };
    };
    LanguageService.prototype.collectErrorMessages = function (fileName) {
        var allDiagnostics = this.tsService.getCompilerOptionsDiagnostics()
            .concat(this.tsService.getSyntacticDiagnostics(fileName))
            .concat(this.tsService.getSemanticDiagnostics(fileName));
        return allDiagnostics.map(function (diagnostic) {
            var message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
            if (diagnostic.file) {
                var _a = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start || 0), line = _a.line, character = _a.character;
                return "[" + (line + 1) + "," + (character + 1) + "] " + message;
            }
            return message;
        });
    };
    return LanguageService;
}());
exports.LanguageService = LanguageService;
var LanguageServiceHost = (function () {
    function LanguageServiceHost(files, options) {
        var _this = this;
        this.files = files;
        this.options = options;
        this.moduleResolutionFiles = new ts_file_map_1.TsFileMap();
        this.moduleResolutionHost = {
            fileExists: function (file) {
                _this.moduleResolutionFiles.updateFile(file);
                var r = _this.moduleResolutionFiles.canEmit(file);
                return r;
            },
            readFile: function (file) {
                return _this.moduleResolutionFiles.getSrc(file);
            }
        };
    }
    LanguageServiceHost.prototype.getScriptFileNames = function () { return this.files.fileNames; };
    LanguageServiceHost.prototype.getScriptVersion = function (fileName) { return this.files.getVersion(fileName) || '0'; };
    LanguageServiceHost.prototype.getScriptSnapshot = function (fileName) {
        var src = this.files.getSrc(fileName) || '';
        return ts.ScriptSnapshot.fromString(src);
    };
    LanguageServiceHost.prototype.getCurrentDirectory = function () { return process.cwd(); };
    LanguageServiceHost.prototype.getCompilationSettings = function () { return this.options; };
    LanguageServiceHost.prototype.getDefaultLibFileName = function (options) { return ts.getDefaultLibFilePath(options); };
    LanguageServiceHost.prototype.resolveModuleNames = function (moduleNames, containingFile, reusedNames) {
        var _this = this;
        var resolvedModules = moduleNames.map(function (moduleName) { return ts.resolveModuleName(moduleName, containingFile, _this.options, _this.moduleResolutionHost).resolvedModule; });
        return resolvedModules;
    };
    return LanguageServiceHost;
}());
exports.LanguageServiceHost = LanguageServiceHost;
// .ts suffix is needed since the compiler skips compile
// if the file name seems to be not supported types
function normalize(fileName) {
    if (/\.vue$/.test(fileName)) {
        return fileName + '.ts';
    }
    return fileName;
}
