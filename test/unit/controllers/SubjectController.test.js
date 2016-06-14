/* jshint node: true */
/* jshint mocha: true */
/* globals _, sails, fixtures */
"use strict";

const expect = require("chai").expect;
const request = require('supertest');
const loginHelper = require('./loginHelper');

describe('SubjectController', function() {
    let token;

    before(function(done) {
        loginHelper.loginAdminUser(request, function (bearerToken) {
            token = bearerToken;
            sails.log.debug(`Got token: ${token}`);
            done();
        });
    });

    describe('POST /subject', function() {
        it('Should return OK 201, with location of new subject', function(done) {

            request(sails.hooks.http.app)
            .post('/subject')
            .set('Authorization', `Bearer ${token}`)
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
            .expect(function(res) {
                const l = res.header.location;
                const loc = l.split('/');
                const location = `/${loc[3]}/${loc[4]}`;
                expect(location).to.equals('/subject/4');
            })
            .expect(201, done);


        });

        it('Should return 400, Wrong Model', function(done) {

            request(sails.hooks.http.app)
            .post('/subject')
            .set('Authorization', `Bearer ${token}`)
            .send({
                type: 3,
                metadata: {},
                date: "2015-12-06",
                tags: [],
                notes: "New subject"
            })
            .expect(400, done);

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
            .set('Authorization', `Bearer ${token}`)
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
            .expect(function(res) {
                //console.log(res.body[0].notes);
                expect(res.body[0].notes).to.equals(note);
            })
            .expect(200, done);
            //}).catch(function(err){console.log(err);});
        });

        it('Should return 400, Wrong Model', function(done) {

            request(sails.hooks.http.app)
            .put('/subject/2')
            .set('Authorization', `Bearer ${token}`)
            .send({
                id: 2,
                type: 3,
                metadata: {},
                date: "2015-12-06",
                tags: [],
                notes: "New subject"
            })
            .expect(400, done);
        });

    });

    describe('GET /subject', function() {
        it('Should return OK 200', function(done) {

            request(sails.hooks.http.app)
            .get('/subject')
            .set('Authorization', `Bearer ${token}`)
            //.send({id:1})
            .expect(function(res) {
                console.log(res.body);
                expect(res.body).to.have.length(fixtures.subject.length + 1);
            })
            .expect(200, done);

        });
        //
        //        it('Should return 400, metadata required', function (done) {
        //
        //           request(sails.hooks.http.app)
        //             .get('/subject/2')
        //             .set('Authorization',`Bearer ${token}`)
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
            .delete('/subject/2')
            .set('Authorization', `Bearer ${token}`)
            .expect(function(res) {
                console.log('N° Subject deleted: ' + res.body.deleted);
                expect(res.body.deleted).to.equals(1);
            })
            .expect(200, done);
        });

        it('Should return OK 200, with array lenght to 0', function (done) {

            request(sails.hooks.http.app)
            .delete('/subject/5')
            .set('Authorization',`Bearer ${token}`)
            .expect(function(res) {
                console.log('N° Subject deleted: ' + res.body.deleted);
                expect(res.body.deleted).to.equals(0);
            })
            .expect(200, done);
        });


    });
});
