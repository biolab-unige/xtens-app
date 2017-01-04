/* jshint node: true */
/* jshint mocha: true */
/* globals , sails, fixtures, DataService */
"use strict";

const expect = require("chai").expect;
const request = require('supertest');
const loginHelper = require('./loginHelper');
const sinon = require('sinon');

describe('DataController', function() {

    let tokenDataSens, tokenNoDataSens, tokenNoPriv, tokenDemo;

    const metadata = {
        "name":{"value":"Antares", "group": "Generic Info" },
        "constellation":{"value":"scorpius", "group":"Generic Info"},
        "classification":{"value":"supergiant", "group":"Generic Info"},
        "designation":{"values":["α Scorpii, Cor Scorpii", "21 Sco"],"group":"Generic Info","loop":"Other Designations"},
        "mass":{"value": 12.4,"unit":"M☉","group":"Physical Details"},
        "radius":{"value": 883,"unit":"R☉","group":"Physical Details"},
        "luminosity":{"value": 57500,"unit":"L☉","group":"Physical Details"},
        "temperature":{"value": 3400,"unit":"K","group":"Physical Details"}
    };

    before(function(done) {
        loginHelper.loginAnotherStandardUser(request, function (bearerToken) {
            tokenDataSens = bearerToken;
            sails.log.debug(`Got token: ${tokenDataSens}`);

            loginHelper.loginAnotherStandardUserNoDataSens(request, function (bearerToken2) {
                tokenNoDataSens = bearerToken2;
                sails.log.debug(`Got token: ${tokenNoDataSens}`);

                loginHelper.loginUserNoPrivileges(request, function (bearerToken3) {
                    tokenNoPriv = bearerToken3;
                    sails.log.debug(`Got token: ${tokenNoPriv}`);

                    loginHelper.loginAnotherStandardUser(request, function (bearerToken4) {
                        tokenDemo = bearerToken4;
                        sails.log.debug(`Got token: ${tokenDemo}`);
                        done();
                        return;
                    });
                });
            });
        });
    });

    describe('POST /data', function() {

        it('Should return OK 201, with location of new Data', function (done) {

            const existingDataCount = fixtures.data.length;
            sails.log.debug(metadata);

            request(sails.hooks.http.app)
            .post('/data')
            .set('Authorization', `Bearer ${tokenDataSens}`)
            .send({
                "type": 3,
                "metadata": metadata,
                "date": "2015-12-06",
                "notes": "New data"
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
                expect(location).to.equals(`/data/${existingDataCount+1}`);
                done();
                return;
            });
        });

        it('Should return 400, metadata required', function (done) {
            request(sails.hooks.http.app)
            .post('/data')
            .set('Authorization', `Bearer ${tokenDataSens}`)
            .send({
                type:3,
                metadata:{},
                date:"2015-12-06",
                tags:[],
                notes:"New data"
            })
            .expect(400);
            done();
            return;
        });

        it('Should return 403 Forbidden - Authenticated user does not have edit privileges on the data type 3', function (done) {
            let expectedError = `Authenticated user does not have edit privileges on the data type 3`;
            request(sails.hooks.http.app)
            .post('/data')
            .set('Authorization', `Bearer ${tokenNoPriv}`)
            .send({
                type:3,
                metadata:{},
                date:"2015-12-06",
                tags:[],
                notes:"New data"
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
            let expectedError = `"date" must be a valid ISO 8601 date`;
            request(sails.hooks.http.app)
            .post('/data')
            .set('Authorization', `Bearer ${tokenDataSens}`)
            .send({
                type:3,
                metadata:{},
                date:"wrongFormat",
                tags:[],
                notes:"New data"
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

    describe('PUT /data', function() {
        it('Should return OK 200, notes Updated', function (done) {
            const note = "New Data Updated";

            request(sails.hooks.http.app)
            .put('/data/3')
            .set('Authorization', `Bearer ${tokenDataSens}`)
            .send({
                id: 3,
                type: 3,
                metadata: metadata,
                notes: "New Data Updated"
            })
            .expect(200)
            .end(function(err, res) {
                console.log(res.body[0].notes);
                expect(res.body[0].notes).to.equals(note);
                if (err) {
                    done(err);
                    return;
                }
                done();
                return;
            });

        });

        it('Should return 400, metadata Required', function (done) {

            request(sails.hooks.http.app)
            .put('/data/3')
            .set('Authorization', `Bearer ${tokenDataSens}`)
            .send({id:2, type:3, metadata:{}, date:"2015-12-06",tags:[],notes:"New data"})
            .expect(400);
            done();
            return;
        });

        it('Should return 400 Validation Error', function (done) {

            request(sails.hooks.http.app)
            .put('/data/3')
            .set('Authorization', `Bearer ${tokenDataSens}`)
            .send({id:2, type:3, metadata:{}, date:"wrongFormat",tags:[],notes:"New data"})
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
                .put('/data/3')
                .set('Authorization', `Bearer ${tokenNoDataSens}`)
                .send({
                    id: 3,
                    type: 3,
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

        it('Should return 403 FORBIDDEN - Authenticated user does not have edit privileges on the data type', function (done) {
            let expectedError = "Authenticated user does not have edit privileges on the data type 3";
            request(sails.hooks.http.app)
                .put('/data/3')
                .set('Authorization', `Bearer ${tokenNoPriv}`)
                .send({
                    id: 3,
                    type: 3,
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

    describe('GET /data', function() {

        it('Should return OK 200 and expected n° of data', function (done) {
            request(sails.hooks.http.app)
            .get('/data')
            .set('Authorization', `Bearer ${tokenDataSens}`)
            .expect(200)
            .end(function(err, res) {
                expect(res.body).to.have.length(fixtures.data.length + 1);
                if (err) {
                    sails.log.error(err);
                    done(err);
                    return;
                }
                done();
                return;
            });
        });

        it('Should return OK 200 and the expected datum', function (done) {
            request(sails.hooks.http.app)
            .get('/data/1')
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
            .get('/data/23')
            .set('Authorization', `Bearer ${tokenNoDataSens}`)
            .expect(200)
            .end(function(err, res) {
                expect(res.body.id).to.eql(23);
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
            .get('/data/22')
            .set('Authorization', `Bearer ${tokenDemo}`)
            .expect(200)
            .end(function(err, res) {
                expect(res.body.id).to.eql(22);
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
            .get('/data/22')
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
            .get('/data/39')
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
            .get('/data?type=120')
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

    describe('DELETE /data', function() {

        it('Should return 200 OK with 1 deleted item if resource exists', function (done) {
            request(sails.hooks.http.app)
            .delete('/data/3')
            .set('Authorization', `Bearer ${tokenDataSens}`)
            .send()
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

        it('Should return 200 OK with 0 deleted items if resource does not exist', function (done) {
            request(sails.hooks.http.app)
            .delete('/data/3')
            .set('Authorization', `Bearer ${tokenDataSens}`)
            .send()
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

        it('Should return 403 Forbidden - Authenticated user does not have edit privileges on the data type', function (done) {
            let expectedError = 'Authenticated user does not have edit privileges on the data type 3';
            request(sails.hooks.http.app)
            .delete('/data/1')
            .set('Authorization', `Bearer ${tokenNoPriv}`)
            .send()
            .expect(403)
            .end(function(err, res) {
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

        it('Should return 400 Bad request -  Missing data ID on DELETE request', function (done) {
            let expectedError = 'Missing data ID on DELETE request';
            request(sails.hooks.http.app)
            .delete('/data/')
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

    describe('EDIT /data/edit', function() {

        it('Should return 200 OK with an object containing all information required', function (done) {

            request(sails.hooks.http.app)
                .get('/data/edit?id=2')
                .set('Authorization', `Bearer ${tokenDataSens}`)
                .send()
                .expect(200)
                .end(function(err, res) {
                    //console.log("Res edit: "+JSON.stringify(res.body));
                    expect(res.body.data).to.exist;
                    expect(res.body.dataTypes).to.exist;
                    expect(res.body.parentSubject).to.equal(null);
                    expect(res.body.parentSample).to.equal(null);
                    expect(res.body.parentData).to.equal(null);
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
                .get('/data/edit?id=1')
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

        it('Should return 403 FORBIDDEN - Authenticated user does not have edit privileges on any data type', function (done) {
            let expectedError = 'Authenticated user does not have edit privileges on any data type';

            let stub = sinon.stub(sails.hooks.persistence.crudManager, "getDataTypesByRolePrivileges",function () {
                return [];
            });

            request(sails.hooks.http.app)
                .get('/data/edit?id=1')
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

    it('Should return 403 FORBIDDEN - Authenticated user does not have edit privileges on the data type', function (done) {
        let expectedError = 'Authenticated user does not have edit privileges on the data type';

        let prova = sinon.stub(sails.hooks.persistence.crudManager, "getDataTypesByRolePrivileges",function () {
            return [2];
        });

        request(sails.hooks.http.app)
            .get('/data/edit?id=1')
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
