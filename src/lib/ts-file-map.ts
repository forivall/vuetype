import assert = require('assert')
import ts = require('typescript')
import vueCompiler = require('vue-template-compiler')
import { readFileSync, exists } from './file-util'
import D = require('debug')
const debug = D('vuetype:ts-file-map')

export interface TsFile {
  rawFileName: string
  version: number
  text: string | undefined
}

export class TsFileMap {
  private files = new Map<string, TsFile>()

  get fileNames (): string[] {
    return Array.from(this.files.keys()).filter(file => isSupportedFile(file))
  }

  /**
   * If the file does not exists or it is unsupported type,
   * we does not try emit output or the compiler throws an error
   */
  canEmit (fileName: string): boolean {
    const file = this.getFile(fileName)
    return file != null && !!file.text
  }

  getSrc (fileName: string): string | undefined {
    let file = this.getFile(fileName)

    // If it does not processed yet,
    // register it into map with returning file data
    if (!file) {
      file = this.loadFile(fileName)
      this.registerFile(file)
    }

    return file.text
  }

  getVersion (fileName: string): string | undefined {
    const file = this.getFile(fileName)
    return file && file.version.toString()
  }

  updateFile (fileName: string): void {
    const file = this.loadFile(fileName)
    this.registerFile(file)
  }

  /**
   * Load a TS file that specifed by the argument
   * If .vue file is specified, it extract and retain TS code part only.
   */
  private loadFile (fileName: string): TsFile {
    const rawFileName = getRawFileName(fileName)
    const file = this.getFile(fileName) || {
      rawFileName,
      version: 0,
      text: undefined
    }

    let src = readFileSync(rawFileName)
    if (src && isVueFile(rawFileName)) {
      src = extractCode(src)
    }

    if (src !== file.text) {
      file.version += 1
      file.text = src
    }

    return file
  }

  /**
   * Just returns a file object
   *
   * Returns undefined
   *   - Not loaded yet
   * Return TsFile but file.text is undefined
   *   - Loaded but not found or unsupported
   */
  private getFile (fileName: string): TsFile | undefined {
    return this.files.get(fileName)
  }

  private registerFile (file: TsFile): void {
    const { rawFileName } = file

    if (isVueFile(rawFileName)) {
      // To ensure the compiler can process .vue file,
      // we need to add .ts suffix to file name
      this.files.set(rawFileName + '.ts', file)
    }

    this.files.set(rawFileName, file)
  }
}

/**
 * Extract TS code from single file component
 * If there are no TS code, return undefined
 */
function extractCode (src: string): string | undefined {
  const script = vueCompiler.parseComponent(src, { pad: true }).script
  if (script == null || script.lang !== 'ts') {
    return undefined
  }
  return script.content
}

function isSupportedFile (fileName: string): boolean {
  return /\.(tsx?|jsx?)$/.test(fileName)
}

function isVueFile (fileName: string): boolean {
  return /\.vue(?:\.ts)?$/.test(fileName)
}

// If fileName is already suffixed by `.ts` remove it
function getRawFileName (fileName: string): string {
  if (/\.vue\.ts$/.test(fileName)) {
    return fileName.slice(0, -3)
  }
  return fileName
}
