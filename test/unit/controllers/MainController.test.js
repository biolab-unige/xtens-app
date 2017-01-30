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

    describe('GET /fileManager', function() {
        it('Should return OK 200 with the file system connection', function(done) {
            let expectedFileSystemConn = sails.hooks['persistence'].getFileSystem().defaultConnection;

            request(sails.hooks.http.app)
            .get('/fileManager')
            .expect(200)
            .end(function(err, res) {
                if (err) {
                    sails.log.error(err);
                    done(err);
                    return;
                }
                expect(res.body).to.eql(expectedFileSystemConn);
                done();
                return;
            });

        });
    });

    describe('POST /customisedData', function() {
        it('Should return OK 200 with the file system connection', function(done) {
            let expectedFileSystemConn = sails.hooks['persistence'].getFileSystem().defaultConnection;

            request(sails.hooks.http.app)
            .post('/customisedData')
            .send({
                dataType: 'TEST'
            })
            .expect(200)
            .end(function(err, res) {
                // console.log(err,res);
                if (err) {
                    sails.log.error(err);
                    done(err);
                    return;
                }
                // expect(res.body).to.eql(expectedFileSystemConn);
                done();
                return;
            });

        });
    });
});
