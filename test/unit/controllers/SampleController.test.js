/* jshint node: true */
/* jshint mocha: true */
/* globals _, sails, fixtures */
"use strict";

const expect = require("chai").expect;
const request = require('supertest');
const sinon = require('sinon');
const loginHelper = require('./loginHelper');


describe('SampleController', function() {

    let tokenS,tokenSA;

    before(function(done) {
        loginHelper.loginAdminUser(request, function (bearerToken) {
            tokenSA = bearerToken;
            sails.log.debug(`Got tokenA: ${tokenSA}`);

            loginHelper.loginAnotherStandardUserNoDataSens(request, function (bearerToken2) {
                tokenS = bearerToken2;
                sails.log.debug(`Got token: ${tokenS}`);
                done();
                return;
            });
        });
    });



    describe('POST /sample', function() {
        it('Should return OK 201, with location of new sample', function(done) {

            request(sails.hooks.http.app)
            .post('/sample')
            .set('Authorization', `Bearer ${tokenSA}`)
            .send({
                type: 2,
                biobank:2,
                biobankCode: "081852",
                donor: 11,
                metadata: {}
            })
            .expect(201)
            .end(function(err, res) {
                if (err) {
                    sails.log.error(err);
                    done(err);
                }
                var l = res.header.location;
                var loc = l.split('/');
                var location = '/' + loc[3]+ '/' + loc[4];
                expect(location).to.equals('/sample/3');
                done();
                return;
            });


        });

        it('Should return 400, Wrong Model', function(done) {

            request(sails.hooks.http.app)
            .post('/sample')
            .set('Authorization', `Bearer ${tokenSA}`)
            .send({
                type: 3,
                biobank:2,
                biobankCode: "081852",
                donor: 11,
                metadata: {}
            })
            .expect(400);
            done();
            return;

        });
    });

    describe('PUT /sample', function() {
        it('Should return OK 200, biobank Updated', function(done) {

            const biobank = 1;

            request(sails.hooks.http.app)
            .put('/sample/3')
            .set('Authorization', `Bearer ${tokenSA}`)
            .send({
                type: 2,
                biobank: biobank,
                biobankCode: "081852",
                donor: 11,
                metadata: {}
            }).expect(200)
            .end(function(err, res) {
                sails.log(res.body[0].biobank);
                expect(res.body[0].biobank).to.equals(biobank);
                if (err) {
                    done(err);
                    return;
                }
                done();
                return;
            });

        });

        it('Should return 400, Wrong Model', function(done) {

            request(sails.hooks.http.app)
            .put('/sample/3')
            .set('Authorization', `Bearer ${tokenSA}`)
            .send({
                type: 3,
                biobank:14,
                biobankCode: "081852",
                donor: 11,
                metadata: {}
            })
            .expect(400);
            done();
            return;
        });
    });

    describe('GET /sample', function() {
        it('Should return OK 200 and expected n° of samples', function(done) {

            request(sails.hooks.http.app)
            .get('/sample')
            .set('Authorization', `Bearer ${tokenSA}`)
            .expect(200)
            .end(function(err, res) {

                expect(res.body).to.have.length(fixtures.sample.length + 1);
                if (err) {
                    sails.log.error(err);
                    done(err);
                    return;
                }
                done();
                return;
            });
        });

        it('Should return OK 200 and the expected sample', function(done) {

            request(sails.hooks.http.app)
            .get('/sample/1')
            .set('Authorization', `Bearer ${tokenSA}`)
            .expect(200)
            .end(function(err, res) {

                expect(res.body.id).to.eql(1);
                if (err) {
                    sails.log.error(err);
                    done(err);
                    return;
                }

                done();
                return;
            });

        });
        //   //
        //   //        it('Should return 400, metadata required', function (done) {
        //   //
        //   //           request(sails.hooks.http.app)
        //   //             .get('/sample/2')
        //   //             .set('Authorization',`Bearer ${tokenSA}`)
        //   //             .expect(400, done)
        //   //             .expect(function(res) {
        //   //               //console.log("Header: " + res.header);
        //   //               //expect(res.body).to.have.length(fixtures.sample.length+1);
        //   //               });
        //   //      });
    });


    describe('DELETE /sample', function() {

        it('Should return OK 200, with array length to 1', function(done) {
            request(sails.hooks.http.app)
            .delete('/sample/3')
            .set('Authorization', `Bearer ${tokenSA}`)
            .expect(200)
            .end(function(err, res) {
                if (err) {
                    sails.log.error(err);
                    done(err);
                    return;
                }
                expect(res.body.deleted).to.eql(1);
                done();
                return;
            });
        });

        it('Should return OK 200, with array lenght to 0', function (done) {
            request(sails.hooks.http.app)
            .delete('/sample/7')
            .set('Authorization',`Bearer ${tokenSA}`)
            .expect(200)
            .end(function(err, res) {
                if (err) {
                    sails.log.error(err);
                    done(err);
                    return;
                }
                expect(res.body.deleted).to.eql(0);
                done();
                return;
            });
        });
    });

    describe('EDIT /sample/edit', function() {
        // let prova;
        //
        // beforeEach(function() {
        //     let dataType =
        //   _.reject(fixtures.datatype, function (dt) {
        //       return (dt.id == 6 || dt.model === "Data" || dt.model === "Subject");
        //   });
        //   // [];
        //     console.log(dataType);
        //     prova = sinon.stub(sails.config.xtens.crudManager, "getDataTypesByRolePrivileges");
        //     prova.onCall(0).returns(fixtures.datatype);
        //     prova.onCall(1).returns(fixtures.datatype);
        //     prova.onCall(2).returns([]);
        //     prova.onCall(3).returns(dataType);
        //     prova.returns(3);
        // });
        //
        // afterEach(function() {
        //     sails.config.xtens.crudManager.getDataTypesByRolePrivileges.restore();
        // });
        it('Should return 200 OK with an object containing all information required', function (done) {

            request(sails.hooks.http.app)
                .get('/sample/edit?id=1')
                .set('Authorization', `Bearer ${tokenSA}`)
                .send()
                .expect(200)
                .end(function(err, res) {
                    expect(res.body.sample).to.exist;
                    expect(res.body.sample).to.not.equal(null);
                    expect(res.body.dataTypes).to.exist;
                    expect(res.body.donor).to.equal(null);
                    expect(res.body.parentSample).to.equal(null);
                    if (err) {
                        sails.log.error(err);
                        done(err);
                        return;
                    }
                    done();
                    return;
                });
        });

        // it('Should return 403 FORBIDDEN - Authenticated user is not allowed to edit sensitive data', function (done) {
        //     console.log(fixtures.datatype);
        //     request(sails.hooks.http.app)
        //         .get('/sample/edit?id=2')
        //         .set('Authorization', `Bearer ${tokenS}`)
        //         .send()
        //         .expect(403)
        //         .end(function(err, res) {
        //             console.log(err,res.body);
        //             expect(res.body.error.message).to.be.equal("Authenticated user is not allowed to edit sensitive data");
        //             if (err) {
        //                 sails.log.error(err);
        //                 done(err);
        //                 return;
        //             }
        //             done();
        //             return;
        //         });
        // });
        // it('Should return 403 FORBIDDEN - Authenticated user does not have EDIT privileges on any data type', function (done) {
        //     console.log(fixtures.datatype);
        //     request(sails.hooks.http.app)
        //         .get('/sample/edit?id=2')
        //         .set('Authorization', `Bearer ${tokenS}`)
        //         .send()
        //         .expect(403)
        //         .end(function(err, res) {
        //             // console.log(err,res);
        //             expect(res.body.error.message).to.be.equal("Authenticated user does not have EDIT privileges on any data type");
        //             if (err) {
        //                 sails.log.error(err);
        //                 done(err);
        //                 return;
        //             }
        //             done();
        //             return;
        //         });
        // });
        // it('Should return 403 FORBIDDEN - Authenticated user does not have edit privileges on the sample type', function (done) {
        //     console.log(fixtures.datatype);
        //     request(sails.hooks.http.app)
        //         .get('/sample/edit?id=2')
        //         .set('Authorization', `Bearer ${tokenS}`)
        //         .send()
        //         .expect(403)
        //         .end(function(err, res) {
        //             // console.log(err,res);
        //             expect(res.body.error.message).to.be.equal("Authenticated user does not have edit privileges on the sample type");
        //             if (err) {
        //                 sails.log.error(err);
        //                 done(err);
        //                 return;
        //             }
        //             done();
        //             return;
        //         });
        // });
    });
});
