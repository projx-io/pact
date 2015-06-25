var Promise = require('../src/promise.js').Promise;
var Publisher = require('../src/promise.js').Publisher;

function bind(object, key) {
    return object[key].bind(object);
}

function log() {
    return function (value) {
        console.log(this.name, value);
        return [value + ' ' + this.name];
    };
}

describe('', function () {
    var publisher = Publisher.make();
    publisher.subscribe(log('a', 'b'));
    publisher.subscribe(log('c', 'd'));

    function test(name) {
        return {
            name: name,
            on: log()
        };
    }

    var ab = {
        name: 'test',
        on: log('a', 'b')
    };

    var cd = {
        name: 'test',
        on: log('c', 'd')
    };

    var ef = {
        name: 'test',
        on: log('e', 'f')
    };

    publisher.subscribe(ab, 'on');
    publisher.subscribe(bind(ab, 'on'));
    publisher.subscribe(ab.on.bind(ab));

    //publisher.publish('hi');


    var promise = Promise.make();
    promise.then(test('a'), 'on');
    promise.then(test('a'), 'on');
    promise.then(test('b'), 'on')
    promise.then(test('b'), 'on')
        .then(test('c'), 'on')
        .then(test('d'), 'on')
        .then(test('e'), 'on')
        .then(test('f'), 'on');
    promise.then(test('b'), 'on')
        .then(test('g'), 'on')
        .then(function (a) {
            console.log(a);
        })
    ;

    promise.catch(test('z'), 'on');
    promise.finally(test('x'), 'on');

    promise.resolve('hey')
    promise.reject('hey')
    promise.resolve('hey')
    promise.resolve('hey')
    promise.resolve('hey')
    promise.resolve('hey')
    promise.resolve('hey')


});
