/* jshint node: true */
/* jshint mocha: true */
/* globals , sails, fixtures */
"use strict";

const expect = require("chai").expect;
const request = require('supertest');
const loginHelper = require('./loginHelper');

describe('DataController', function() {

    let tokenDataSens, tokenNoDataSens;

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
                done();
                return;
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
    });

    describe('GET /data', function() {

        it('Should return OK 200 and expected n° of data', function (done) {
            request(sails.hooks.http.app)
            .get('/data')
            .set('Authorization', `Bearer ${tokenDataSens}`)
            //.send({id:1})
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

        it('Should return 403 FORBIDDEN without data', function (done) {

            request(sails.hooks.http.app)
                .get('/data/edit?id=1')
                .set('Authorization', `Bearer ${tokenNoDataSens}`)
                .send()
                .expect(403)
                .end(function(err, res) {
                    console.log("Res edit: "+JSON.stringify(res.body));
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
    });
});
