import ts = require('typescript');
import chokidar = require('chokidar');
export declare function watch(dirs: string[], compilerOptions?: ts.CompilerOptions, usePolling?: boolean): chokidar.FSWatcher;
