
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
        loginHelper.login(request, function (bearerToken) {
            token = bearerToken;
            sails.log.debug(`Got token: ${token}`);
            done();
        });
    });


    describe('PATCH /updatePassword', function() {
        it('Should return OK 200, Password Updated', function(done) {

          const admin = fixtures.operator[0];
          const passport = _.find(fixtures.passport, {
              'user': admin.id,
              'protocol': 'local'});

            request(sails.hooks.http.app)
            .patch('/updatePassword')
            .set('Authorization', `Bearer ${token}`)
            .send({
                oldPass: passport.password,
                newPass: "NewPassword",
                cnewPass: "NewPassword"
                })
            .expect(200, done);
        });

        it('Should return 400 bad Request, Old Password  Wrong', function(done) {

          const admin = fixtures.operator[0];

          request(sails.hooks.http.app)
          .patch('/updatePassword')
          .set('Authorization', `Bearer ${token}`)
          .send({
            oldPass: "WrongOldPass",
            newPass: "NewPassword",
            cnewPass: "NewPassword"
              })
          .expect(400, done);
      });
      it('Should return 400 bad Request, New Password and Confirm Confirm New Password do not match', function(done) {

        const admin = fixtures.operator[0];
        const passport = _.find(fixtures.passport, {
            'user': admin.id,
            'protocol': 'local'});

        request(sails.hooks.http.app)
        .patch('/updatePassword')
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
