"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function logEmitted(filePath) {
    console.log('Emitted: '.green + filePath);
}
exports.logEmitted = logEmitted;
function logRemoved(filePath) {
    console.log('Removed: '.green + filePath);
}
exports.logRemoved = logRemoved;
function logError(filePath, messages) {
    var errors = [
        'Emit Failed: '.red + filePath
    ].concat(messages.map(function (m) { return '  ' + 'Error: '.red + m; }));
    console.error(errors.join('\n'));
}
exports.logError = logError;
