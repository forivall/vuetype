"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var generate_1 = require("./generate");
var watch_1 = require("./watch");
var config_1 = require("./config");
function generate(filenames, configPath) {
    var config = config_1.readConfig(configPath);
    return generate_1.generate(filenames, config ? config.options : {});
}
exports.generate = generate;
function watch(dirs, configPath) {
    var config = config_1.readConfig(configPath);
    watch_1.watch(dirs, config ? config.options : {});
}
exports.watch = watch;
