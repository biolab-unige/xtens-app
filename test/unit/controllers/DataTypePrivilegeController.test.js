/* jshint node: true */
/* jshint mocha: true */
/* globals , sails, fixtures, DataTypeService */
"use strict";

const expect = require("chai").expect;
const request = require('supertest');
const loginHelper = require('./loginHelper');
const BluebirdPromise = require("bluebird");
const sinon = require('sinon');

describe('DataTypePrivilege', function() {

    let tokenSA, tokenS;

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
        loginHelper.loginSuperAdmin(request, function (bearerToken) {
            tokenSA = bearerToken;
            sails.log.debug(`Got token: ${tokenSA}`);

            loginHelper.loginAnotherStandardUserNoDataSens(request, function (bearerToken2) {
                tokenS = bearerToken2;
                sails.log.debug(`Got token: ${tokenS}`);
                done();
                return;
            });
        });
    });

    describe('POST /dataTypePrivilegesTypePrivileges', function() {
        it('Should return OK 201, with location of new Data', function (done) {

            request(sails.hooks.http.app)
            .post('/dataTypePrivileges')
            .set('Authorization', `Bearer ${tokenSA}`)
            .send({
                "dataType": 5,
                "group": 1,
                "privilegeLevel": "edit"
            })
            .expect(201)
            .end(function(err, res) {
                if (err) {
                    sails.log.error(err);
                    done(err);
                }
                let l = res.header.location;
                let loc = l.split('/');
                let location = '/' + loc[3]+ '/' + loc[4];
                expect(location).to.equals('/dataTypePrivileges/16');
                done();
                return;
            });
        });

        it('Should return 400, wrong privilege', function (done) {
            let expectedErrorMessage = 'child "privilegeLevel" fails because ["privilegeLevel" must be one of [view_overview, view_details, download, edit]]';
            request(sails.hooks.http.app)
            .post('/dataTypePrivileges')
            .set('Authorization', `Bearer ${tokenSA}`)
            .send({
                "dataType": 5,
                "group": 1,
                "privilegeLevel": "wrongPrivilege"
            })
            .expect(400)
            .end(function(err, res) {
                if (err) {
                    sails.log.error(err);
                    done(err);
                }
                expect(res.body.error).to.exist;
                expect(res.body.error.message).to.eql(expectedErrorMessage);
                done();
                return;
            });
        });

    });

    describe('PUT /dataTypePrivileges', function() {
        it('Should return OK 200, notes Updated', function (done) {
            const note = "New Data Updated";

            request(sails.hooks.http.app)
            .put('/dataTypePrivileges/16')
            .set('Authorization', `Bearer ${tokenSA}`)
            .send({
                "id": 16,
                "dataType": 5,
                "group": 1,
                "privilegeLevel": "view_overview"
            })
            .expect(200)
            .end(function(err, res) {
                if (err) {
                    done(err);
                    return;
                }
                expect(res.body[0].privilegeLevel).to.eql('view_overview');
                done();
                return;
            });

        });

        it('Should return 400, metadata Required', function (done) {
            let expectedErrorMessage = 'child "privilegeLevel" fails because ["privilegeLevel" must be one of [view_overview, view_details, download, edit]]';

            request(sails.hooks.http.app)
            .put('/dataTypePrivileges/16')
            .set('Authorization', `Bearer ${tokenSA}`)
            .send({
                "id": 16,
                "dataType": 5,
                "group": 1,
                "privilegeLevel": "wrongPrivilege"
            })
            .expect(400)
            .end(function(err, res) {
                if (err) {
                    sails.log.error(err);
                    done(err);
                }
                expect(res.body.error).to.exist;
                expect(res.body.error.message).to.eql(expectedErrorMessage);
                done();
                return;
            });
        });
    });

    describe('GET /dataTypePrivileges', function() {

        it('Should return OK 200 and expected n° of data', function (done) {
            request(sails.hooks.http.app)
            .get('/dataTypePrivileges')
            .set('Authorization', `Bearer ${tokenSA}`)
            //.send({id:1})
            .expect(200)
            .end(function(err, res) {
                expect(res.body).to.have.length(fixtures.datatypeprivileges.length + 1);
                if (err) {
                    sails.log.console.error(err);
                    done(err);
                    return;
                }
                done();
                return;
            });
        });

        it('Should return OK 200 and the expected datum', function (done) {
            request(sails.hooks.http.app)
            .get('/dataTypePrivileges/1')
            .set('Authorization', `Bearer ${tokenSA}`)
            .expect(200)
            .end(function(err, res) {
                expect(res.body.id).to.eql(1);
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

    describe('DELETE /dataTypePrivileges', function() {

        it('Should return 200 OK with 1 deleted item if resource exists', function (done) {
            request(sails.hooks.http.app)
            .delete('/dataTypePrivileges/16')
            .set('Authorization', `Bearer ${tokenSA}`)
            .send()
            .expect(200)
            .end(function(err, res) {
                if (err) {
                    sails.log.console.error(err);
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
            .delete('/dataTypePrivileges/16')
            .set('Authorization', `Bearer ${tokenSA}`)
            .send()
            .expect(200)
            .end(function(err, res) {
                if (err) {
                    sails.log.console.error(err);
                    done(err);
                    return;
                }
                expect(res.body.deleted).to.eql(0);
                done();
                return;
            });
        });
    });

    describe('EDIT /dataTypePrivileges/edit', function() {
        let dataType, expectedDataTypes, expectedGroup, expectedDataTypesPrivilege,
            getDataTypeToEditPrivilegesStub, getDataTypesToCreateNewPrivilegesStub;
        beforeEach(function() {
            dataType = _.cloneDeep(fixtures.datatype[1]);
            expectedDataTypes = fixtures.datatype.filter(function( obj ) {
                return obj.id !== 2;
            });
            expectedGroup = _.cloneDeep(fixtures.group[0]);
            expectedDataTypesPrivilege = _.cloneDeep(fixtures.datatypeprivileges[1]);
            getDataTypeToEditPrivilegesStub, getDataTypesToCreateNewPrivilegesStub;
            getDataTypeToEditPrivilegesStub = sinon.stub(DataTypeService, "getDataTypeToEditPrivileges", function(id) {

                return BluebirdPromise.try(function() {
                    if (!id) {
                        return undefined;
                    }
                    return dataType;
                });
            });

            getDataTypesToCreateNewPrivilegesStub = sinon.stub(DataTypeService, "getDataTypesToCreateNewPrivileges", function(groupId, privilegeId) {
                return BluebirdPromise.try(function() {
                    if (!groupId) {
                        return undefined;
                    }

                    return expectedDataTypes;
                });
            });
        });
        afterEach(function() {
            DataTypeService.getDataTypeToEditPrivileges.restore();
            DataTypeService.getDataTypesToCreateNewPrivileges.restore();
        });

        it('Should return 200 OK with an object containing all information required', function (done) {

            request(sails.hooks.http.app)
                .get('/dataTypePrivileges/edit?groupId=1&id=2')
                .set('Authorization', `Bearer ${tokenSA}`)
                .send()
                .expect(200)
                .end(function(err, res) {
                    expect(res.body.group).to.exist;
                    expect(res.body.group).to.eql(expectedGroup);
                    expect(res.body.dataType).to.exist;
                    expect(res.body.dataType).to.eql(dataType);
                    expect(res.body.dataTypes).to.exist;
                    expect(res.body.dataTypes).to.eql(expectedDataTypes);
                    expect(res.body.dataTypePrivileges).to.exist;
                    expect(res.body.dataTypePrivileges.id).to.eql(expectedDataTypesPrivilege.id);
                    if (err) {
                        sails.log.console.error(err);
                        done(err);
                        return;
                    }
                    done();
                    return;
                });
        });

        it('Should return 403 FORBIDDEN without data', function (done) {

            request(sails.hooks.http.app)
                .get('/dataTypePrivileges/edit?id=1')
                .set('Authorization', `Bearer ${tokenS}`)
                .send()
                .expect(403)
                .end(function(err, res) {
                    if (err) {
                        sails.log.console.error(err);
                        done(err);
                        return;
                    }
                    expect(res).to.be.error;
                    expect(res.body).to.be.empty;
                    done();
                    return;
                });
        });
    });
});
