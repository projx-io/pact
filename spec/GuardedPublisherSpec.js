var Class = 'GuardedPublisher';
var Publisher = require('../src/' + Class + '.js');

var Subscriber = {
    on: function () {
        return arguments;
    }
};

describe(Class, function () {
    var a = null;
    var b = null;
    var c = null;
    var A1 = null;
    var A2 = null;
    var B1 = null;
    var C1 = null;

    beforeEach(function () {
        a = Publisher.make(true);
        b = Publisher.make(true);
        c = Publisher.make();
        A1 = Object.create(Subscriber);
        A2 = Object.create(Subscriber);
        B1 = Object.create(Subscriber);
        C1 = Object.create(Subscriber);
        spyOn(A1, 'on');
        spyOn(A2, 'on');
        spyOn(B1, 'on');
        spyOn(C1, 'on');
    });

    it('make should have made a publisher', function () {
        expect(Publisher.isPrototypeOf(a)).toBeTruthy();
        expect(Publisher.isPrototypeOf(b)).toBeTruthy();
        expect(Publisher.isPrototypeOf(c)).toBeTruthy();
    });

    it('should have a separate subscriber arrays for different instances', function () {
        expect(a.subscribers).not.toBe(Publisher.subscribers);
        expect(b.subscribers).not.toBe(Publisher.subscribers);
        expect(c.subscribers).not.toBe(Publisher.subscribers);
        expect(a.subscribers).not.toBe(b.subscribers);
        expect(a.subscribers).not.toBe(c.subscribers);
        expect(b.subscribers).not.toBe(c.subscribers);
    });

    it('should not publish to a subscriber if none are added', function () {
        a.publish(1, 2, 3);
        b.publish(4, 5, 6);
        c.publish(7, 8, 9);

        expect(A1.on).not.toHaveBeenCalled();
        expect(A2.on).not.toHaveBeenCalled();
        expect(B1.on).not.toHaveBeenCalled();
        expect(C1.on).not.toHaveBeenCalled();
    });

    describe('guarding', function () {
        it('should be off by default, but configurable', function () {
            expect(a.guarded).toBeTruthy();
            expect(b.guarded).toBeTruthy();
            expect(c.guarded).toBeFalsy();
        });

        it('should be able to be turned off', function () {
            a.unguard();

            expect(a.guarded).toBeFalsy();
            expect(b.guarded).toBeTruthy();
            expect(c.guarded).toBeFalsy();
        });

        it('should be able to be turned on again', function () {
            a.unguard();
            a.guard();

            expect(a.guarded).toBeTruthy();
            expect(b.guarded).toBeTruthy();
            expect(c.guarded).toBeFalsy();
        });

        it('should be able to set guard on a condition', function () {
            a.setGuarded(true);
            b.setGuarded(false);

            expect(a.guarded).toBeTruthy();
            expect(b.guarded).toBeFalsy();

            a.setGuarded(false);
            b.setGuarded(true);

            expect(a.guarded).toBeFalsy();
            expect(b.guarded).toBeTruthy();
        });
    });

    describe('subscribe', function () {
        beforeEach(function () {
            a.subscribe(A1, 'on');
            a.subscribe(A2, 'on');
            b.subscribe(B1, 'on');
        });

        it('should have added subscriber to subscribers array', function () {
            expect(a.subscribers.length).toBe(2);
            expect(b.subscribers.length).toBe(1);
        });

        it('should have added subscriber to subscribers array', function () {
            expect(a.subscribers.length).toBe(2);
            expect(b.subscribers.length).toBe(1);
        });

        it('should not publish when guarded', function () {
            a.publish(1, 2, 3);

            expect(A1.on).not.toHaveBeenCalled();
            expect(A2.on).not.toHaveBeenCalled();
            expect(B1.on).not.toHaveBeenCalled();
            expect(C1.on).not.toHaveBeenCalled();
        });

        it('should publish when not guarded', function () {
            a.unguard().publish(1, 2, 3);

            expect(A1.on).toHaveBeenCalledWith(1, 2, 3);
            expect(A2.on).toHaveBeenCalledWith(1, 2, 3);
            expect(B1.on).not.toHaveBeenCalled();
        });
    });
});
