
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
        loginHelper.loginStandardUser(request, function (bearerToken) {
            token = bearerToken;
            sails.log.debug(`Got token: ${token}`);
            done();
            return;
        });
    });


    describe('PATCH /operator', function() {

        it('Should return 204 No Content, Password Updated', function(done) {

            const demouser = fixtures.operator[2];
            const passport = _.find(fixtures.passport, {
                'user': demouser.id,
                'protocol': 'local'});

            // console.log(demouser);

            request(sails.hooks.http.app)
            .patch('/operator')
            .set('Authorization', `Bearer ${token}`)
            .send({
                oldPass: passport.password,
                newPass: "NewPassword",
                cnewPass: "NewPassword"
            })
            .expect(204)
            .end(function(err, res) {
                expect(res.body).to.be.empty;
                if (err) {
                    sails.log.console.error(err);
                    done(err);
                    return;
                }
                done();
                return;
            });
        });
        it('Should return 400 bad Request, Old Password and New Password can not match', function(done) {
            const expectedMessage = 'New Password and Old Password cannot be the same';
            const demouser = fixtures.operator[2];
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
          .expect(400)
          .end(function(err, res) {
              expect(res).to.be.error;
              expect(res.body.error.message).to.eql(expectedMessage);

              if (err) {
                  sails.log.console.error(err);
                  done(err);
                  return;
              }
              done();
              return;
          });
        });

        it('Should return 400 bad Request, Old Password  Wrong', function(done) {

            const expectedMessage = 'Old Password does not match';
            const demouser = fixtures.operator[2];

            request(sails.hooks.http.app)
          .patch('/operator')
          .set('Authorization', `Bearer ${token}`)
          .send({
              oldPass: "WrongOldPass",
              newPass: "NewPassword",
              cnewPass: "NewPassword"
          })
          .expect(400)
          .end(function(err, res) {
              // console.log(res.body);
              expect(res).to.be.error;
              expect(res.body.error.message).to.eql(expectedMessage);

              if (err) {
                  sails.log.console.error(err);
                  done(err);
                  return;
              }
              done();
              return;
          });
        });

        it('Should return 400 bad Request, New Password and Confirm Confirm New Password do not match', function(done) {

            const expectedMessage = 'New Passwords do not match';
            const demouser = fixtures.operator[2];
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
        .expect(400).end(function(err, res) {
            // console.log(res.body);
            expect(res).to.be.error;
            expect(res.body.error.message).to.eql(expectedMessage);

            if (err) {
                sails.log.console.error(err);
                done(err);
                return;
            }
            done();
            return;
        });
        });
    });
});
