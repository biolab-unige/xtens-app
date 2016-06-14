var expect = require("chai").expect;

describe("Operator", function() {

    describe("formatForTokenPayload", function() {

        it("should build up the correct token payload for superadmin", function(done) {

            Operator.findOne({login: 'superadmin'}).populate('groups').then(function(operator) {
                var payload = operator.formatForTokenPayload();
                expect(payload.id).to.equals(1);
                expect(payload.isWheel).to.equals(true);
                expect(payload.isAdmin).to.equals(true);
                expect(payload.canAccessPersonalData).to.equals(true);
                expect(payload.canAccessSensitiveData).to.equals(true);
                done();
            });

        });

        it("should build up the correct token payload for adminuser", function(done) {

            Operator.findOne({login: 'adminuser'}).populate('groups').then(function(operator) {
                var payload = operator.formatForTokenPayload();
                expect(payload.id).to.equals(2);
                expect(payload.isWheel).to.equals(false);
                expect(payload.isAdmin).to.equals(true);
                expect(payload.canAccessPersonalData).to.equals(false);
                expect(payload.canAccessSensitiveData).to.equals(true);
                done();
            });
        });
        it("should build up the correct token payload for standard user", function(done) {

            Operator.findOne({login: 'demouser'}).populate('groups').then(function(operator) {
                var payload = operator.formatForTokenPayload();
                expect(payload.id).to.equals(3);
                expect(payload.isWheel).to.equals(false);
                expect(payload.isAdmin).to.equals(false);
                expect(payload.canAccessPersonalData).to.equals(false);
                expect(payload.canAccessSensitiveData).to.equals(false);
                done();
            });

        });

    });

});
