var prototype = require('./Publisher.js');
var exported = Object.create(prototype);
module.exports = exported;

exported.make = function (guarded) {
    var publisher = prototype.make.apply(this);
    publisher.guarded = guarded || false;
    return publisher;
};

exported.guard = function () {
    return this.setGuarded(true);
};

exported.setGuarded = function (value) {
    this.guarded = value;
    return this;
};

exported.unguard = function () {
    return this.setGuarded(false);
};

exported.publish = function () {
    if (!this.guarded) {
        prototype.publish.apply(this, arguments);
    }
};
