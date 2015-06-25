var Class = 'Publisher';
var Publisher = require('../src/' + Class + '.js');

var Subscriber = {
    on: function () {
        return arguments;
    }
};

describe(Class, function () {
    var a = null;
    var b = null;
    var A1 = null;
    var A2 = null;
    var B1 = null;

    beforeEach(function () {
        a = Publisher.make();
        b = Publisher.make();
        A1 = Object.create(Subscriber);
        A2 = Object.create(Subscriber);
        B1 = Object.create(Subscriber);
        spyOn(A1, 'on');
        spyOn(A2, 'on');
        spyOn(B1, 'on');
    });

    it('should be defined', function () {
        expect(Publisher).toBeDefined();
    });

    it('make should have made a publisher', function () {
        expect(Publisher.isPrototypeOf(a)).toBeTruthy();
        expect(Publisher.isPrototypeOf(b)).toBeTruthy();
    });

    it('should have a separate subscriber arrays for different instances', function () {
        expect(a.subscribers).not.toBe(Publisher.subscribers);
        expect(a.subscribers).not.toBe(b.subscribers);
    });

    it('should not publish to a subscriber if none are added', function () {
        a.publish(1, 2, 3);
        b.publish(4, 5, 6);

        expect(A1.on).not.toHaveBeenCalled();
        expect(A2.on).not.toHaveBeenCalled();
        expect(B1.on).not.toHaveBeenCalled();
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

        it('should publish its own subscribers', function () {
            a.publish(1, 2, 3);

            expect(A1.on).toHaveBeenCalledWith(1, 2, 3);
            expect(A2.on).toHaveBeenCalledWith(1, 2, 3);
            expect(B1.on).not.toHaveBeenCalled();
        });
    });
});
