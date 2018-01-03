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

tape('Invariant 1', function (t) {
  var probe = checker(true, true)

  var source = pull(
    pull.count(10),
    probe
  )

  try {
    source(true)
    source(false, function () {})
    t.fail('Invariant 1 violation not detected')
  } catch (e) {
    t.equal(e.message, 'Invariant 1 violated: value requested after termination')
  }
  t.end()
})

tape('Invariant 2', function (t) {
  var probe = checker(true, true)

  var source = pull(
    function (abort, cb) { },
    probe
  )

  try {
    source(false, function () {})
    probe.terminate()
    t.fail('Invariant 2 violation not detected')
  } catch (e) {
    t.equal(e.message, 'Invariant 2 violated: callback 1 was never invoked')
  }
  t.end()
})

tape('Invariant 3', function (t) {
  var probe = checker()

  var cb
  var source = pull(
    function (abort, _cb) { cb = _cb },
    probe
  )

  try {
    source(false, function () {})
    cb(false, 1)
    cb(false, 1)
    t.fail('Invariant 3 violation not detected')
  } catch (e) {
    t.equal(e.message, 'Invariant 3 violated: callback 1 invoked 2 times')
  }
  t.end()
})

tape('Invariant 4', function (t) {
  var probe = checker()

  var cbs = []
  var source = pull(
    function (abort, _cb) { cbs.push(_cb) },
    probe
  )

  try {
    source(false, function () {})
    source(false, function () {})
    cbs[1](false, 2)
    cbs[0](false, 1)
    t.fail('Invariant 4 violation not detected')
  } catch (e) {
    t.equal(e.message, 'Invariant 4 violated: callback 2 invoked before callback 1')
  }
  t.end()
})

tape('Invariant 5', function (t) {
  var probe = checker(true)
  var source = pull(
    pull.count(0),
    probe
  )

  try {
    source(true)
    source(true)
    t.fail('Invariant 5 violation not detected')
  } catch (e) {
    t.equal(e.message, 'Invariant 5 violated: request made after the stream was aborted')
  }

  probe = checker(true)
  source = pull(
    pull.count(1),
    probe
  )

  try {
    source(false, function () {})
    source(false, function () {})
    source(false, function () {})
    source(true)
    t.fail('Invariant 5 violation not detected')
  } catch (e) {
    t.equal(e.message, 'Invariant 5 violated: request made after the stream has terminated')
  }

  t.end()
})

tape('Invariant 6', function (t) {
  var probe = checker(true, true)

  var source = pull(
    function (abort, _cb) { _cb(false, 1) },
    probe
  )

  try {
    source(false, function () {})
    source(false, function () {})
    probe.terminate()
    t.fail('Invariant 6 violation not detected')
  } catch (e) {
    t.equal(e.message, 'Invariant 6 violated: stream was never terminated')
  }
  t.end()
})

tape('Notify during termination', function (t) {
  var probe = checker(true, true, false)

  var source = pull(
    function (abort, _cb) { _cb(false, 1) },
    probe
  )

  var errors = []
  source(false, function () {})
  source(false, function () {})
  errors = probe.terminate()
  if (errors.length < 1) {
    t.fail('Invariant 6 violation not detected')
  } else if (errors.length !== 1) {
    t.fail('Too many errors')
  } else {
    t.equal(errors[0].message, 'Invariant 6 violated: stream was never terminated')
  }
  t.end()
})
