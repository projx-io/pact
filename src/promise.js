var Publisher = {
    make: function () {
        var publisher = Object.create(this);
        publisher.subscribers = [];
        return publisher;
    },
    publish: function () {
        var args = arguments;
        this.subscribers.map(function (subscriber) {
            subscriber.apply(null, args);
        });
    },
    subscribe: function (object, key) {
        this.subscribers.push(key ? object[key].bind(object) : object);
    }
};


var Promise = {
    make: function (callback, key) {
        var promise = Object.create(this);
        promise.status = 0;
        promise.result = null;
        promise.callback = key ? callback[key].bind(callback) : callback;
        promise.thens = Publisher.make();
        promise.catches = Publisher.make();
        promise.finals = Publisher.make();
        return promise;
    },
    then: function (callback, key) {
        var next = this.make(callback, key);
        this.thens.subscribe(next, 'resolve');
        if (this.status > 0) {
            next.resolve.apply(next, this.result);
        }
        return next;
    },
    catch: function (callback, key) {
        var next = this.make(callback, key);
        this.catches.subscribe(next, 'reject');
        if (this.status < 0) {
            next.reject.apply(next, this.result);
        }
        return next;
    },
    finally: function (callback, key) {
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
    },
    execute: function (args) {
        if (typeof this.callback === "function") {
            return this.callback.apply(null, args);
        }

        return args;
    },
    publish: function (publishers, parameters, pre, post) {
        if (!this.status) {
            this.status = pre;
            this.result = this.execute(parameters);
            publishers.map(function (publisher) {
                this[publisher].publish.apply(this[publisher], this.result);
            }.bind(this));
            this.status = post;
        }

        return this.status === post ? this.result : null;
    },
    resolve: function () {
        return this.publish(['thens', 'finals'], arguments, 1, 2);
    },
    reject: function () {
        return this.publish(['catches', 'finals'], arguments, -1, -2);
    }
};


module.exports = {
    Publisher: Publisher,
    Promise: Promise
};
