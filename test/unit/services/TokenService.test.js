/* globals _, sails, fixtures, TokenService */
"use strict";
let expect = require('chai').expect;

describe('TokenService', function() {

    describe('#issue', function() {

        it("should return a new token", function(done) {

            let payload = {
                id: 2,
                isWheel: false,
                isAdmin: true,
                canAccessPersonalData: false,
                canAccessSensitiveData: true };

            let prevToken = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpZCI6MiwiaXNXaGVlbCI6ZmFsc2UsImlzQWRtaW4iOnRydWUsImNhbkFjY2Vzc1BlcnNvbmFsRGF0YSI6ZmFsc2UsImNhbkFjY2Vzc1NlbnNpdGl2ZURhdGEiOnRydWUsImlhdCI6MTQ4MTg4MTEyOH0.q5-L1hBjbvzNwcQDx1VZSHoVW2olzFRnTdgZn20-zXA';

            let res =TokenService.issue(payload);

            expect(res).to.not.equal(prevToken);
            done();
            return;

        });
    });

    describe('#verify', function() {

        it("should return the expected payload", function(done) {

            let expectedRes = {
                id: 2,
                isWheel: false,
                isAdmin: true,
                canAccessPersonalData: false,
                canAccessSensitiveData: true,
                iat: 1481881128 };

            let token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpZCI6MiwiaXNXaGVlbCI6ZmFsc2UsImlzQWRtaW4iOnRydWUsImNhbkFjY2Vzc1BlcnNvbmFsRGF0YSI6ZmFsc2UsImNhbkFjY2Vzc1NlbnNpdGl2ZURhdGEiOnRydWUsImlhdCI6MTQ4MTg4MTEyOH0.q5-L1hBjbvzNwcQDx1VZSHoVW2olzFRnTdgZn20-zXA";

            TokenService.verify(token,function(err,res){
                expect(res).to.deep.equal(expectedRes);
                done();
                return;
            });
        });
    });

    describe('#getToken', function() {

        it("should return the expected payload with token passed as header info", function(done) {

            let expectedPayload = {
                id: 2,
                isWheel: false,
                isAdmin: true,
                canAccessPersonalData: false,
                canAccessSensitiveData: true };

            let req = {headers:{authorization : "Bearer eyJhbGciOiJIUzI1NiJ9.eyJpZCI6MiwiaXNXaGVlbCI6ZmFsc2UsImlzQWRtaW4iOnRydWUsImNhbkFjY2Vzc1BlcnNvbmFsRGF0YSI6ZmFsc2UsImNhbkFjY2Vzc1NlbnNpdGl2ZURhdGEiOnRydWV9.fN2R-YIT2ar7DtvzkYJOpJgw6D-X4WvesbKKDPL7ulk"}};

            TokenService.getToken(req,function(err,res){
                expect(res).to.deep.equal(expectedPayload);
                done();
                return;
            });
        });

        it("should return the expected payload with token passed as parameter", function(done) {

            let expectedPayload = {
                id: 2,
                isWheel: false,
                isAdmin: true,
                canAccessPersonalData: false,
                canAccessSensitiveData: true };
            let req = {
                baseUrl: 'http:/localhost:80',
                path: '/data',
                params: {
                    token:"eyJhbGciOiJIUzI1NiJ9.eyJpZCI6MiwiaXNXaGVlbCI6ZmFsc2UsImlzQWRtaW4iOnRydWUsImNhbkFjY2Vzc1BlcnNvbmFsRGF0YSI6ZmFsc2UsImNhbkFjY2Vzc1NlbnNpdGl2ZURhdGEiOnRydWV9.fN2R-YIT2ar7DtvzkYJOpJgw6D-X4WvesbKKDPL7ulk"
                },
                headers:{},
                param: function(par) {
                    return this.params[par];
                }
            };

            TokenService.getToken(req,(err,res) =>{
                expect(res).to.deep.equal(expectedPayload);
                done();
                return;
            });
        });

        it("should return Error: Invalid authorization header format. Format is Authorization: Bearer [token]", function(done) {

            let expectedError = "Invalid authorization header format. Format is Authorization: Bearer [token]";

            let req = {headers:{authorization : "wrongFormat"}};

            expect(TokenService.getToken.bind(TokenService.getToken,req,{},true)).to.throw(expectedError);
            done();
            return;
        });

        it("should return Error: 'No authorization header was found'", function(done) {

            let expectedError = "No authorization header was found";

            let req = {
                baseUrl: 'http:/localhost:80',
                path: '/data',
                params: {},
                headers:{},
                param: function(par) {
                    return this.params[par];
                }
            };

            expect(TokenService.getToken.bind(TokenService.getToken,req,{},true)).to.throw(expectedError);
            done();
            return;
        });
    });

});
