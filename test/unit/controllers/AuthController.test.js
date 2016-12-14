/* jshint node: true */
/* jshint mocha: true */
/* globals _, sails, fixtures, Passport */
"use strict";

const expect = require("chai").expect;
const request = require('supertest');
const loginHelper = require('./loginHelper');

describe('AuthController', function() {

    describe('POST /login', function() {
        it('Should return OK 200 with the logged operator and his token', function(done) {
            const expectedOperator = _.cloneDeep(fixtures.operator[5]);
            const expectedToken = 'eyJhbGciOiJIUzI1NiJ9.eyJpZCI6NiwiaXNXaGVlbCI6ZmFsc2UsImlzQWRtaW4iOnRydWUsImNhbkFjY2Vzc1BlcnNvbmFsRGF0YSI6ZmFsc2UsImNhbkFjY2Vzc1NlbnNpdGl2ZURhdGEiOnRydWV9.wuvIlcIUzkExIZXNGE3a5dpC1dHX51ZwlOZPyQeSuVw';
            const passport = _.find(fixtures.passport, {
                'user': expectedOperator.id,
                'protocol': 'local'
            });

            let username = expectedOperator.login;
            let password = passport.password;

            request(sails.hooks.http.app)
            .post('/login')
            .send({
                identifier: username,
                password: password
            })
            .expect(200)
            .end(function(err, res) {
                if (err) {
                    sails.log.error(err);
                    done(err);
                    return;
                }
                expect(res.body.user).to.exist;
                expect(res.body.user.id).to.eql(expectedOperator.id);
                expect(res.body.user.groups[0].id).to.eql(expectedOperator.groups[0]);
                expect(res.body.user.email).to.eql(expectedOperator.email);
                expect(res.body.user.login).to.eql(expectedOperator.login);
                expect(res.body.token).to.exist;
                expect(res.body.token).to.eql(expectedToken);
                done();
                return;
            });
        });

        it('Should return UNAUTHORIZED 401 - User authentication failed', function(done) {
            const operator = _.cloneDeep(fixtures.operator[5]);
            const expectedMessage = "User authentication failed";
            let username = operator.login;
            let password = "wrongPassword";

            request(sails.hooks.http.app)
            .post('/login')
            .send({
                identifier: username,
                password: password
            })
            .expect(401)
            .end(function(err, res) {
                if (err) {
                    sails.log.error(err);
                    done(err);
                    return;
                }
                expect(res.body.message).to.exist;
                expect(res.body.message).to.eql(expectedMessage);
                done();
                return;
            });
        });
    });

    describe('POST /logout', function() {
        it('Should return OK 200 with the file system connection', function(done) {
            const operator = _.cloneDeep(fixtures.operator[5]);
            const passport = _.find(fixtures.passport, {
                'user': operator.id,
                'protocol': 'local'
            });
            const accessToken = passport.accessToken;
            request(sails.hooks.http.app)
            .post('/logout')
            .send({
                user: operator
            })
            .expect(200)
            .end(function(err, res) {
                console.log(err,res.body);
                if (err) {
                    sails.log.error(err);
                    done(err);
                    return;
                }
                Passport.findOne({user:operator.id}).then(function (result) {
                    console.log(result);
                    expect(result.accessToken).to.not.eql(accessToken);
                    done();
                    return;
                });
            });
        });

        it('Should return Error 500 - Caught some error while disconnecting the user', function(done) {

            const expectedMessage = "Caught some error while disconnecting the user";

            request(sails.hooks.http.app)
            .post('/logout')
            .send({
                user: {}
            })
            .expect(500)
            .end(function(err, res) {
                if (err) {
                    sails.log.error(err);
                    done(err);
                    return;
                }
                expect(res.body.error).to.exist;
                expect(res.body.error).to.eql(expectedMessage);
                done();
                return;
            });
        });
    });
});
