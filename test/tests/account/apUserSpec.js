describe('apUser', function () {
    beforeEach(module('app'));

    describe('isAdmin', function () {
        it('should return false if the roles array does not have an admin entry', inject(function (apUser) {
            var user = new apUser();
            user.roles = ['not admin'];
            expect(user.isAdmin()).to.be.falsey;
        }));

        it('should return true if the roles array has an admin entry', inject(function(apUser) {
            var user = new apUser();
            user.roles = ['admin'];
            expect(user.isAdmin()).to.be.true;
        }));
    });
});