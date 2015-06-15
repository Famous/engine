#!/usr/bin/env node

const glslifyBundle = require('glslify-bundle')
const glslifyDeps   = require('glslify-deps')
const glslResolve   = require('glsl-resolve')
const minimist      = require('minimist')
const path          = require('path')
const bl            = require('bl')
const fs            = require('fs')

const depper = glslifyDeps()
const argv   = minimist(process.argv.slice(2), {
  alias: {
    t: 'transform',
    g: 'global',
    p: 'post',
    o: 'output',
    h: 'help'
  }
})

var input = ''

if (argv.help) return help()
if (!argv._.length && process.stdin.isTTY) return help()

// Apply source transforms
argv.t = argv.t || []
argv.t = Array.isArray(argv.t) ? argv.t : [argv.t]
argv.t.forEach(function(tr) {
  depper.transform(tr)
})

argv.g = argv.g || []
argv.g = Array.isArray(argv.g) ? argv.g : [argv.g]
argv.g.forEach(function(tr) {
  depper.transform(tr, { global: true })
})

argv.p = argv.p || []
argv.p = Array.isArray(argv.p) ? argv.p : [argv.p]

//
// Build dependency tree, then output
//
if (argv._.length) {
  return depper.add(argv._[0], output)
}

process.stdin.pipe(bl(function(err, src) {
  if (err) throw err

  depper.inline(src, process.cwd(), output)
}))

//
// Logs --help information out to stderr.
//
function help() {
  fs.createReadStream(path.join(__dirname, 'usage.txt'))
    .once('close', function() {
      console.error()
      process.exit(1)
    })
    .pipe(process.stderr)
}

//
// Finally, apply shared functions for --post transforms
// and output the result to either stdout or the output
// file.
//
function output(err, tree) {
  if (err) throw err
  var src = String(glslifyBundle(tree))

  next()
  function next() {
    var tr = argv.p.shift()
    if (!tr) return done()
    var transform = require(tr)

    transform(null, src, {
      post: true
    }, function(err, data) {
      if (err) throw err
      if (data) src = data
      next()
    })
  }

  function done() {
    if (!argv.output) return process.stdout.write(src)
    fs.writeFile(argv.output, src)
  }
}
