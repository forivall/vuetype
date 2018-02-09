#!/usr/bin/env node

import assert = require('assert')
import path = require('path')
import program = require('commander')
import { globSync, deepestSharedRoot } from '../lib/file-util'
import { findConfig, readConfig } from '../lib/config'
import { generate } from '../lib/generate'
import { watch } from '../lib/watch'

// tslint:disable-next-line
const meta = require('../../package.json')

program
  .version(meta.version)
  .usage('<directory...>')
  .option('-w, --watch', 'watch file changes')
  .option('-f, --file', 'use list of files instead of directory')
  .parse(process.argv)

if (program.args.length === 0) {
  program.help()
} else {
  let dirs = program.args
  if (program.file) dirs = dirs.map(path.dirname)
  const root = path.resolve(deepestSharedRoot(dirs))
  const configPath = findConfig(root)
  const config = configPath && readConfig(configPath)
  const options = config ? config.options : {}

  if (program['watch']) {
    watch(program.args, options)
  } else {
    let patterns = program.args
    if (!program.file) {
      patterns = patterns.map(arg => {
        return path.join(arg, '**/*.vue')
      })
    }
    generate(globSync(patterns), options)
  }
}

