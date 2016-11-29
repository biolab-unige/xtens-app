/* jshint node: true */
/* jshint mocha: true */
/* globals _, sails, fixtures */
"use strict";

const expect = require("chai").expect;
const request = require('supertest');
//var cloneDeep = require('clone-deep');
// var token = require("../../../config/local.js").token;
const loginHelper = require('./loginHelper');


describe('SampleController', function() {

    let token;

    before(function(done) {
        loginHelper.loginAdminUser(request, function (bearerToken) {
            token = bearerToken;
            sails.log.debug(`Got token: ${token}`);
            done();
            return;
        });
    });


    describe('POST /sample', function() {
        it('Should return OK 201, with location of new sample', function(done) {

            request(sails.hooks.http.app)
            .post('/sample')
            .set('Authorization', `Bearer ${token}`)
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
                    sails.log.console.error(err);
                    done(err);
                }
                var l = res.header.location;
                var loc = l.split('/');
                var location = '/' + loc[3]+ '/' + loc[4];
                expect(location).to.equals('/sample/2');
                done();
                return;
            });


        });

        it('Should return 400, Wrong Model', function(done) {

            request(sails.hooks.http.app)
            .post('/sample')
            .set('Authorization', `Bearer ${token}`)
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
            .put('/sample/2')
            .set('Authorization', `Bearer ${token}`)
            .send({
                type: 2,
                biobank: biobank,
                biobankCode: "081852",
                donor: 11,
                metadata: {}
            }).expect(200)
            .end(function(err, res) {
                console.log(res.body[0].biobank);
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
            .put('/sample/2')
            .set('Authorization', `Bearer ${token}`)
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
    //
    describe('GET /sample', function() {
        it('Should return OK 200 and expected n° of samples', function(done) {

            request(sails.hooks.http.app)
            .get('/sample')
            .set('Authorization', `Bearer ${token}`)
            .expect(200)
            .end(function(err, res) {
                expect(res.body).to.have.length(fixtures.sample.length + 1);
                if (err) {
                    sails.log.console.error(err);
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
            .set('Authorization', `Bearer ${token}`)
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
        //   //
        //   //        it('Should return 400, metadata required', function (done) {
        //   //
        //   //           request(sails.hooks.http.app)
        //   //             .get('/sample/2')
        //   //             .set('Authorization',`Bearer ${token}`)
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
            .delete('/sample/2')
            .set('Authorization', `Bearer ${token}`)
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

        it('Should return OK 200, with array lenght to 0', function (done) {
            request(sails.hooks.http.app)
            .delete('/sample/5')
            .set('Authorization',`Bearer ${token}`)
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
});
