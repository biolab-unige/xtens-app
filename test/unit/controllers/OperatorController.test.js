
/* jshint node: true */
/* jshint mocha: true */
/* globals _, sails, fixtures */
"use strict";

const expect = require("chai").expect;
const request = require('supertest');
const loginHelper = require('./loginHelper');

describe('OperatorController', function() {
    let tokenS, tokenSA;

    before(function(done) {
        loginHelper.loginSuperAdmin(request, function (bearerToken) {
            tokenSA = bearerToken;
            sails.log.debug(`Got token: ${tokenSA}`);


            loginHelper.loginStandardUser(request, function (bearerToken) {
                tokenS = bearerToken;
                sails.log.debug(`Got token: ${tokenS}`);
                done();
                return;
            });
        });
    });

    describe('POST /operator', function() {
        it('Should return OK 201', function(done) {
            let expectedOperator = {
                firstName: 'new Operator',
                lastName: 'Operator',
                sex: 'M',
                email: 'operator@domain.com',
                login: 'newoperator'
            };
            request(sails.hooks.http.app)
            .post('/operator')
            .set('Authorization', `Bearer ${tokenSA}`)
            .send({
                firstName: 'new Operator',
                lastName: 'Operator',
                birthDate: '1900-01-01',
                sex: 'M',
                email: 'operator@domain.com',
                laboratory: "Laboratory",
                phone: "0001 3237632",
                login: 'newoperator',
                password: 'pswdoperator'
            })
            .expect(201)
            .end(function(err, res) {
                if (err) {
                    sails.log.error(expectedOperator);
                    done(err);
                    return;

                }
                let resOperator = res.body;
                expect(resOperator.firstName).to.eql(expectedOperator.firstName);
                expect(resOperator.lastName).to.eql(expectedOperator.lastName);
                expect(resOperator.sex).to.eql(expectedOperator.sex);
                expect(resOperator.email).to.eql(expectedOperator.email);
                expect(resOperator.login).to.eql(expectedOperator.login);
                done();
                return;
            });

        });

        // it('Should return 400, Wrong Model', function(done) {
        //
        //     request(sails.hooks.http.app)
        //     .post('/operator')
        //     .set('Authorization', `Bearer ${tokenSA}`)
        //     .send({
        //         type: 3,
        //         metadata: {},
        //         date: "2015-12-06",
        //         tags: [],
        //         notes: "New operator"
        //     })
        //     .expect(400);
        //     done();
        //     return;
        //
        // });
    });

    describe('PATCH /operator', function() {

        it('Should return 204 No Content, Password Updated', function(done) {

            const demouser = fixtures.operator[2];
            const passport = _.find(fixtures.passport, {
                'user': demouser.id,
                'protocol': 'local'});

            console.log(demouser,passport);

            request(sails.hooks.http.app)
            .patch('/operator')
            .set('Authorization', `Bearer ${tokenS}`)
            .send({
                oldPass: passport.password,
                newPass: "NewPassword",
                cnewPass: "NewPassword"
            })
            .expect(204)
            .end(function(err, res) {
                expect(res.body).to.be.empty;
                if (err) {
                    sails.log.error(err);
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
          .set('Authorization', `Bearer ${tokenS}`)
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
                  sails.log.error(err);
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
          .set('Authorization', `Bearer ${tokenS}`)
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
                  sails.log.error(err);
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
        .set('Authorization', `Bearer ${tokenS}`)
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
                sails.log.error(err);
                done(err);
                return;
            }
            done();
            return;
        });
        });
    });
});
