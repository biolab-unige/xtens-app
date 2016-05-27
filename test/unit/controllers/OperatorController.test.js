
/* jshint node: true */
/* jshint mocha: true */
/* globals _, sails, fixtures */
"use strict";

const expect = require("chai").expect;
const request = require('supertest');
const loginHelper = require('./loginHelper');

describe('OperatorController', function() {
    let token;

    before(function(done) {
        loginHelper.loginDemouser(request, function (bearerToken) {
            token = bearerToken;
            sails.log.debug(`Got token: ${token}`);
            done();
        });
    });


    describe('PATCH /operator', function() {

        it('Should return 204 No Content, Password Updated', function(done) {

            const demouser = fixtures.operator[1];
            const passport = _.find(fixtures.passport, {
                'user': demouser.id,
                'protocol': 'local'});

            console.log(demouser);

            request(sails.hooks.http.app)
            .patch('/operator')
            .set('Authorization', `Bearer ${token}`)
            .send({
                oldPass: passport.password,
                newPass: "NewPassword",
                cnewPass: "NewPassword"
            })
            .expect(204,done);

        });
        it('Should return 400 bad Request, Old Password  Wrong', function(done) {

            const demouser = fixtures.operator[1];
            const passport = _.find(fixtures.passport, {
                'user': demouser.id,
                'protocol': 'local'});

            request(sails.hooks.http.app)
          .patch('/operator')
          .set('Authorization', `Bearer ${token}`)
          .send({
              oldPass: passport.password,
              newPass: passport.password,
              cnewPass: passport.password
          })
          .expect(400, done);
        });

        it('Should return 400 bad Request, Old Password  Wrong', function(done) {

            const demouser = fixtures.operator[1];

            request(sails.hooks.http.app)
          .patch('/operator')
          .set('Authorization', `Bearer ${token}`)
          .send({
              oldPass: "WrongOldPass",
              newPass: "NewPassword",
              cnewPass: "NewPassword"
          })
          .expect(400, done);
        });
        it('Should return 400 bad Request, New Password and Confirm Confirm New Password do not match', function(done) {

            const demouser = fixtures.operator[1];
            const passport = _.find(fixtures.passport, {
                'user': demouser.id,
                'protocol': 'local'});

            request(sails.hooks.http.app)
        .patch('/operator')
        .set('Authorization', `Bearer ${token}`)
        .send({
            oldPass: passport.password,
            newPass: "NewPassword",
            cnewPass: "OtherNewPassword"
        })
        .expect(400, done);
        });
    });
});
