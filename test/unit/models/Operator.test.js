var expect = require("chai").expect;

describe("Operator", function() {
    
    describe("formatForTokenPayload", function() {
        
        it("should build up the correct token payload for admin", function(done) {

            Operator.findOne({login: 'admin'}).populate('groups').then(function(operator) {
                var payload = operator.formatForTokenPayload();
                expect(payload.id).to.equals(1);
                expect(payload.isWheel).to.equals(true);
                expect(payload.isManager).to.equals(true);
                expect(payload.canAccessPersonalData).to.equals(true);
                expect(payload.canAccessSensitiveData).to.equals(true);
                done();
            });
        
        });

        it("should build up the correct token payload for admin", function(done) {

            Operator.findOne({login: 'demouser'}).populate('groups').then(function(operator) {
                var payload = operator.formatForTokenPayload();
                expect(payload.id).to.equals(2);
                expect(payload.isWheel).to.equals(false);
                expect(payload.isManager).to.equals(false);
                expect(payload.canAccessPersonalData).to.equals(false);
                expect(payload.canAccessSensitiveData).to.equals(false);
                done();
            });
        
        });

    });

});
