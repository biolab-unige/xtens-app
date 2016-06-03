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
        loginHelper.login(request, function (bearerToken) {
            token = bearerToken;
            sails.log.debug(`Got token: ${token}`);
            done();
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
                metadata: {},
            })
            .expect(function(res) {
                const l = res.header.location;
                const loc = l.split('/');
                const location = `/${loc[3]}/${loc[4]}`;
                expect(location).to.equals('/sample/2');
            })
            .expect(201, done);


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
                metadata: {},
            })
            .expect(400, done);

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
                metadata: {},
            })
            .expect(function(res) {
                //console.log(res.body[0].notes);
                expect(res.body[0].biobank).to.equals(biobank);
            })
            .expect(200, done);
            //}).catch(function(err){console.log(err);});
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
                metadata: {},
            })
            .expect(400, done);
        });

    });
    //
    describe('GET /sample', function() {
        it('Should return OK 200', function(done) {

            request(sails.hooks.http.app)
            .get('/sample')
            .set('Authorization', `Bearer ${token}`)
            .expect(function(res) {
                sails.log(`Response lenght: ${res.body && res.body.length}`);
                expect(res.body).to.have.length(fixtures.sample.length + 1);
            })
            .expect(200, done);

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
            .expect(function(res) {
                sails.log('N° Sample deleted: ' + res.body.deleted);
                expect(res.body.deleted).to.equals(1);
            })
            .expect(200, done);
        });

        it('Should return OK 200, with array lenght to 0', function (done) {
            request(sails.hooks.http.app)
            .delete('/sample/5')
            .set('Authorization',`Bearer ${token}`)

            .expect(function(res) {
                sails.log('N° Sample deleted: ' + res.body.deleted);
                expect(res.body.deleted).to.equals(0);
            })
            .expect(200, done);
        });


    });
});
