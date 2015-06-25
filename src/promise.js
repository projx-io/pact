var Publisher = {
    subscribers: [],
    publish: function () {
        var args = arguments;
        this.subscribers.map(function (subscriber) {
            subscriber[this.key].apply(subscriber, args);
        }.bind(this));
    }
};

var Promise = {
    then: function (callback) {
        var next = this.make(callback);
        this.thens.push(next);

        if (this.status > 0) {
            next.resolve.apply(next, this.values);
        }

        return next;
    },
    catch: function (callback) {
        var next = this.make(callback);
        this.catches.push(next);

        if (this.status < 0) {
            next.reject.apply(next, this.values);
        }

        return next;
    },
    finally: function (callback) {
        var next = this.make(callback);
        this.finals.push(next);
        return next;
    },
    resolve: function () {
        if (!this.status) {
            this.status++;
            var values = arguments;

            if (typeof this.callback === "function") {
                values = this.callback.apply(null, values);
            }

            this.values = values;

            ['thens', 'finals'].map(function (key) {
                this[key].map(function (next) {
                    next.resolve.apply(next, values);
                });
            }.bind(this));
            this.status++;
        }

        return this.values;
    },
    reject: function () {
        if (!this.status) {
            this.status--;
            var values = arguments;

            if (typeof this.callback === "function") {
                values = this.callback.apply(null, values);
            }

            this.values = values;

            ['catches', 'finals'].map(function (key) {
                this[key].map(function (next) {
                    next.reject.apply(next, values);
                });
            }.bind(this));
            this.status--;
        }

        return this.values;
    },
    make: function (callback) {
        var promise = Object.create(Promise);
        promise.callback = callback;
        promise.status = 0;
        promise.values = null;
        promise.thens = [];
        promise.catches = [];
        promise.finals = [];
        return promise;
    },
    reset: function () {
        this.status = 0;
        this.values = null;
        ['thens', 'catches', 'finals'].map(function (key) {
            this[key].map(function (child) {
                child.reset();
            });
        }.bind(this));
    }
};

module.exports = {
    Promise: Promise
};