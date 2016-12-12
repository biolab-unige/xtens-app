/* jshint node: true */
/* jshint mocha: true */
/* globals , sails, fixtures */
"use strict";

const expect = require("chai").expect;
const request = require('supertest');
const loginHelper = require('./loginHelper');
const sinon = require('sinon');

describe('DataController', function() {

    let tokenA, tokenS;

    const schemaMetadata = {
        "body": [
            {
                "name": "Group one",
                "label": "METADATA GROUP",
                "content": [
                    {
                        "name": "Metadata 1",
                        "label": "METADATA FIELD",
                        "_group": "Group one",
                        "isList": false,
                        "hasUnit": false,
                        "visible": true,
                        "hasRange": false,
                        "required": true,
                        "fieldType": "Integer",
                        "sensitive": false,
                        "customValue": null,
                        "ontologyUri": null,
                        "formattedName": "metadata_1",
                        "possibleUnits": null,
                        "caseInsensitive": false
                    },
                    {
                        "name": "Metadata 2",
                        "label": "METADATA FIELD",
                        "_group": "Group one",
                        "isList": true,
                        "hasUnit": false,
                        "visible": true,
                        "hasRange": false,
                        "required": false,
                        "fieldType": "Text",
                        "sensitive": false,
                        "customValue": null,
                        "ontologyUri": null,
                        "formattedName": "metadata_2",
                        "possibleUnits": null,
                        "possibleValues": [
                            "value 1",
                            "value 2",
                            "value 3"
                        ],
                        "caseInsensitive": false
                    }
                ]
            }
        ],
        "header": {
            "name": "New DataType",
            "model": "Data",
            "version": "0.0.1",
            "ontology": "",
            "fileUpload": false,
            "description": "A new datatype for tests"
        }
    };

    before(function(done) {
        loginHelper.loginAdminUser(request, function (bearerToken) {
            tokenA = bearerToken;
            sails.log.debug(`Got tokenA: ${tokenA}`);

            loginHelper.loginAnotherStandardUserNoDataSens(request, function (bearerToken2) {
                tokenS = bearerToken2;
                sails.log.debug(`Got token: ${tokenS}`);
                done();
                return;
            });
        });
    });

    describe('POST /dataType', function() {
        it('Should return OK 201, with the new DataType', function (done) {

            // sails.log.debug(metadata);

            request(sails.hooks.http.app)
            .post('/dataType')
            .set('Authorization', `Bearer ${tokenA}`)
            .send({
                "parents": [1],
                "name": "New DataType",
                "schema": schemaMetadata,
                "model": "Data"

            })
            .expect(201)
            .end(function(err, res) {
                if (err) {
                    sails.log.error(err);
                    done(err);
                }
                let resDataType = res.body;
                // console.log(resDataType.id);
                expect(resDataType.schema).to.eql(schemaMetadata);
                done();
                return;
            });
        });

        it('Should return 400, metadata required', function (done) {
            request(sails.hooks.http.app)
            .post('/dataType')
            .set('Authorization', `Bearer ${tokenA}`)
            .send({
                "model": "Data",
                "parents": [1],
                "name": "New DataType",
                "schema": {
                    body:{
                        "name": "Group one",
                        "label": "METADATA GROUP",
                        "content": [
                            {
                                "name": "Metadata 1",
                                "label": "METADATA FIELD",
                                "_group": "Group one",
                                "isList": false,
                                "hasUnit": false,
                                "visible": true,
                                "hasRange": false,
                                "required": true,
                                "fieldType": "wrongTypeFiled",
                                "sensitive": false,
                                "customValue": null,
                                "ontologyUri": null,
                                "formattedName": "metadata_1",
                                "possibleUnits": null,
                                "caseInsensitive": false
                            }]
                    },
                    header:{
                        "name": "New DataType",
                        "model": "Data",
                        "version": "0.0.1",
                        "ontology": "",
                        "fileUpload": false,
                        "description": "A new datatype for tests"
                    }
                }
            })
            .expect(400)
            .end(function(err, res) {
                if (err) {
                    sails.log.console.error(err);
                    done(err);
                }
                expect(res).to.be.error;
                done();
                return;
            });
        });

    });

    describe('PUT /dataType', function() {
        it('Should return OK 200, notes Updated', function (done) {
            const name = "update DataType";

            request(sails.hooks.http.app)
            .put('/dataType/6')
            .set('Authorization', `Bearer ${tokenA}`)
            .send({
                "parents": [1],
                "name": "update DataType",
                "id":6,
                "schema": schemaMetadata,
                "model": "Data"
            })
            .expect(200)
            .end(function(err, res) {
                // console.log(res);
                expect(res.body.name).to.eql(name);
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
            .put('/dataType/2')
            .set('Authorization', `Bearer ${tokenA}`)
            .send({
                "parents": [1],
                "name": "update DataType",
                "id":2,
                "schema": schemaMetadata,
                "model": "Data"
            })
            .expect(400);
            done();
            return;
        });
    });

    describe('GET /dataType', function() {

        it('Should return OK 200 and expected n° of dataType', function (done) {
            request(sails.hooks.http.app)
            .get('/dataType')
            .set('Authorization', `Bearer ${tokenA}`)
            //.send({id:1})
            .expect(200)
            .end(function(err, res) {
                expect(res.body).to.have.length(fixtures.datatype.length);
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
            .get('/dataType/1')
            .set('Authorization', `Bearer ${tokenA}`)
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

    describe('DELETE /dataType', function() {

        it('Should return 200 OK with 1 deleted item if resource exists', function (done) {
            request(sails.hooks.http.app)
            .delete('/dataType/6')
            .set('Authorization', `Bearer ${tokenA}`)
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

        it('Should return 400 Bad Request, Missing dataType ID on DELETE request', function (done) {

            const expectedMessage = 'Missing dataType ID on DELETE request';
            request(sails.hooks.http.app)
            .delete('/dataType')
            .set('Authorization', `Bearer ${tokenA}`)
            .send()
            .expect(400)
            .end(function(err, res) {
                // console.log(err,res);
                if (err) {
                    sails.log.console.error(err);
                    done(err);
                    return;
                }
                expect(res.body).to.be.error;
                expect(res.body.message).to.eql(expectedMessage);
                done();
                return;
            });
        });
    });

    describe('EDIT /dataType/edit', function() {

        it('Should return 200 OK with an object containing all information required', function (done) {
            let expectedDataTypes = _.clone(fixtures.datatype);
            request(sails.hooks.http.app)
                .get('/dataType/edit?id=2')
                .set('Authorization', `Bearer ${tokenA}`)
                .send()
                .expect(200)
                .end(function(err, res) {
                    // console.log(res.body);
                    expect(res.body.params).to.exist;
                    expect(res.body.params.id).to.eql('2');
                    expect(res.body.dataTypes).to.exist;
                    expect(res.body.dataTypes.length).to.eql(expectedDataTypes.length);
                    if (err) {
                        sails.log.console.error(err);
                        done(err);
                        return;
                    }
                    done();
                    return;
                });
        });

        it('Should return 403 FORBIDDEN without params and dataTypes', function (done) {

            request(sails.hooks.http.app)
                .get('/dataType/edit?id=1')
                .set('Authorization', `Bearer ${tokenS}`)
                .send()
                .expect(403)
                .end(function(err,res) {
                    expect(res.body.params).to.not.exist;
                    expect(res.body.dataTypes).to.not.exist;
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

    describe('POST /graph', function() {

        let queryStub;
        const dataTypeTree = [
            {
                "parentid": 1,
                "parentname": "Patient",
                "parenttemplate": "Subject",
                "childid": 3,
                "childname": "Star",
                "childtemplate": "Data",
                "path": [ 3, 1 ],
                "cycle": false,
                "depth": 1 },
            {
                "parentid": 1,
                "parentname": "Patient",
                "parenttemplate": "Subject",
                "childid": 2,
                "childname": "Tissue",
                "childtemplate": "Sample",
                "path": [ 2, 1 ],
                "cycle": false,
                "depth": 1 },
            {
                "parentid": 1,
                "parentname": "Star",
                "parenttemplate": "Data",
                "childid": 4,
                "childname": "Variant",
                "childtemplate": "Data",
                "path": [ 3, 1, 4 ],
                "cycle": false,
                "depth": 2 },
            {
                "parentid": 1,
                "parentname": "Tissue",
                "parenttemplate": "Sample",
                "childid": 5,
                "childname": "Variant Annotation",
                "childtemplate": "Data",
                "path": [ 2, 1, 5 ],
                "cycle": false,
                "depth": 2 },
            {
                "parentid": 1,
                "parentname": "Variant Annotation",
                "parenttemplate": "Data",
                "childid": 5,
                "childname": "Variant Annotation",
                "childtemplate": "Data",
                "path": [ 5, 2, 1, 5 ],
                "cycle": true,
                "depth": 3 }
        ];
        const expectedRes = {
            links: [
                {
                    source: 'Patient',
                    target: 'Star',
                    depth: 1,
                    source_template: 'Subject',
                    target_template: 'Data',
                    cycle: false },
                {
                    source: 'Patient',
                    target: 'Tissue',
                    depth: 1,
                    source_template: 'Subject',
                    target_template: 'Sample',
                    cycle: false },
                {
                    source: 'Star',
                    target: 'Variant',
                    depth: 2,
                    source_template: 'Data',
                    target_template: 'Data',
                    cycle: false },
                {
                    source: 'Tissue',
                    target: 'Variant Annotation',
                    depth: 2,
                    source_template: 'Sample',
                    target_template: 'Data',
                    cycle: false } ],
            loops: [
                {
                    source: 'Variant Annotation',
                    target: 'Variant Annotation',
                    depth: 3,
                    source_template: 'Data',
                    target_template: 'Data',
                    cycle: true }
            ]
        };

        beforeEach(function() {

            let rootDataType = _.cloneDeep(fixtures.datatype[0]);
            let id = rootDataType.id;

            queryStub = sinon.stub(sails.config.xtens.databaseManager.recursiveQueries, "fetchDataTypeTree", function(id, next) {
                next(null, {rows:dataTypeTree});
            });
        });

        afterEach(function() {
            sails.config.xtens.databaseManager.recursiveQueries.fetchDataTypeTree.restore();
        });

        it('Should return OK 200, with the expected graph structure', function(done) {

            request(sails.hooks.http.app)
            .post('/graph')
            .set('Authorization', `Bearer ${tokenA}`)
            .send({
                "idDataType":"Patient"
            })
            .expect(200)
            .end(function(err,res) {
                if(err){done(err); return;}

                expect(res.body).to.eql(expectedRes);
                done();
            });
            return;
        });

    });
});
