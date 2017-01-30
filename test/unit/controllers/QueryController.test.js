/* jshint node: true */
/* jshint mocha: true */
/* globals _, sails, fixtures, TokenService, DataType, DataService, Data */
"use strict";

const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
const chaiStream = require('chai-stream');
chai.use(chaiAsPromised);
chai.use(chaiStream);
const request = require('supertest');
const loginHelper = require('./loginHelper');
const fs = require('fs');
const expect = chai.expect, assert = chai.assert, sinon = require('sinon');

describe('QueryController', function() {
    let token;

    before(function(done) {
        loginHelper.loginAdminUser(request, function (bearerToken) {
            token = bearerToken;
            sails.log.debug(`Got token: ${token}`);
            done();
        });
    });

    describe('POST /query', function() {

        var queryStub, queryStreamStub,
            expectedData = [{
                "id":1,
                "type":3,
                "date": "2012-12-28",
                "metadata": {
                    "name":{"value":"Aldebaran","group":"Generic Info"},
                    "constellation":{"value":"orion","group":"Generic Info"},
                    "classification":{"value":"giant","group":"Generic Info"},
                    "designation":{"values":["87 Tauri","Alpha Tauri","SAO 94027","Borgil(?)"],"group":"Generic Info","loop":"Other Designations"},
                    "mass":{"value":1.7,"unit":"M☉","group":"Physical Details"},
                    "radius":{"value":44.2,"unit":"R☉","group":"Physical Details"},
                    "luminosity":{"value":518,"unit":"L☉","group":"Physical Details"},
                    "temperature":{"value":3910,"unit":"K","group":"Physical Details"}
                },
                "tags": ["test","a test"],
                "notes": "just a test"
            }];

        beforeEach(function() {
            var dataType = _.cloneDeep(fixtures.datatype[2]);
            var dataPrivilege = _.cloneDeep(fixtures.datatypeprivileges[2]);
            var queryObj = { statement: "WITH s AS (SELECT id, code, sex, personal_info FROM subject) SELECT DISTINCT d.id, s.code, s.sex, d.metadata FROM data d LEFT JOIN s ON s.id = d.parent_subject WHERE d.type = $1;", parameters: [dataType.id]};

            queryStub = sinon.stub(sails.hooks['persistence'].getDatabaseManager().crudManager, "query", function(query, next) {

                if (query.statement === queryObj.statement && _.isArray(query.parameters)) {
                    next(null, {rows:expectedData});
                }
                else {
                    next(new Error("wrong or malformed query argumenent"));
                }
            });

            queryStreamStub = sinon.stub(sails.hooks['persistence'].getDatabaseManager().crudManager, "queryStream", function(query, next) {

                let stream = fs.createReadStream('./test/resources/data.json', {encoding: 'utf8'});
                return next(stream,null);

            });
        });
        afterEach(function() {
            sails.hooks['persistence'].getDatabaseManager().crudManager.query.restore();
            sails.hooks['persistence'].getDatabaseManager().crudManager.queryStream.restore();
        });

        it('Should return OK 200, with a json response', function(done) {

            request(sails.hooks.http.app)
            .post('/query/dataSearch')
            .set('Authorization', `Bearer ${token}`)
            .set('Content-type', 'application/x-www-form-urlencoded; charset=UTF-8')
            .send({
                "queryArgs":{
                    "wantsSubject":false,
                    "dataType":3,
                    "model":"Data",
                    "content":[]
                },
                "isStream":false
            })
            .expect(200)
            .end(function(err,res) {
                // console.log(err,res);
                if(err){done(err); return;}
                expect(res.headers['content-type']).to.eql('application/json; charset=utf-8');
                expect(res.body.data).to.eql(expectedData);
                done();
            });
            return;
        });

        it('Should return OK 200, with a Readable Stream and the rigth data', function(done) {

            request(sails.hooks.http.app)
            .post('/query/dataSearch')
            .set('Authorization', `Bearer ${token}`)
            .set('Content-type', 'application/x-www-form-urlencoded; charset=UTF-8')
            .send({
                "queryArgs":{
                    "wantsSubject":false,
                    "dataType":3,
                    "model":"Data",
                    "content":[]
                },
                "isStream":true
            })
            .expect(200)
            .end(function(err,res) {
                if(err){done(err); return;}

                let temp = JSON.parse(res.text);
                let dataResult = JSON.parse(temp);

                expect(res).to.be.a.ReadableStream;
                expect(dataResult).to.eql(expectedData);
                done();
            });
            return;
        });

    });

});
