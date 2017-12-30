"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var assert = require("assert");
var path = require("path");
var fs = require("fs");
var glob = require("glob");
function readFileSync(filePath) {
    try {
        return fs.readFileSync(filePath, 'utf8');
    }
    catch (err) {
        return undefined;
    }
}
exports.readFileSync = readFileSync;
function readFile(filePath) {
    return exec(fs.readFile, filePath, 'utf8');
}
exports.readFile = readFile;
function writeFile(filePath, data) {
    return exec(fs.writeFile, filePath, data).then(function () { return void 0; });
}
exports.writeFile = writeFile;
function unlink(filePath) {
    return exec(fs.unlink, filePath).then(function () { return void 0; });
}
exports.unlink = unlink;
function exists(filePath) {
    return fs.existsSync(filePath);
}
exports.exists = exists;
function globSync(patterns) {
    if (typeof patterns === 'string') {
        patterns = [patterns];
    }
    return patterns.reduce(function (acc, pattern) {
        return acc.concat(glob.sync(pattern));
    }, []);
}
exports.globSync = globSync;
function deepestSharedRoot(pathNames) {
    assert(pathNames.length >= 1);
    var root = pathNames[0].split(path.sep);
    pathNames.slice(1).forEach(function (pathName) {
        var dirs = pathName.split(path.sep);
        dirs.forEach(function (dir, i) {
            if (root[i] !== dir) {
                root = root.slice(0, i);
            }
        });
    });
    return root.join(path.sep);
}
exports.deepestSharedRoot = deepestSharedRoot;
function exec(fn) {
    var args = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args[_i - 1] = arguments[_i];
    }
    return new Promise(function (resolve, reject) {
        fn.apply(undefined, args.concat(function (err, res) {
            if (err)
                reject(err);
            resolve(res);
        }));
    });
}
