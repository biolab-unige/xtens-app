/* jshint node: true */
/* jshint mocha: true */
/* globals _, sails, fixtures, Passport, PassportService */
"use strict";
const sinon = require("sinon");
const expect = require("chai").expect;
const request = require('supertest');
const loginHelper = require("../../controllers/loginHelper");
const ValidationError = require('xtens-utils').Errors.ValidationError;
const BluebirdPromise = require('bluebird');


describe("PassportService protocol Local", function() {

    let token;
    let passport;
    before(function(done) {
        loginHelper.loginStandardUser(request, function (bearerToken) {
            token = bearerToken;
            sails.log.debug(`Got token: ${token}`);
            done();
            return;
        });

    });

    describe("#updatePassword", function() {


        var spyFindPassp, spyValPassw, spyUpPassp, expectedError;

        beforeEach(function() {
            spyFindPassp = sinon.spy(Passport,'findOne');
            spyUpPassp = sinon.spy(Passport,'update');
        });

        afterEach(function() {
            Passport.findOne.restore();
            Passport.update.restore();
        });
        it("Should fire Passport.findOne with the correct input parameters", function(done) {

            const demouser =fixtures.operator[0];
            const passportlocal = _.find(fixtures.passport, {
                'user': demouser.id,
                'protocol': 'local'});
            const param ={
                oldPass: passportlocal.password,
                newPass: "NewPassword",
                cnewPass: "NewPassword"
            };
            const expectedParam={
                protocol: 'local',
                user: demouser.id};

            // passport.password = param.newPass;

            PassportService.protocols.local.updatePassword(param,demouser.id,function (err,res) {
                if(err){
                    console.log(err);
                    done(err);
                }
                console.log("Password updated: " + res);
                sinon.assert.calledWith(spyFindPassp, expectedParam);
                expect(spyFindPassp.called).to.be.true;
                expect(spyUpPassp.called).to.be.true;
                done();
                return;
            });


        });


    });
});
