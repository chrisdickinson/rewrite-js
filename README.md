# rewrite-js

A CLI tool for transforming JavaScript input using [falafel](http://github.com/substack/node-falafel)
and [cssauron](http://github.com/chrisdickinson/cssauron). Works great with Vim!

```bash

# usage: rewrite-js [tranform-module, ...]
$ cat myfile.js | rewrite-js transform.js > myfile-transformed.js

```

Transformation modules should export and object mapping [cssauron-falafel](http://github.com/chrisdickinson/cssauron-falafel)
selectors to transformation functions.

```javascript
// example transform
module.exports = {
  'call:contains(async) > function:last-child': rewrite_async_wrap
}

function rewrite_async_wrap(node) {
  node.parent.update(node.source())
}

// takes `async(function() { })` and rewrites it to `function() { }`
```

# Installation

`npm install -g rewrite-js`

# License

MIT
