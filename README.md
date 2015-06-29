# Pact

## TL;DR:
Pact is basically a tree builder with an event engine; both being customizable.

#### Node types:
* major
  * **root node** - one for each tree
  * **branch node**
  * input comes from closest major ancestor node
  * fires only on certain events
* minor
  * **twig node**
  * input comes from direct parent node
  * fires whenever direct parent fires

#### Example of tree building with resulting tree and data flows

![branching](https://docs.google.com/drawings/d/1S9vzxvVxFChtb9vzSm6LhtELZlBFAuupBuDgguPbYys/pub?w=201&h=262)

```
  Tree builder (twigs are lower case):
  root(A).branch(B).twig(c).twig(d).branch(E).twig(f).branch(G).twig(h);
  L = root(A).branch(I).branch(J).twig(k).branch(L);
  n = L.twig(m).twig(n)
  n.branch(O)
  root(A).twig(p).twig(q).branch(R)
  root(A).twig(s).branch(T).branch(U)

  Tree:  
  A
  |---B---c---d
  |   |---E---f
  |       |---G---h
  |---I
  |   |---J---k
  |       |---L---m---n
  |           |---O
  |---p---q
  |---R
  |---s
  |---T
      |---U

  Data flow:
  A -> B -> c -> d
  A -> B -> E -> f
  A -> B -> E -> G -> h
  A -> I -> J -> k 
  A -> I -> J -> L -> m -> n
  A -> I -> J -> L -> O
  A -> p -> q
  A -> R
  A -> s
  A -> T -> u
```

### Adding an event
`Promise.addEvent(name, keys, blocks)`
* `name` represents the name of the method that will be used to fire the event
* `keys` represent an array of strings that a node can listen for
* `blocks` represents an array of event names to block once the event has been fired

#### Defaults
```
  Promise.addEvent('resolve', ['resolve.start', 'resolve.finish'], ['resolve', 'reject', 'notify']);
  // calling `promise.resolve()` will fire `'resolve.start'` and `'resolve.finish'`.
  // afterwards, events `resolve`, `reject`, and `notify` will be blocked.
  
  Promise.addEvent('reject', ['reject.start', 'reject.finish'], ['resolve', 'reject', 'notify']);
  // calling `promise.reject()` will fire `'reject.start'` and `'reject.finish'`.
  // afterwards, events `resolve`, `reject`, and `notify` will be blocked.

  Promise.addEvent('notify', ['notify'], []);
  // calling `promise.notify()` will fire `'notify'`.
  // afterwards, no events will be blocked.
```

### Adding branch nodes
`Promise.addBranch(name, keys, callback)`
* `name` the method name used to create a branch node during tree building
* `keys` which event keys the node will fire on
* `callback` the callback that the node will use to process its results when an acceptable event has been fired

#### Defaults
```
  Promise.addBranch('then', ['resolve.start']);
  // promise.then() will listen for `resolve.start`
  
  Promise.addBranch('catch', ['reject.start']);
  // promise.catch() will listen for `reject.start`

  Promise.addBranch('finally', ['resolve.finish', 'reject.finish']);
  // promise.finally() will listen for `resolve.finish` and `reject.finish`

  Promise.addBranch('notice', ['notify']);
  // promise.notice() will listen for `notify`
```


### Adding twig nodes
`Promise.addTwig(name, callback)`
* `name` the method name used to create a branch node during tree building
* `callback` the callback that the node will use to process its results

#### Defaults
```
  Promise.addTwig('also');
  // promise.also() will apply a callback sending its result to child twigs only.
```

#### Example twigs

#### expect()
```
  // This method is used to make testing with Jasmine easier.
  // promise.expect(5).resolve(5) works pretty well.
  PromiseTest.addTwig('expect', function (expected) {
      return this.makeTwig(function (actual) {
          expect(actual).toBe(expected);
          return [actual];
      });
  });
```

#### with()
```
  // will retrieve a value from within an input at a specified path.
  // promise.with(1, 'response', 'data').expect('...').resolve(200, {response:{data:'...'}}) works pretty well
  Promise.addTwig('with', function () {
      var keys = arguments;
      return this.makeTwig(function () {
          var value = arguments;
  
          for (var i in keys) {
              value = value[keys[i]];
          }
  
          return [value];
      });
  });
```

#### debug()
```
  // This will write its input to the console.
  Promise.addTwig('debug', function (message) {
      return this.makeTwig(function () {
          console.log(message, '>>', arguments);
          return arguments;
      });
  });
```

#### typeof()
```
  // This will provide the type of the i-th argument to the next twig
  // promise.typeof(1).expect('string').resolve(5, 'ok', ['a', 'b']) works pretty well.
  Promise.addTwig('typeof', function (i) {
      return this.makeTwig(function () {
          return [typeof arguments[i || 0]];
      });
  });
```

#### stringify()
```
  // calls JSON.stringify on the i-th argument.
  // promise.stringify(2).expect('["a","b"]').resolve(5, 'ok', ['a', 'b']) works pretty well.
  Promise.addTwig('stringify', function (i) {
      return this.makeTwig(function () {
          return [JSON.stringify(arguments[i] || 0)];
      });
  });
```
