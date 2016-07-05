/* jshint node: true */
/* jshint mocha: true */
/* globals _, sails, fixtures */
"use strict";
const sinon = require('sinon');
const expect = require("chai").expect;
const request = require('supertest');
const loginHelper = require('../controllers/loginHelper');

describe('Policy isWheel', function() {

    let tokenSA, tokenA, isWheel;

    let res ={forbidden:function (){return 0;}};
    let spyForb = sinon.spy(res,'forbidden');
    let spy = sinon.spy();

    before(function(done) {

        loginHelper.loginSuperAdmin(request, function (bearerToken) {
            tokenSA = bearerToken;
            sails.log.debug(`Got token: ${tokenSA}`);
        });

        loginHelper.loginAdminUser (request, function (bearerToken) {
            tokenA = bearerToken;
            done();
        });

        isWheel = global.sails.hooks.policies.middleware.iswheel;
    });

    describe('When the policy is invoked', function() {
        it('Should pass at next () and not call res forbidden, user is a SuperUser', function (done) {

            let headers= {
                authorization: 'Bearer ' + tokenSA
            };
            let req={headers};

            isWheel(req, res, spy);

            expect(spy.calledOnce).to.be.true;
            expect(spyForb.calledOnce).to.be.false;
            done();

        });

        it('Should call res.forbidden, user is not a SuperUser', function (done) {

            let headers= {
                authorization: 'Bearer ' + tokenA
            };

            let req={headers};

            isWheel(req, res, spy);

            expect(spyForb.calledOnce).to.be.true;
            done();
        });
    });

});
