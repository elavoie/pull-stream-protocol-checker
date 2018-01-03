function checkArgs (forbidExtraRequests, enforceStreamTermination, notifyEagerly) {
  if (typeof forbidExtraRequests !== 'boolean') {
    throw new Error("Invalid argument 'forbidExtraRequests': should be a boolean value")
  }

  if (typeof enforceStreamTermination !== 'boolean') {
    throw new Error("Invalid argument 'enforceStreamTermination': should be a boolean value")
  }

  if (typeof notifyEagerly !== 'boolean') {
    throw new Error("Invalid argument 'notifyEagerly': should be a boolean value")
  }
}

module.exports = function (forbidExtraRequests, enforceStreamTermination, notifyEagerly) {
  if (arguments.length < 1) forbidExtraRequests = false
  if (arguments.length < 2) enforceStreamTermination = false
  if (arguments.length < 3) notifyEagerly = true
  checkArgs(forbidExtraRequests, enforceStreamTermination, notifyEagerly)

  function notify (message) {
    if (notifyEagerly) throw new Error(message)
    else errors.push(new Error(message))
  }

  var errors = []
  var aborted = false
  var done = false
  var j = 1
  var latest = 0

  function input (requests) {
    return function output (_abort, x) {
      if (aborted || done) {
        if (_abort === false) notify('Invariant 1 violated: value requested after termination')
        if (forbidExtraRequests) {
          if (aborted) notify('Invariant 5 violated: request made after the stream was aborted')
          if (done) notify('Invariant 5 violated: request made after the stream has terminated')
        }
      }
      aborted = aborted || _abort

      var i = j++
      if (!x) {
        requests(aborted)
      } else {
        var xi = 0
        requests(_abort, function (_done, v) {
          xi++
          if (xi > 1) notify('Invariant 3 violated: callback ' + i + ' invoked ' + xi + ' times')
          if (i < latest) notify('Invariant 4 violated: callback ' + i + ' invoked after callback ' + latest)
          else if (i > latest + 1) notify('Invariant 4 violated: callback ' + i + ' invoked before callback ' + (latest + 1))
          else latest = i

          done = done || _done
          x(done, v)
        })
      }
    }
  }

  input.terminate = function () {
    if (j > latest + 1) {
      notify('Invariant 2 violated: callback ' + (latest + 1) + ' was never invoked')
    }

    if (enforceStreamTermination && !done && !aborted) {
      notify('Invariant 6 violated: stream was never terminated')
    }

    return errors
  }

  return input
}
