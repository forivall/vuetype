"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
require("colors");
var path = require("path");
var language_service_1 = require("./language-service");
var file_util_1 = require("./file-util");
var logger_1 = require("./logger");
function generate(filenames, options) {
    var vueFiles = filenames
        .filter(function (file) { return /\.vue$/.test(file); })
        .map(function (file) { return path.resolve(file); });
    // Should not emit if some errors are occurred
    var service = new language_service_1.LanguageService(vueFiles, __assign({}, options, { declaration: true, noEmitOnError: true }));
    return Promise.all(vueFiles.map(function (file) {
        var dts = service.getDts(file);
        var dtsPath = file + '.d.ts';
        if (dts.errors.length > 0) {
            logger_1.logError(dtsPath, dts.errors);
            return;
        }
        if (dts.result === null)
            return;
        return file_util_1.writeFile(dtsPath, dts.result)
            .then(function () {
            logger_1.logEmitted(dtsPath);
        });
    })).then(function () { return void 0; });
}
exports.generate = generate;
