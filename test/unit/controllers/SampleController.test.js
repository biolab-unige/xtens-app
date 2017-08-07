/* jshint node: true */
/* jshint mocha: true */
/* globals _, sails, fixtures, DataService */
"use strict";

const expect = require("chai").expect;
const request = require('supertest');
const sinon = require('sinon');
const loginHelper = require('./loginHelper');


describe('SampleController', function() {

    let tokenDataSens, tokenNoDataSens, tokenNoPriv;

    const metadata = {
        "arrival_code":{"value":"1603292", "group": "Generic Info" },
        "location":{"value":"liver", "group":"Generic Info"},
        "diagnosis":{"value":"neuroblastoma", "group":"Generic Info"}
    };

    before(function(done) {
        loginHelper.loginAdminUser(request, function (bearerToken) {
            tokenDataSens = bearerToken;
            sails.log.debug(`Got tokenA: ${tokenDataSens}`);

            loginHelper.loginAnotherStandardUserNoDataSens(request, function (bearerToken2) {
                tokenNoDataSens = bearerToken2;
                sails.log.debug(`Got token: ${tokenNoDataSens}`);

                loginHelper.loginUserNoPrivileges(request, function (bearerToken3) {
                    tokenNoPriv = bearerToken3;
                    sails.log.debug(`Got token: ${tokenNoPriv}`);

                    done();
                    return;
                });
            });
        });
    });



    describe('POST /sample', function() {
        it('Should return OK 201, with location of new sample', function(done) {
            const existingSampleCount = fixtures.sample.length;
            request(sails.hooks.http.app)
            .post('/sample')
            .set('Authorization', `Bearer ${tokenDataSens}`)
            .send({
                type: 2,
                owner:1,
                biobank:2,
                biobankCode: "081852",
                donor: 11,
                metadata: metadata
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
                expect(location).to.equals(`/sample/${existingSampleCount+1}`);
                done();
                return;
            });


        });

        it('Should return 400, Wrong Model', function(done) {

            request(sails.hooks.http.app)
            .post('/sample')
            .set('Authorization', `Bearer ${tokenDataSens}`)
            .send({
                type: 2,
                biobank:2,
                owner:1,
                biobankCode: "081852",
                donor: 11,
                metadata: metadata
            })
            .expect(400);
            done();
            return;
        });

        it('Should return 403 Forbidden - Authenticated user has not edit privileges on the sample type 2', function (done) {
            let expectedError = `Authenticated user has not edit privileges on the sample type 2`;
            request(sails.hooks.http.app)
            .post('/sample')
            .set('Authorization', `Bearer ${tokenNoPriv}`)
            .send({
                type:2,
                owner:1,
                metadata:metadata,
                date:"2015-12-06",
                tags:[],
                notes:"New sample note"
            })
            .expect(403)
            .end(function(err, res) {
                expect(res.body.error).to.exist;
                expect(res.body.error.message).to.eql(expectedError);
                done();
                return;
            });
        });

        it('Should return 400 Bad Request - Validation Error', function (done) {
            let expectedError = `"biobank" is required`;
            request(sails.hooks.http.app)
            .post('/sample')
            .set('Authorization', `Bearer ${tokenDataSens}`)
            .send({
                type:2,
                owner:1,
                metadata:metadata,
                date:"wrongFormat",
                tags:[],
                notes:"New sample"
            })
            .expect(400)
            .end(function(err, res) {
                expect(res.body.error).to.exist;
                expect(res.body.error.message.details[0].message).to.eql(expectedError);
                done();
                return;
            });
        });

    });

    describe('PUT /sample', function() {
        it('Should return OK 200, biobank Updated', function(done) {

            const biobank = 1;

            request(sails.hooks.http.app)
            .put('/sample/3')
            .set('Authorization', `Bearer ${tokenDataSens}`)
            .send({
                type: 2,
                owner:1,
                biobank: biobank,
                biobankCode: "081852",
                donor: 11,
                metadata: metadata
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
            .set('Authorization', `Bearer ${tokenDataSens}`)
            .send({
                type: 1,
                owner:1,
                biobank:14,
                biobankCode: "081852",
                donor: 11,
                metadata: metadata
            })
            .expect(400);
            done();
            return;
        });

        it('Should return 400 Validation Error', function (done) {

            request(sails.hooks.http.app)
            .put('/sample/3')
            .set('Authorization', `Bearer ${tokenDataSens}`)
            .send({id:2, type:2, owner:1, metadata: metadata, date:"wrongFormat",tags:[],notes:"New data"})
            .expect(400)
            .end(function(err, res) {
                expect(res.body.error.message.name).to.eql("ValidationError");
                if (err) {
                    sails.log.error(err);
                    done(err);
                    return;
                }
                done();
                return;
            });
        });

        it('Should return 403 FORBIDDEN - Authenticated user is not allowed to modify sensitive data', function (done) {
            let expectedError = "Authenticated user is not allowed to modify sensitive data";
            request(sails.hooks.http.app)
                .put('/sample/3')
                .set('Authorization', `Bearer ${tokenNoDataSens}`)
                .send({
                    id: 3,
                    type: 2,
                    owner:1,
                    metadata: metadata,
                    notes: "New Data Updated"
                })
                .expect(403)
                .end(function(err, res) {
                    console.log(err,res.body);
                    expect(res.body.error.message).to.be.equal(expectedError);
                    if (err) {
                        sails.log.error(err);
                        done(err);
                        return;
                    }
                    done();
                    return;
                });
        });

        it('Should return 403 FORBIDDEN - Authenticated user has not edit privileges on the sample type', function (done) {
            let expectedError = "Authenticated user has not edit privileges on the sample type 2";
            request(sails.hooks.http.app)
                .put('/sample/3')
                .set('Authorization', `Bearer ${tokenNoPriv}`)
                .send({
                    id: 3,
                    type: 2,
                    owner:1,
                    metadata: metadata,
                    notes: "New Data Updated"
                })
                .expect(403)
                .end(function(err, res) {
                    expect(res.body.error.message).to.be.equal(expectedError);
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

    describe('GET /sample', function() {
        it('Should return OK 200 and expected n° of samples', function(done) {

            request(sails.hooks.http.app)
            .get('/sample')
            .set('Authorization', `Bearer ${tokenDataSens}`)
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
            .set('Authorization', `Bearer ${tokenDataSens}`)
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

        it('Should return OK 200 the expected Object, calling filterOutSensitiveInfo', function (done) {
            let spy = sinon.spy(DataService, "filterOutSensitiveInfo");

            request(sails.hooks.http.app)
            .get('/sample/2')
            .set('Authorization', `Bearer ${tokenNoDataSens}`)
            .expect(200)
            .end(function(err, res) {
                expect(res.body.id).to.eql(2);
                sinon.assert.calledOnce(spy);
                if (err) {
                    sails.log.error(err);
                    done(err);
                    return;
                }
                DataService.filterOutSensitiveInfo.restore();
                done();
                return;
            });
        });


        it('Should return OK 200 the expected Object, with metadata object empty', function (done) {

            request(sails.hooks.http.app)
            .get('/sample/2')
            .set('Authorization', `Bearer ${tokenDataSens}`)
            .expect(200)
            .end(function(err, res) {
                expect(res.body.id).to.eql(2);
                expect(res.body.metadata).to.be.empty;
                if (err) {
                    sails.log.error(err);
                    done(err);
                    return;
                }
                done();
                return;
            });
        });

        it('Should return OK 200 without Object, no privileges', function (done) {

            request(sails.hooks.http.app)
            .get('/sample/2')
            .set('Authorization', `Bearer ${tokenNoPriv}`)
            .expect(200)
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
        it('Should return OK 200 without Object, not found', function (done) {

            request(sails.hooks.http.app)
            .get('/sample/27')
            .set('Authorization', `Bearer ${tokenDataSens}`)
            .expect(200)
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

        it('Should return OK 200 without Objects, not found', function (done) {

            request(sails.hooks.http.app)
            .get('/sample?type=12')
            .set('Authorization', `Bearer ${tokenDataSens}`)
            .expect(200)
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
    });

    describe('DELETE /sample', function() {

        it('Should return OK 200, with array length to 1', function(done) {
            request(sails.hooks.http.app)
            .delete('/sample/3')
            .set('Authorization', `Bearer ${tokenDataSens}`)
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
            .set('Authorization',`Bearer ${tokenDataSens}`)
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

        it('Should return 403 Forbidden - Authenticated user has not edit privileges on the sample type', function (done) {
            let expectedError = 'Authenticated user has not edit privileges on the sample type 2';
            request(sails.hooks.http.app)
            .delete('/sample/1')
            .set('Authorization', `Bearer ${tokenNoPriv}`)
            .send()
            .expect(403)
            .end(function(err, res) {
                console.log(err,res.body);
                if (err) {
                    sails.log.error(err);
                    done(err);
                    return;
                }
                expect(res.body.error.message).to.eql(expectedError);
                done();
                return;
            });
        });

        it('Should return 400 Bad request -  Missing sample ID on DELETE request', function (done) {
            let expectedError = 'Missing sample ID on DELETE request';
            request(sails.hooks.http.app)
            .delete('/sample/')
            .set('Authorization', `Bearer ${tokenDataSens}`)
            .send()
            .expect(400)
            .end(function(err, res) {
                if (err) {
                    sails.log.error(err);
                    done(err);
                    return;
                }
                expect(res.body.message).to.eql(expectedError);
                done();
                return;
            });
        });
    });

    describe('EDIT /sample/edit', function() {

        it('Should return 200 OK with an object containing all information required', function (done) {

            request(sails.hooks.http.app)
                .get('/sample/edit?id=1')
                .set('Authorization', `Bearer ${tokenDataSens}`)
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

        it('Should return 403 FORBIDDEN - Authenticated user is not allowed to edit sensitive data', function (done) {

            request(sails.hooks.http.app)
                .get('/sample/edit?id=1')
                .set('Authorization', `Bearer ${tokenNoDataSens}`)
                .send()
                .expect(403)
                .end(function(err, res) {
                    expect(res.body.error.message).to.be.equal("Authenticated user is not allowed to edit sensitive data");
                    if (err) {
                        sails.log.error(err);
                        done(err);
                        return;
                    }
                    done();
                    return;
                });
        });

        it('Should return 403 FORBIDDEN - Authenticated user has not edit privileges on any sample type', function (done) {
            let expectedError = 'Authenticated user has not edit privileges on any sample type';

            let stub = sinon.stub(sails.hooks.persistence.crudManager, "getDataTypesByRolePrivileges",function () {
                return [];
            });

            request(sails.hooks.http.app)
                .get('/sample/edit?id=1')
                .set('Authorization', `Bearer ${tokenNoPriv}`)
                .send()
                .expect(403)
                .end(function(err, res) {
                    expect(res.body.error.message).to.eql(expectedError);
                    if (err) {
                        sails.log.error(err);
                        done(err);
                        return;
                    }
                    sails.hooks.persistence.crudManager.getDataTypesByRolePrivileges.restore();
                    done();
                    return;
                });
        });

        it('Should return 403 FORBIDDEN - Authenticated user has not edit privileges on the sample type', function (done) {
            let expectedError = 'Authenticated user has not edit privileges on the sample type';

            let prova = sinon.stub(sails.hooks.persistence.crudManager, "getDataTypesByRolePrivileges",function () {
                return [2];
            });

            request(sails.hooks.http.app)
                .get('/sample/edit?id=1')
                .set('Authorization', `Bearer ${tokenNoPriv}`)
                .send()
                .expect(403)
                .end(function(err, res) {
                    expect(res.body.error.message).to.eql(expectedError);
                    if (err) {
                        sails.log.error(err);
                        done(err);
                        return;
                    }
                    sails.hooks.persistence.crudManager.getDataTypesByRolePrivileges.restore();
                    done();
                    return;
                });
        });
    });
});
