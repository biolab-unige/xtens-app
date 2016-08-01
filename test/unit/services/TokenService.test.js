var expect = require('chai').expect,
    sinon = require('sinon');
var JsonWebTokenError = require('../../../node_modules/jsonwebtoken/lib/JsonWebTokenError.js');
describe('TokenService', function() {

    describe('#getToken', function() {

        it("should return the expected payload", function(done) {

            var expectedPayload = {
                id: 2,
                isWheel: false,
                isAdmin: true,
                canAccessPersonalData: false,
                canAccessSensitiveData: true };

            var req = {headers:{authorization : "Bearer eyJhbGciOiJIUzI1NiJ9.eyJpZCI6MiwiaXNXaGVlbCI6ZmFsc2UsImlzQWRtaW4iOnRydWUsImNhbkFjY2Vzc1BlcnNvbmFsRGF0YSI6ZmFsc2UsImNhbkFjY2Vzc1NlbnNpdGl2ZURhdGEiOnRydWV9.fN2R-YIT2ar7DtvzkYJOpJgw6D-X4WvesbKKDPL7ulk"}};

            TokenService.getToken(req,function(err,res){
                console.log(res);
                expect(res).to.deep.equal(expectedPayload);
                done();
            });
        });

        it("should return Error: JsonWebTokenError: invalid token", function(done) {

            var expectedError = new JsonWebTokenError("invalid token");

            var req = {headers:{authorization : "Bearer eyJhbGciOiJIUzI1.eyJpZCI6MiwiaXNXaGVlbCI6ZmFsc2UsImlzQWRtaW4iOnRydWUsImNhbkFjY2Vzc1BlcnNvbmFsRGF0YSI6ZmFsc2UsImNhbkFjY2Vzc1NlbnNpdGl2ZURhdGEiOnRydWV9.fN2R-YIT2ar7DtvzkYJOpJgw6D-X4WvesbKKDPL7ulk"}};

            TokenService.getToken(req,function(res){
                console.log(res);
                expect(res).to.deep.equal(expectedError);
                done();
            });
        });
        it("should return Error: JsonWebTokenError: jwt malformed", function(done) {

            var expectedError = new JsonWebTokenError("jwt malformed");

            var req = {headers:{authorization : "Bearer eyJhbGciOiJIUzI1NiJ9-eyJpZCI6MiwiaXNXaGVlbCI6ZmFsc2UsImlzQWRtaW4iOnRydWUsImNhbkFjY2Vzc1BlcnNvbmFsRGF0YSI6ZmFsc2UsImNhbkFjY2Vzc1NlbnNpdGl2ZURhdGEiOnRydWV9.fN2R-YIT2ar7DtvzkYJOpJgw6D-X4WvesbKKDPL7ulk"}};

            TokenService.getToken(req,function(res){
                console.log(res);
                expect(res).to.deep.equal(expectedError);
                done();
            });
        });
    });


});
