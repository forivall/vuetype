"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var path = require("path");
var ts = require("typescript");
var file_util_1 = require("./file-util");
function readConfig(configPath, _parseConfigHost // for test
) {
    if (_parseConfigHost === void 0) { _parseConfigHost = ts.sys; } // for test
    var result = ts.readConfigFile(configPath, _parseConfigHost.readFile);
    if (result.error) {
        return undefined;
    }
    return ts.parseJsonConfigFileContent(result.config, _parseConfigHost, path.dirname(configPath), undefined, configPath);
}
exports.readConfig = readConfig;
function findConfig(baseDir, _exists // for test
) {
    if (_exists === void 0) { _exists = file_util_1.exists; } // for test
    var configFileName = 'tsconfig.json';
    function loop(dir) {
        var parentPath = path.dirname(dir);
        // It is root directory if parent and current dirname are the same
        if (dir === parentPath) {
            return undefined;
        }
        var configPath = path.join(dir, configFileName);
        if (_exists(configPath)) {
            return configPath;
        }
        return loop(parentPath);
    }
    return loop(baseDir);
}
exports.findConfig = findConfig;
