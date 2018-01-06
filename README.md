# pull-stream-protocol-checker

Pull-stream module for detecting protocol violations at the interface of two modules.

Report an error if one of the following invariants is violated:

1. No ask request (````read(false, ...)````) after termination
2. Every callback is eventually invoked
3. Every callback is invoked only once
4. The callbacks are invoked in the order in which they were created
5. No value answer (````cb(false, data)````) after termination

Optionally can check:

6. That no other request are made after the stream has terminated or was aborted
7. The stream is eventually terminated

# Usage

````
var checker = require('pull-stream-protocol-checker')
var pull = require('pull-stream')

var probe = checker()

pull(
  pull.count(10),
  probe,
  pull.drain(null, function () {
    probe.terminate()
  }) 
)
````

# probe = checker([forbidExtraRequests][, enforceStreamTermination][, notifyEagerly])

* ````forbidExtraRequests````      ````<Boolean>```` (Defaults to ````false````)
* ````enforceStreamTermination```` ````<Boolean>```` (Defaults to ````false````)
* ````notifyEagerly````            ````<Boolean>```` (Defaults to ````true````)

Invariant 5 is activated by setting ````forbidExtraRequests```` to ````true````. Invariant 6 is activated by setting ````enforceStreamTermination```` to ````true````. If ````notifyEagerly===true````, an invariant violation is reported as an error that is thrown immediately; otherwise all violations are remembered and returned as an error array when invoking ````errors = probe.terminate()````.

# Other modules with similar goals

https://github.com/dominictarr/pull-spec

https://github.com/nichoth/pull-stream-spec
