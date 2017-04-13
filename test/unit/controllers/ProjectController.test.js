/* jshint node: true */
/* jshint mocha: true */
/* globals , sails, fixtures */
"use strict";

const expect = require("chai").expect;
const request = require('supertest');
const loginHelper = require('./loginHelper');
const sinon = require('sinon');

describe('ProjectController', function() {

    let tokenSuperUser, tokenNoDataSens;

    before(function(done) {
        loginHelper.loginSuperAdmin(request, function (bearerToken) {
            tokenSuperUser = bearerToken;
            sails.log.debug(`Got token: ${tokenSuperUser}`);

            loginHelper.loginAnotherStandardUserNoDataSens(request, function (bearerToken2) {
                tokenNoDataSens = bearerToken2;
                sails.log.debug(`Got token: ${tokenNoDataSens}`);
                done();
                return;
            });
        });
    });

    describe('FIND /project/find', function() {

        it('Should return 200 OK with an array of projects', function (done) {
            let expectedProjects = _.cloneDeep(fixtures.project);
            request(sails.hooks.http.app)
                .get('/project')
                .set('Authorization', `Bearer ${tokenSuperUser}`)
                .send()
                .expect(200)
                .end(function(err, res) {
                    expect(res.body.length).to.eql(expectedProjects.length);
                    if (err) {
                        sails.log.error(err);
                        done(err);
                        return;
                    }
                    done();
                    return;
                });
        });

        it('Should return 200 OK with an array of projects', function (done) {
            let expectedProjects = _.cloneDeep(fixtures.project);

            request(sails.hooks.http.app)
                .get('/project')
                .set('Authorization', `Bearer ${tokenNoDataSens}`)
                .send()
                .expect(200)
                .end(function(err, res) {
                    if (err) {
                        sails.log.error(err);
                        done(err);
                        return;
                    }
                    expect(res.body.length).to.eql(expectedProjects.length);
                    done();
                    return;
                });

        });
    });

    describe('EDIT /project/edit', function() {

        it('Should return 200 OK with an object containing all information required', function (done) {

            request(sails.hooks.http.app)
                .get('/project/edit?id=1')
                .set('Authorization', `Bearer ${tokenSuperUser}`)
                .send()
                .expect(200)
                .end(function(err, res) {
                    // console.log(res.body);
                    expect(res.body.project).to.exist;
                    expect(res.body.project.id).to.eql(1);
                    expect(res.body.groups).to.exist;
                    expect(res.body.groups).to.be.empty;

                    if (err) {
                        sails.log.error(err);
                        done(err);
                        return;
                    }
                    done();
                    return;
                });
        });

        it('Should return 403 FORBIDDEN - Authenticated user is not a super user', function (done) {

            request(sails.hooks.http.app)
                .get('/project/edit?id=1')
                .set('Authorization', `Bearer ${tokenNoDataSens}`)
                .send()
                .expect(403)
                .end(function(err, res) {
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
});
