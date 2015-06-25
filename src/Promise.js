var Publisher = require('./GuardedPublisher.js');
var prototype = {};
var exported = Object.create(prototype);
module.exports = exported;

var states = {
    resolvable: true,
    rejectable: true
};

exported.make = function (callback, key) {
    var promise = Object.create(this);
    promise.status = 0;
    promise.result = null;
    promise.callback = key ? callback[key].bind(callback) : callback;
    promise.thens = Publisher.make(true);
    promise.catches = Publisher.make(true);
    promise.finals = Publisher.make(true);
    return promise;
};

exported.then = function (callback, key) {
    var next = this.make(callback, key);
    this.thens.subscribe(next, 'resolve');
    if (this.status > 0) {
        next.resolve.apply(next, this.result);
    }
    return next;
};

exported.catch = function (callback, key) {
    var next = this.make(callback, key);
    this.catches.subscribe(next, 'reject');
    if (this.status < 0) {
        next.reject.apply(next, this.result);
    }
    return next;
};

exported.finally = function (callback, key) {
    var next = this.make(callback, key);
    this.thens.subscribe(next, 'resolve');
    this.catches.subscribe(next, 'reject');
    if (this.status > 0) {
        next.resolve.apply(next, this.result);
    }
    if (this.status < 0) {
        next.reject.apply(next, this.result);
    }
    return next;
};

exported.execute = function (args) {
    if (typeof this.callback === "function") {
        return this.callback.apply(null, args);
    }

    return args;
};

exported.publish = function (publishers, parameters, pre, post) {
    if (!this.status) {
        this.status = pre;
        this.result = this.execute(parameters);
        publishers.map(function (publisher) {
            this[publisher].publish.apply(this[publisher], this.result);
        }.bind(this));
        this.status = post;
    }

    return this.status === post ? this.result : null;
};

exported.resolve = function () {
    return this.publish(['thens', 'finals'], arguments, 1, 2);
};

exported.reject = function () {
    return this.publish(['catches', 'finals'], arguments, -1, -2);
};
