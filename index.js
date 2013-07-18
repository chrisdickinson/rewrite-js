var tty = require('tty')
  , path = require('path')
  , fs = require('fs')

var concat = require('concat-stream')
  , nopt = require('nopt')
  , language = require('cssauron-falafel')
  , falafel = require('falafel')
  , shorthand
  , options

options = {
  'help': Boolean
}

shorthand = {
  'h': ['--help']
}

module.exports = run

function help() {
/*
rewrite-js [transform-module ...]

  Takes a JavaScript program as input on stdin, outputs the program transformed
  by each of the transform-modules on stdout.
*/

  var str = help+''

  process.stdout.write(str.slice(str.indexOf('/*')+3, str.indexOf('*/')))
}

function run() {
  var parsed = nopt(options, shorthand)
    , stdintty = tty.isatty(process.stdin)
    , transform = null
    , source = null

  if(parsed.help || (!parsed.argv.remain.length && stdintty)) {
    return help(), process.exit(1)
  }

  process.stdin.pipe(concat(got_source))
  
  if(process.stdin.paused) {
    process.stdin.resume()
  }

  function got_source(err, data) {
    if(err) throw err

    source = data
    transform = parse_transform(require(path.join(process.cwd(), parsed.argv.remain[0])))
    source = falafel(source+'', apply_transform)

    if(!parsed.argv.remain.length) {
      return process.stdout.write(source)
    }

    parsed.argv.remain.shift()
    got_source(null, source)
  }

  function apply_transform(node) {
    for(var i = 0, len = transform.length; i < len; ++i) {
      if(transform[i][0](node)) {
        if(transform[i][1](node) === false) break
      }
    } 
  }

  function parse_transform(trans) {
    var output = []
    for(var key in trans) {
      output.push([language(key), typeof trans[key] === 'string' ? Function('node', 'return '+trans[key]) : trans[key]])
    }
    return output
  }
}
