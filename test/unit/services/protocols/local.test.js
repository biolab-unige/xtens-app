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
        });

        const demouser =fixtures.operator[0];

        Passport.findOne({
            protocol: 'local',
            user: demouser.id
        }).then(function(res){
            passport=res;
            // console.log("Passport found: "+ JSON.stringify(passport));
            return true;
        }).catch(function(err){return false;});

    });

    const foundRecords = [
        {"type": "sometype", "metadata": {"somemetadata": {"value": "val"}}},
        {"type": "sometype", "metadata": {"someothermetadata": {"value": "val"}}}
    ];

    const callback = sinon.stub();
    callback.withArgs(new Error,false).returns("Got an error");
    callback.withArgs(new ValidationError('Old Password do Not Match'),false).returns("Wrong Old Password");
    callback.withArgs(new ValidationError('New Passwords do Not Match'),false).returns("Not Match Password");
    callback.withArgs(null, foundRecords).returns(foundRecords);
    callback.returns(1);

    describe("#updatePassword", function() {


        var spyFindPassp, spyValPassw, spyUpPassp, expectedError;

        beforeEach(function() {

            spyFindPassp = sinon.spy(Passport,'findOne');
            spyUpPassp = sinon.spy(Passport,'update');
            spyValPassw = sinon.stub(passport,'validatePassword',function() {
                return BluebirdPromise.try(function() { return [1]; }); });
        });

        afterEach(function() {
            Passport.findOne.restore();
            Passport.update.restore();
            passport.validatePassword.restore();
        });
        it("Should fire Passport.findOne with the correct input parameters", function() {

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

            passport.password = param.newPass;

            PassportService.protocols.local.updatePassword(param,demouser.id,callback);

            //sinon.assert.calledOnce(spyFindPassp);
            sinon.assert.calledWith(spyFindPassp, expectedParam);
            expect(spyFindPassp.called).to.be.true;


        });


    });
});
