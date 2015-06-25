var prototype = {};
var exported = Object.create(prototype);
module.exports = exported;

exported.make = function () {
    var publisher = Object.create(this);
    publisher.subscribers = [];
    return publisher;
};

exported.bind = function (object, key) {
    return key ? object[key].bind(object) : object;
};

exported.publish = function () {
    var args = arguments;
    this.subscribers.map(function (subscriber) {
        this.publishTo(subscriber, args);
    }.bind(this));
};

exported.publishTo = function (subscriber, args) {
    subscriber.apply(null, args);
};

exported.subscribe = function (object, key) {
    this.subscribers.push(this.bind(object, key));
};

