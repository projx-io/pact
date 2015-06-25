var Class = 'Promise';
var Promise = require('../src/' + Class + '.js');

var Subscriber = {
    on: function () {
        return arguments;
    }
};

function log(a) {
    return function (b) {
        console.log(a, 'with', arguments);
        return [a];
    };
}

describe(Class, function () {
    var promise = Promise.make();
    var value = {
        "a": {
            "b": {
                "c": 2
            }
        }
    };

    promise
        .then().debug('some message').stringify().debug('another message').expect(JSON.stringify(value))
        .then().with('a').stringify().expect(JSON.stringify(value.a))
        .then().with('a', 'b').stringify().expect(JSON.stringify(value.a.b))
        .then().with('a').with('b').with('c').expect(2)
        .then().with('a').with('b').with('c').expect('this should fail.')
        .then().with('a').with('b').with('c').expect('this should fail as well.')
    ;

    promise.notify('A');
    console.log();
    promise.resolve(value);
    console.log();
    promise.reject('C');
    console.log();
});
