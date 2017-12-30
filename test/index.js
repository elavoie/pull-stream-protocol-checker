var tape = require('tape')
var pull = require('pull-stream')
var checker = require('../')

tape('README Example', function (t) {
  var probe = checker(true, true)

  pull(
    pull.count(10),
    probe,
    pull.drain(null, function () {
      probe.terminate()
      t.end()
    })
  )
})
