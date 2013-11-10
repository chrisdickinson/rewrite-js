var path = require('path')
  , tty = require('tty')
  , fs = require('fs')

var language = require('cssauron-falafel')
  , concat = require('concat-stream')
  , falafel = require('falafel')
  , nopt = require('nopt')
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

  var str = help + ''

  process.stdout.write(
      str.slice(str.indexOf('/*') + 3, str.indexOf('*/'))
  )
}

function run() {
  var stdintty = tty.isatty(process.stdin)
    , parsed = nopt(options, shorthand)
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
    if(err) {
      throw err
    }

    source = data

    transform = parse_transform(
        require(path.join(process.cwd(), parsed.argv.remain[0]))
    )
    source = falafel(source + '', apply_transform)

    parsed.argv.remain.shift()
    if(!parsed.argv.remain.length) {
      return process.stdout.write(source + '')
    }

    got_source(null, source)
  }

  function apply_transform(node) {
    var target
      , result

    for(var i = 0, len = transform.length; i < len; ++i) {
      if(target = transform[i][0](node)) {
        result = transform[i][1].apply(
            null
          , Array.isArray(target) ? target : [target]
        )

        if(result === false) {
          break
        }
      }
    }
  }

  function parse_transform(trans) {
    var output = []

    for(var key in trans) {
      output.push([
          language(key)
        , typeof trans[key] === 'string' ?
          Function('node', 'return ' + trans[key]) : trans[key]
      ])
    }

    return output
  }
}
