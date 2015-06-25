var prototype = require('./GuardedPublisher.js');
var exported = Object.create(prototype);
module.exports = exported;

exported.make = function () {
    var publisher = prototype.make.apply(this, arguments);
    publisher.arguments = [];
    return publisher;
};

exported.subscribe = function (object, key) {
    prototype.subscribe.apply(this, arguments);
    if (!this.guarded) {
        this.publishTo(this.bind(object, key), this.arguments);
    }
};

exported.publish = function () {
    if (!this.guarded) {
        this.arguments = arguments;
        prototype.publish.apply(this, arguments);
    }
};
