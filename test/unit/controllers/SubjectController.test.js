/* jshint node: true */
/* jshint mocha: true */
/* globals _, sails, fixtures */
"use strict";

const expect = require("chai").expect;
const request = require('supertest');
const sinon = require('sinon');
const loginHelper = require('./loginHelper');


describe('SubjectController', function() {

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

    describe('POST /subject', function() {
        it('Should return OK 201, with location of new subject', function(done) {

            request(sails.hooks.http.app)
            .post('/subject')
            .set('Authorization', `Bearer ${tokenSA}`)
            .send({
                personalInfo: {
                    givenName: 'Gino',
                    surname: 'Oliveri',
                    birthDate: '2003-12-22'
                },
                type: 1,
                code: '888',
                sex: 'N.D.',
                metadata: {
                    status: {
                        value: 'diseased'
                    },
                    disease: {},
                    diagnosis_age: {
                        unit: 'day'
                    }
                },
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
                expect(location).to.equals('/subject/4');
                done();
                return;
            });

        });

        it('Should return 400, Wrong Model', function(done) {

            request(sails.hooks.http.app)
            .post('/subject')
            .set('Authorization', `Bearer ${tokenSA}`)
            .send({
                type: 3,
                metadata: {},
                date: "2015-12-06",
                tags: [],
                notes: "New subject"
            })
            .expect(400);
            done();
            return;

        });
    });

    describe('PUT /subject', function() {
        it('Should return OK 200, notes Updated', function(done) {
            var note = "New subject Updated";
            //  var subject;
            //  Subject.findOne({id:4}).then(function(res){
            // subject=_.cloneDeep(res);
            // subject.notes=note;
            // console.log('Log findOne Subject PUT: ' + JSON.stringify(subject));

            request(sails.hooks.http.app)
            .put('/subject/4')
            .set('Authorization', `Bearer ${tokenSA}`)
            .send({
                id: 4,
                personalInfo: {
                    id: 2,
                    givenName: 'Gino',
                    surname: 'Oliveri',
                    birthDate: '2003-11-22'
                },
                type: 1,
                code: '888',
                sex: 'N.D.',
                metadata: {
                    status: {
                        value: 'diseased'
                    },
                    disease: {},
                    diagnosis_age: {
                        unit: 'day'
                    }
                },
                notes: "New subject Updated"
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
            //}).catch(function(err){console.log(err);});
        });

        it('Should return 400, Wrong Model', function(done) {

            request(sails.hooks.http.app)
            .put('/subject/4')
            .set('Authorization', `Bearer ${tokenSA}`)
            .send({
                id: 2,
                type: 3,
                metadata: {},
                date: "2015-12-06",
                tags: [],
                notes: "New subject"
            })
            .expect(400);
            done();
            return;
        });

    });

    describe('GET /subject', function() {
        it('Should return OK 200 and expected n° of subjects', function(done) {

            request(sails.hooks.http.app)
            .get('/subject')
            .set('Authorization', `Bearer ${tokenSA}`)
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
            .set('Authorization', `Bearer ${tokenSA}`)
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
        //
        //        it('Should return 400, metadata required', function (done) {
        //
        //           request(sails.hooks.http.app)
        //             .get('/subject/2')
        //             .set('Authorization',`Bearer ${tokenSA}`)
        //             .expect(400, done)
        //             .expect(function(res) {
        //               //console.log("Header: " + res.header);
        //               //expect(res.body).to.have.length(fixtures.subject.length+1);
        //               });
        //      });
    });
    describe('DELETE /subject', function() {
        it('Should return OK 200, with array length to 1', function(done) {

            request(sails.hooks.http.app)
            .delete('/subject/4')
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
            .delete('/subject/5')
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

    describe('EDIT /subject/edit', function() {
        // let prova;
        //
        // beforeEach(function() {
        //     let dataType =
        //   _.reject(fixtures.datatype, function (dt) {
        //       return (dt.model === "Data" || dt.model === "Sample");
        //   });
        //   // [];
        //     // console.log(dataType);
        //     console.log(sails.config.xtens.crudManager.getDataTypesByRolePrivileges);
        //
        //     prova = sinon.stub(sails.config.xtens.crudManager, "getDataTypesByRolePrivileges",function (criteria) {
        //         console.log("AAAAAAAAAAAAAAAAAAAAAAA");
        //         if(criteria){
        //             return dataType;
        //         }
        //         else {
        //             return undefined;
        //         }
        //     });
        //     // prova.onCall(0).returns(fixtures.datatype);
        //     // prova.onCall(1).returns(fixtures.datatype);
        //     // prova.onCall(2).returns([]);
        //     // prova.onCall(3).returns(dataType);
        //     // prova.returns(3);
        // });
        //
        // afterEach(function() {
        //     sails.config.xtens.crudManager.getDataTypesByRolePrivileges.restore();
        // });

        it('Should return 200 OK with an object containing all information required', function (done) {

            request(sails.hooks.http.app)
                .get('/subject/edit?id=2&code=PAT-002')
                .set('Authorization', `Bearer ${tokenSA}`)
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

        // it('Should return 403 FORBIDDEN - Authenticated user is not allowed to edit sensitive data', function (done) {
        //     console.log(fixtures.datatype);
        //     request(sails.hooks.http.app)
        //         .get('/subject/edit?id=2')
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
        //         .get('/subject/edit?id=2')
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
        // it('Should return 403 FORBIDDEN - Authenticated user does not have edit privileges on the subject type', function (done) {
        //     console.log(fixtures.datatype);
        //     request(sails.hooks.http.app)
        //         .get('/subject/edit?id=2')
        //         .set('Authorization', `Bearer ${tokenS}`)
        //         .send()
        //         .expect(403)
        //         .end(function(err, res) {
        //             // console.log(err,res);
        //             expect(res.body.error.message).to.be.equal("Authenticated user does not have edit privileges on the subject type");
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
            .set('Authorization', `Bearer ${tokenSA}`)
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
            .set('Authorization', `Bearer ${tokenSA}`)
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
