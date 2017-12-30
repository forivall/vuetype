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
var chokidar = require("chokidar");
var file_util_1 = require("./file-util");
var language_service_1 = require("./language-service");
var logger_1 = require("./logger");
function watch(dirs, compilerOptions, usePolling) {
    if (compilerOptions === void 0) { compilerOptions = {}; }
    if (usePolling === void 0) { usePolling = false; }
    var watcher = chokidar.watch(dirs, {
        usePolling: usePolling
    });
    var service = new language_service_1.LanguageService([], __assign({}, compilerOptions, { noEmitOnError: true }));
    watcher
        .on('add', onlyVue(function (file) {
        service.updateFile(file);
        saveDts(file, service);
    }))
        .on('change', onlyVue(function (file) {
        service.updateFile(file);
        saveDts(file, service);
    }))
        .on('unlink', onlyVue(function (file) {
        service.updateFile(file);
        removeDts(file);
    }));
    return watcher;
}
exports.watch = watch;
function saveDts(fileName, service) {
    var dts = service.getDts(fileName);
    var dtsName = fileName + '.d.ts';
    if (dts.errors.length > 0) {
        logger_1.logError(dtsName, dts.errors);
        return;
    }
    if (dts.result === null)
        return;
    file_util_1.writeFile(dtsName, dts.result)
        .then(function () { return logger_1.logEmitted(dtsName); }, function (err) { return logger_1.logError(dtsName, [err.message]); });
}
function removeDts(fileName) {
    var dtsName = fileName + '.d.ts';
    file_util_1.unlink(dtsName)
        .then(function () { return logger_1.logRemoved(dtsName); }, function (err) { return logger_1.logError(dtsName, [err.message]); });
}
function onlyVue(fn) {
    return function (fileName) {
        if (!/\.vue$/.test(fileName))
            return;
        fn(fileName);
    };
}
