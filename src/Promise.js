var PromisePrototype = {};
var Promise = Object.create(PromisePrototype);
var PromiseTest = Object.create(Promise);

module.exports = {
    PromisePrototype: PromisePrototype,
    Promise: Promise,
    PromiseTest: PromiseTest
};

/**
 * Make a promise. Now try and keep it!
 *
 * This is just a factory method that actually calls and returns .makeRoot()
 *
 * @returns {Promise}
 */
PromisePrototype.make = function () {
    return this.makeRoot();
};

/**
 * Makes a root node.
 *
 * A root node is considered a major node.
 *
 * @returns {Promise}
 */
PromisePrototype.makeRoot = function () {
    var promise = Object.create(this);
    promise.root = promise;
    promise.children = [];
    promise.branch = promise;
    promise.events = true;
    return promise;
};

/**
 * Makes a branch node.
 *
 * A branch node is considered a major node.
 *
 * When a branch invokes its callback, it will only use the result from the previous major node in the chain.
 *
 * If this method is called on a twig promise, the newly created branch promise will only use the result from branch
 *
 * @param callback
 * @param events
 * @returns {Promise}
 */
PromisePrototype.makeBranch = function (callback, events) {
    var promise = Object.create(this.branch);
    promise.callback = callback;
    promise.children = [];
    promise.branch = promise;
    promise.events = events || [];
    this.children.push(promise);
    return promise;
};

/**
 * Makes a twig promise.
 *
 * @param {Function} callback
 * @param {String[]} events
 * @returns {Promise}
 */
PromisePrototype.makeTwig = function (callback, events) {
    var promise = Object.create(this);
    promise.callback = callback;
    promise.children = [];
    promise.branch = this.branch;
    this.children.push(promise);
    return promise;
};

/**
 * Runs an event through the current node and its children.
 *
 * @param {String} event
 * @returns {*}
 */
PromisePrototype.traverse = function (event) {
    if (this.events === true || this.events.indexOf(event) >= 0) {
        if (typeof this.callback === "function") {
            this.result = this.callback.apply(null, this.result);
        }
    }

    this.children.map(function (child) {
        child.traverse(event);
    }.bind(this));

    return this.result;
};

PromisePrototype.addEvent = function (name, keys, blocks) {
    blocks = blocks || [];

    this[name] = function () {
        this.root.result = arguments;

        keys.map(function (key) {
            this.root.traverse(key);
        }.bind(this));

        blocks.map(function (block) {
            this.root[block] = function () {
                return this.result;
            };
        }.bind(this));
    };
};

PromisePrototype.addBranch = function (key, events, callback) {
    this[key] = callback || function (callback) {
            return this.makeBranch(callback, events);
        };
};

PromisePrototype.addTwig = function (key, callback) {
    this[key] = callback || function (callback) {
            return this.makeTwig(callback);
        };
};

Promise.addEvent('resolve', ['resolve.start', 'resolve.finish'], ['resolve', 'reject', 'notify']);
Promise.addEvent('reject', ['reject.start', 'reject.finish'], ['resolve', 'reject', 'notify']);
Promise.addEvent('notify', ['notify'], []);

Promise.addBranch('then', ['resolve.start']);
Promise.addBranch('catch', ['reject.start']);
Promise.addBranch('finally', ['resolve.finish', 'reject.finish']);
Promise.addBranch('notice', ['notify']);

Promise.addTwig('also');

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

PromiseTest.addTwig('expect', function (expected) {
    return this.makeTwig(function (actual) {
        expect(actual).toBe(expected);
        return [actual];
    });
});

Promise.addTwig('debug', function (message) {
    return this.makeTwig(function () {
        console.log(message, '>>', arguments);
        return arguments;
    });
});

Promise.addTwig('typeof', function () {
    return this.makeTwig(function (a) {
        return [typeof a];
    });
});

Promise.addTwig('stringify', function () {
    return this.makeTwig(function (value) {
        return [JSON.stringify(value)];
    });
});

