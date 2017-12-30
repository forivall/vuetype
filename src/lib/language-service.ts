import ts = require('typescript')
import { TsFileMap } from './ts-file-map'
import D = require('debug')
const debug = D('vuetype:language-service')

export interface Result<T> {
  result: T | null
  errors: string[]
}

export class LanguageService {
  private files = new TsFileMap()
  private tsService: ts.LanguageService

  constructor (rootFileNames: string[], private options: ts.CompilerOptions) {
    rootFileNames.forEach(file => {
      this.files.updateFile(file)
    })

    const serviceHost = new LanguageServiceHost(this.files, options)
    this.tsService = ts.createLanguageService(serviceHost, ts.createDocumentRegistry())
  }

  updateFile (fileName: string): void {
    this.files.updateFile(fileName)
  }

  getDts (fileName: string): Result<string> {
    fileName = normalize(fileName)

    // Unsupported files or not found
    if (!this.files.canEmit(fileName)) {
      return {
        result: null,
        errors: []
      }
    }

    debug('getting emit output for %s', fileName)
    const output = this.tsService.getEmitOutput(fileName, true)

    if (!output.emitSkipped) {
      const result = output.outputFiles
        .filter(file => /\.d\.ts$/.test(file.name))[0].text

      return {
        result,
        errors: []
      }
    }

    return {
      result: null,
      errors: this.collectErrorMessages(fileName)
    }
  }

  private collectErrorMessages (fileName: string): string[] {
    const allDiagnostics = this.tsService.getCompilerOptionsDiagnostics()
      .concat(this.tsService.getSyntacticDiagnostics(fileName))
      .concat(this.tsService.getSemanticDiagnostics(fileName))

    return allDiagnostics.map(diagnostic => {
      const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n')

      if (diagnostic.file) {
        const { line, character } = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start || 0)
        return `[${line + 1},${character + 1}] ${message}`
      }
      return message
    })
  }
}

export class LanguageServiceHost implements ts.LanguageServiceHost {
  private moduleResolutionFiles = new TsFileMap();
  private moduleResolutionHost: ts.ModuleResolutionHost = {
    fileExists: (file: string) => {
      this.moduleResolutionFiles.updateFile(file)
      const r = this.moduleResolutionFiles.canEmit(file)
      return r
    },
    readFile: (file: string) => {
      return this.moduleResolutionFiles.getSrc(file)
    }
  }
  constructor(private files: TsFileMap, private options: ts.CompilerOptions) {
  }

  getScriptFileNames() { return this.files.fileNames }
  getScriptVersion(fileName: string) { return this.files.getVersion(fileName) || '0' }
  getScriptSnapshot(fileName: string) {
    const src = this.files.getSrc(fileName) || ''
    return ts.ScriptSnapshot.fromString(src)
  }
  getCurrentDirectory() { return process.cwd() }
  getCompilationSettings() { return this.options }
  getDefaultLibFileName(options: ts.CompilerOptions) { return ts.getDefaultLibFilePath(options) }

  resolveModuleNames(moduleNames: string[], containingFile: string, reusedNames?: string[]): ts.ResolvedModule[] {
    const resolvedModules = moduleNames.map((moduleName) => ts.resolveModuleName(moduleName, containingFile, this.options, this.moduleResolutionHost).resolvedModule)
    return resolvedModules as ts.ResolvedModuleFull[]
  }
}

// .ts suffix is needed since the compiler skips compile
// if the file name seems to be not supported types
function normalize (fileName: string): string {
  if (/\.vue$/.test(fileName)) {
    return fileName + '.ts'
  }
  return fileName
}
