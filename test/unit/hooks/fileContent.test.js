/* jshint node: true */
/* jshint mocha: true */
/* globals , sails, fixtures */
"use strict";

const expect = require("chai").expect;
const request = require('supertest');
const loginHelper = require('../controllers/loginHelper');
const path = require('path');
const sinon = require('sinon');
const BluebirdPromise = require("bluebird");
const fs = require('fs');

describe('fileContent Hook', function() {

    let tokenDataSens, tokenNoDataSens, downloadFileContentAsyncStub;

    before(function(done) {
        loginHelper.loginAnotherStandardUser(request, function (bearerToken) {
            tokenDataSens = bearerToken;
            sails.log.debug(`Got token: ${tokenDataSens}`);
            done();
        });
    });

    describe('GET /fileContent', function() {
        beforeEach(function() {
            let fileSystem = BluebirdPromise.promisifyAll(sails.hooks['persistence'].getFileSystem().manager);
            downloadFileContentAsyncStub = sinon.stub(fileSystem, "downloadFileContent", function(uri, remoteRes, next) {
              
                let getRequest = fs.createReadStream(uri);

                getRequest.pipe(remoteRes);
                getRequest.on('error', function(err) {
                    console.log('irods.downloadFileContent - problem while downloading file: ' + err.message);
                    next(err);
                });

                getRequest.on('end', function() {
                    console.log("irods.downloadFileContent - file download ended");
                    next();
                });
            });
        });

        afterEach(function() {
            sails.hooks['persistence'].getFileSystem().manager.downloadFileContent.restore();
        });

        it('Should return OK 200, with the proper file', function (done) {

            let uri = fixtures.datafile[1].uri;
            let pathFrags = uri.split('/');
            let fileNameExpected = pathFrags[pathFrags.length-1];

            request(sails.hooks.http.app)
            .get('/fileContent?id=2')
            .set('Authorization', `Bearer ${tokenDataSens}`)
            .send()
            .expect(200)
            .end(function(err, res) {
                if (err) {
                    console.log(err);
                    done(err);
                }
                let fileNameReceived = res.headers['content-disposition'].split('=')[1];
                // console.log(fileNameReceived);

                expect(fileNameReceived).to.equals(fileNameExpected);
                done();
                return;
            });
        });

    });

    describe('POST /fileContent', function() {
        it('Should return OK 200, with the final destination of uploaded file', function (done) {
            let absPath = path.dirname(process.mainModule.filename);
            let absPathFrag = absPath.split('node_modules');
            let uri = "test/resources/gene-file-test.csv";
            let pathFrags = uri.split('/');
            let fileName = pathFrags[pathFrags.length-1];
            let landingDest = absPathFrag[0].concat('assets/dataFiles/tmp/');
            let finalDestExpected = landingDest.concat(fileName);

            request(sails.hooks.http.app)
            .post('/fileContent')
            .attach('uploadFile', uri)
            .set('Authorization', `Bearer ${tokenDataSens}`)
            .send()
            .expect(200)
            .end(function(err, res) {
                if (err) {
                    console.log(err);
                    done(err);
                }

                let finaldest = res.body.name.fd;
                // console.log(finaldest);

                expect(finaldest).to.equals(finalDestExpected);
                done();
            });
        });

    });


});
