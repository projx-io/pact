var Class = 'Promise';
var Promise = require('../src/' + Class + '.js').PromiseTest;

describe(Class, function () {
    var promise;
    var callbacks;

    beforeEach(function () {
        promise = Promise.make();

        callbacks = {
            notice: function () {
                return arguments;
            },
            then: function () {
                return arguments;
            },
            catch: function () {
                return arguments;
            },
            finally: function () {
                return arguments;
            }
        };

        spyOn(callbacks, 'notice');
        spyOn(callbacks, 'then');
        spyOn(callbacks, 'catch');
        spyOn(callbacks, 'finally');
    });

    it('should make a promise', function () {
        expect(Promise.isPrototypeOf(promise)).toBeTruthy();
    });

    describe('root nodes', function () {
        it('should have a self assigned root node', function () {
            expect(promise.root).toBe(promise);
        });

        it('should only invoke nodes that are listening for that event', function () {
            promise.notice(callbacks.notice);
            promise.then(callbacks.then);
            promise.catch(callbacks.catch);
            promise.finally(callbacks.finally);
            promise.resolve(5);

            expect(callbacks.notice).not.toHaveBeenCalled();
            expect(callbacks.then).toHaveBeenCalledWith(5);
            expect(callbacks.catch).not.toHaveBeenCalled();
            expect(callbacks.finally).toHaveBeenCalledWith(5);
        });

        it('should invoke callbacks with the resolved arguments', function () {
            var assert = {
                expect: function (a, b, c) {
                    expect(a).toBe(5);
                    expect(b).toBe(6);
                    expect(c).toBe(7);
                }
            };
            spyOn(assert, 'expect');
            promise.also(assert.expect.bind(assert)).resolve(5, 6, 7);
            expect(assert.expect).toHaveBeenCalledWith(5, 6, 7);
        });

        it('should return arguments as the resolved value', function () {
            promise.then().with(0).expect(5).resolve(5, 6, 7);
        });

        it('should return arguments as the resolved value', function () {
            promise.then().with(1).expect(6).resolve(5, 6, 7);
        });
    });
});
