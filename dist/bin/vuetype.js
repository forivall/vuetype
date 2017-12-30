#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var path = require("path");
var program = require("commander");
var file_util_1 = require("../lib/file-util");
var config_1 = require("../lib/config");
var generate_1 = require("../lib/generate");
var watch_1 = require("../lib/watch");
// tslint:disable-next-line
var meta = require('../../package.json');
program
    .version(meta.version)
    .usage('<directory...>')
    .option('-w, --watch', 'watch file changes')
    .parse(process.argv);
if (program.args.length === 0) {
    program.help();
}
else {
    var root = path.resolve(file_util_1.deepestSharedRoot(program.args));
    var configPath = config_1.findConfig(root);
    var config = configPath && config_1.readConfig(configPath);
    var options = config ? config.options : {};
    if (program['watch']) {
        watch_1.watch(program.args, options);
    }
    else {
        var patterns = program.args.map(function (arg) {
            return path.join(arg, '**/*.vue');
        });
        generate_1.generate(file_util_1.globSync(patterns), options);
    }
}
