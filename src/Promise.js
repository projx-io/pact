var exported = {};
module.exports = exported;

exported.make = function () {
    return this.makeRoot();
};

exported.makeRoot = function () {
    var promise = Object.create(this);
    promise.root = promise;
    promise.children = [];
    promise.branch = promise;
    promise.types = true;
    return promise;
};

exported.makeBranch = function (callback, types) {
    var promise = Object.create(this.branch);
    promise.callback = callback;
    promise.children = [];
    promise.branch = promise;
    promise.types = types || [];
    this.children.push(promise);
    return promise;
};

exported.makeNode = function (callback, types) {
    var promise = Object.create(this);
    promise.callback = callback;
    promise.children = [];
    promise.branch = this.branch;
    this.children.push(promise);
    return promise;
};

exported.run = function (type) {
    if (this.types === true || this.types.indexOf(type) >= 0) {
        if (typeof this.callback === "function") {
            this.result = this.callback.apply(null, this.result);
        }
    }

    this.children.map(function (child) {
        child.run(type);
    }.bind(this));

    return this.result;
};

exported.addType = function (key, events, blocks) {
    blocks = blocks || [];

    this[key] = function () {
        this.root.result = arguments;

        events.map(function (event) {
            this.root.run(event);
        }.bind(this));

        blocks.map(function (block) {
            this.root[block] = function () {
                return this.result;
            };
        }.bind(this));
    };
};

exported.addBranch = function (key, types) {
    this[key] = function (callback) {
        return this.makeBranch(callback, types);
    };
};

exported.addNode = function (key, callback) {
    this[key] = callback;
};

exported.addType('resolve', ['resolve.start', 'resolve.finish'], ['resolve', 'reject', 'notify']);
exported.addType('reject', ['reject.start', 'reject.finish'], ['resolve', 'reject', 'notify']);
exported.addType('notify', ['notify'], []);

exported.addBranch('then', ['resolve.start']);
exported.addBranch('catch', ['reject.start']);
exported.addBranch('finally', ['resolve.finish', 'reject.finish']);
exported.addBranch('notice', ['notify']);

exported.addNode('also', function (callback) {
    return this.makeNode(callback);
});

exported.addNode('with', function () {
    var keys = arguments;
    return this.makeNode(function (object) {
        for (var i in keys) {
            object = object[keys[i]];
        }
        return [object];
    });
});

exported.addNode('expect', function (expected) {
    return this.makeNode(function (actual) {
        expect(actual).toBe(expected);
        return actual;
    });
});

exported.addNode('debug', function (message) {
    return this.makeNode(function () {
        console.log(message, '>>', arguments);
        return arguments;
    });
});

exported.addNode('stringify', function () {
    return this.makeNode(function (value) {
        return [JSON.stringify(value)];
    });
});

