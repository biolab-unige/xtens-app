/* jshint node: true */
/* jshint mocha: true */
/* globals _, sails, fixtures, DataService */
"use strict";

const expect = require("chai").expect;
const request = require('supertest');
const sinon = require('sinon');
const loginHelper = require('./loginHelper');


describe('SubjectController', function() {

    let tokenNoDataSens, tokenDataSens, tokenNoPriv, tokenDemo;
    let metadata = {
        "status": {"value": "diseased"},
        "disease": {"value": "medulloblastoma"},
        "diagnosis_age": {"value": 14, "unit": "month"}

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

    describe('POST /subject', function() {
        it('Should return OK 201, with location of new subject', function(done) {

            const existingSubjectCount = fixtures.subject.length;
            request(sails.hooks.http.app)
            .post('/subject')
            .set('Authorization', `Bearer ${tokenDataSens}`)
            .send({
                personalInfo: {
                    givenName: 'Gino',
                    surname: 'Oliveri',
                    birthDate: '2003-12-22'
                },
                type: 1,
                code: '888',
                sex: 'N.D.',
                metadata: metadata,
                notes: "New subject"
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
                expect(location).to.equals(`/subject/${existingSubjectCount+1}`);
                done();
                return;
            });

        });

        it('Should return 400, Wrong Model', function(done) {

            request(sails.hooks.http.app)
            .post('/subject')
            .set('Authorization', `Bearer ${tokenDataSens}`)
            .send({
                type: 3,
                metadata: metadata,
                date: "2015-12-06",
                tags: [],
                notes: "New subject"
            })
            .expect(400);
            done();
            return;
        });

        it('Should return 403 Forbidden - Authenticated user does not have edit privileges on the subject type 1', function (done) {
            let expectedError = `Authenticated user does not have edit privileges on the subject type 1`;
            request(sails.hooks.http.app)
            .post('/subject')
            .set('Authorization', `Bearer ${tokenNoPriv}`)
            .send({
                type:1,
                metadata:metadata,
                date:"2015-12-06",
                tags:[],
                notes:"New subject"
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
            let expectedError = `"sex" is required`;
            request(sails.hooks.http.app)
            .post('/subject')
            .set('Authorization', `Bearer ${tokenDataSens}`)
            .send({
                type:1,
                metadata:{},
                date:"wrongFormat",
                tags:[],
                notes:"New subject"
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

    describe('PUT /subject', function() {
        it('Should return OK 200, notes Updated', function(done) {
            var note = "New subject Updated";

            request(sails.hooks.http.app)
            .put('/subject/3')
            .set('Authorization', `Bearer ${tokenDataSens}`)
            .send({
                id: 3,
                personalInfo: {
                    id: 2,
                    givenName: 'Gino',
                    surname: 'Oliveri',
                    birthDate: '2003-11-22'
                },
                type: 1,
                code: '888',
                sex: 'N.D.',
                metadata: metadata,
                notes: "New subject Updated"
            })
            .expect(200)
            .end(function(err, res) {
                expect(res.body[0].notes).to.equals(note);
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
            .put('/subject/4')
            .set('Authorization', `Bearer ${tokenDataSens}`)
            .send({
                id: 2,
                type: 3,
                metadata: metadata,
                date: "2015-12-06",
                tags: [],
                notes: "New subject"
            })
            .expect(400);
            done();
            return;
        });

        it('Should return 400 Validation Error', function (done) {

            request(sails.hooks.http.app)
            .put('/subject/3')
            .set('Authorization', `Bearer ${tokenDataSens}`)
            .send({id:2, type:1, metadata:{}, date:"wrongFormat",tags:[],notes:"New subject"})
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
                .put('/subject/3')
                .set('Authorization', `Bearer ${tokenNoDataSens}`)
                .send({
                    id: 3,
                    type: 3,
                    metadata: metadata,
                    notes: "New subject Updated"
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

        it('Should return 403 FORBIDDEN - Authenticated user does not have edit privileges on the subject type', function (done) {
            let expectedError = "Authenticated user does not have edit privileges on the subject type 3";
            request(sails.hooks.http.app)
                .put('/subject/3')
                .set('Authorization', `Bearer ${tokenNoPriv}`)
                .send({
                    id: 3,
                    type: 3,
                    metadata: metadata,
                    notes: "New subject Updated"
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

    describe('GET /subject', function() {
        it('Should return OK 200 and expected n° of subjects', function(done) {

            request(sails.hooks.http.app)
            .get('/subject')
            .set('Authorization', `Bearer ${tokenDataSens}`)
            //.send({id:1})
            .expect(200)
            .end(function(err, res) {
                expect(res.body).to.have.length(fixtures.subject.length + 1);
                if (err) {
                    sails.log.error(err);
                    done(err);
                    return;
                }
                done();
                return;
            });

        });
        it('Should return OK 200 and the expected subject', function(done) {

            request(sails.hooks.http.app)
            .get('/subject/2')
            .set('Authorization', `Bearer ${tokenDataSens}`)
            //.send({id:1})
            .expect(200)
            .end(function(err, res) {

                expect(res.body.id).to.eql(2);
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
            .get('/subject/1')
            .set('Authorization', `Bearer ${tokenNoDataSens}`)
            .expect(200)
            .end(function(err, res) {
                expect(res.body.id).to.eql(1);
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
            .get('/subject/2')
            .set('Authorization', `Bearer ${tokenDemo}`)
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
            .get('/subject/2')
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
            .get('/subject/12')
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
            .get('/subject?type=120')
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

    describe('DELETE /subject', function() {
        it('Should return OK 200, with array length to 1', function(done) {

            request(sails.hooks.http.app)
            .delete('/subject/3')
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
            .delete('/subject/5')
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
        it('Should return 403 Forbidden - Authenticated user does not have edit privileges on the subject type', function (done) {
            let expectedError = 'Authenticated user does not have edit privileges on the subject type 1';
            request(sails.hooks.http.app)
            .delete('/subject/1')
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

        it('Should return 400 Bad request -  Missing subject ID on DELETE request', function (done) {
            let expectedError = 'Missing subject ID on DELETE request';
            request(sails.hooks.http.app)
            .delete('/subject/')
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

    describe('EDIT /subject/edit', function() {

        it('Should return 200 OK with an object containing all information required', function (done) {

            request(sails.hooks.http.app)
                .get('/subject/edit?id=1&code=PAT-001')
                .set('Authorization', `Bearer ${tokenDataSens}`)
                .send()
                .expect(200)
                .end(function(err, res) {
                    expect(res.body.subject).to.exist;
                    expect(res.body.subject).to.not.equal(null);
                    expect(res.body.dataTypes).to.exist;
                    expect(res.body.projects).to.exist;
                    expect(res.body.projects).to.eql([]);
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
                .get('/subject/edit?id=1')
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

        it('Should return 403 FORBIDDEN - Authenticated user does not have edit privileges on any subject type', function (done) {
            let expectedError = 'Authenticated user does not have edit privileges on any subject type';

            let stub = sinon.stub(sails.hooks.persistence.crudManager, "getDataTypesByRolePrivileges",function () {
                return [];
            });

            request(sails.hooks.http.app)
                .get('/subject/edit?id=1')
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

        it('Should return 403 FORBIDDEN - Authenticated user does not have edit privileges on the subject type', function (done) {
            let expectedError = 'Authenticated user does not have edit privileges on the subject type';

            let prova = sinon.stub(sails.hooks.persistence.crudManager, "getDataTypesByRolePrivileges",function () {
                return [2];
            });

            request(sails.hooks.http.app)
            .get('/subject/edit?id=1')
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


    describe('POST /subjectGraph', function() {

        let fetchSubjectDataTreeStub;
        const subjectTree = [
            {
                "id": 's_2',
                "type": 'RNA',
                "metadata":{},
                "parent_sample": 'd_1',
                "parent_data": null },

            {
                "id": 's_5',
                "type": 'RNA',
                "metadata":{},
                "parent_sample": 's_4',
                "parent_data": null },

            {
                "id": 's_3',
                "type": 'DNA',
                "metadata":{},
                "parent_sample": null,
                "parent_data": 'd_1' },

            {
                "id": 's_6',
                "type": 'DNA',
                "metadata":{},
                "parent_sample": 's_4',
                "parent_data": null },

            {
                "id": 'd_1',
                "type": 'CGH_Analysis',
                "metadata":{},
                "parent_sample": null,
                "parent_data": null },

            {
                "id": 's_4',
                "type": 'Tissue',
                "metadata":{},
                "parent_sample": null,
                "parent_data": null } ];
        const expectedRes = {
            "links": [
                {
                    "source": "d_1",
                    "target": "s_2",
                    "name": "s_2",
                    "type": "RNA",
                    "metadata": {}
                },
                {
                    "source": "s_4",
                    "target": "s_5",
                    "name": "s_5",
                    "type": "RNA",
                    "metadata": {}
                },
                {
                    "source": "d_1",
                    "target": "s_3",
                    "name": "s_3",
                    "type": "DNA",
                    "metadata": {}
                },
                {
                    "source": "s_4",
                    "target": "s_6",
                    "name": "s_6",
                    "type": "DNA",
                    "metadata": {}
                },
                {
                    "source": "Patient",
                    "target": "d_1",
                    "name": "d_1",
                    "type": "CGH_Analysis",
                    "metadata": {}
                },
                {
                    "source": "Patient",
                    "target": "s_4",
                    "name": "s_4",
                    "type": "Tissue",
                    "metadata": {}
                }
            ]
        };

        beforeEach(function() {

            let rootSubject = _.cloneDeep(fixtures.datatype[0]);
            let id = rootSubject.id;

            fetchSubjectDataTreeStub = sinon.stub(sails.config.xtens.databaseManager.recursiveQueries, "fetchSubjectDataTree", function(id, next) {
                next(null, {rows:subjectTree});
            });
        });

        afterEach(function() {
            sails.config.xtens.databaseManager.recursiveQueries.fetchSubjectDataTree.restore();
        });

        it('Should return OK 200, with the expected graph structure', function(done) {

            request(sails.hooks.http.app)
            .post('/subjectGraph')
            .set('Authorization', `Bearer ${tokenDataSens}`)
            .send({
                "idPatient": 1
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

    describe('POST /subjectGraphSimple', function() {

        let fetchSubjectDataTreeSimpleStub;
        const subjectTreeRes = [ { id: 3 }, { id: 2 }, { id: 6 } ];
        const expectedRes = {
            links: [
             { source: 'Patient', target: 'Star' },
             { source: 'Patient', target: 'Tissue' },
             { source: 'Patient', target: 'Fluid' }
            ]
        };

        beforeEach(function() {

            let rootSubject = _.cloneDeep(fixtures.datatype[0]);
            let id = rootSubject.id;

            fetchSubjectDataTreeSimpleStub = sinon.stub(sails.config.xtens.databaseManager.recursiveQueries, "fetchSubjectDataTreeSimple", function(id, next) {
                next(null, {rows:subjectTreeRes});
            });
        });

        afterEach(function() {
            sails.config.xtens.databaseManager.recursiveQueries.fetchSubjectDataTreeSimple.restore();
        });

        it('Should return OK 200, with the expected graph structure', function(done) {

            request(sails.hooks.http.app)
            .post('/subjectGraphSimple')
            .set('Authorization', `Bearer ${tokenDataSens}`)
            .send({
                "idPatient": 1
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
