# pull-stream-protocol-checker

Pull-stream module for detecting protocol violations at the interface of two modules.

Raise an exception if one of the following invariants is violated:

1. No value request (````ask````) after termination
2. Every callback is eventually invoked
3. Every callback is invoked only once
4. The callbacks are invoked in the order in which they were created

Optionally can check:

5. That no other request are made after the stream has terminated or was aborted
6. The stream is eventually terminated

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

# checker([forbidExtraRequests][, enforceStreamTermination])

* ````forbidExtraRequests```` ````<Boolean>```` (Defaults to ````false````)
* ````enforceStreamTermination```` ````<Boolean>```` (Defaults to ````false````)

Invariant 5 is activated by setting ````forbidExtraRequests```` to ````true````. Invariant 6 is activated by setting ````enforceStreamTermination```` to ````true````.

# Other modules with similar goals

https://github.com/dominictarr/pull-spec

https://github.com/nichoth/pull-stream-spec
