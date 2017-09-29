/* globals _, sails, fixtures, QueryService, Data */
"use strict";
const expect = require('chai').expect, sinon = require('sinon');
const actionUtil = require('sails/lib/hooks/blueprints/actionUtil');

// var BluebirdPromise = require('bluebird');

describe('QueryService', function() {



    /**
     * TODO stub the promise chain
     */
    describe('#composeHeaderInfo', function() {

        let parseModelStub, parseCriteriaStub, parseLimitStub, parseSkipStub, mockReq;

        beforeEach((done) => {
            mockReq = {
                baseUrl: 'http:/localhost:80',
                path: '/data',
                params: {
                    /*
                    where: {
                        'type': 3,
                        'radius': {'>': 10}
                    },*/
                    limit: 5,
                    skip: 10
                },
                allParams: function() {
                    return this.params;
                }
            };

            parseModelStub = sinon.stub(actionUtil, 'parseModel', () => {
                return Data;
            });

            parseCriteriaStub = sinon.stub(actionUtil, 'parseCriteria', () => {return {};});
            parseLimitStub = sinon.stub(actionUtil, 'parseLimit', req => req.params.limit);
            parseSkipStub = sinon.stub(actionUtil, 'parseSkip', req => req.params.skip);
            done();
            return;
        });

        afterEach((done) => {
            parseModelStub.restore();
            // this.modelCountStub.restore();
            parseCriteriaStub.restore();
            parseSkipStub.restore();
            parseLimitStub.restore();
            done();
            return;
        });

        it('should compose correctly the header info given the response', function(done) {
            const url = `${mockReq.baseUrl}${mockReq.path}`, totalCount = fixtures.data.length,
                privileges = _.where(fixtures.datatypeprivileges, { 'group': 1 }),
                numPages = Math.ceil(totalCount/5);
            return QueryService.composeHeaderInfo(mockReq,privileges).then(headerInfo => {
                expect(headerInfo).to.be.not.empty;
                expect(headerInfo).to.have.property('count', totalCount);
                expect(headerInfo).to.have.property('pageSize', 5);
                expect(headerInfo).to.have.property('numPages', numPages);
                expect(headerInfo).to.have.property('currPage', 2);
                expect(headerInfo).to.have.deep.property('links[0].value').that.is.oneOf(
                    [`${url}?skip=15&limit=5`, `${url}?limit=5&skip=15`]
                );
                expect(headerInfo).to.have.deep.property('links[0].rel', 'next');
                expect(headerInfo).to.have.deep.property('links[1].value').that.is.oneOf(
                    [`${url}?skip=5&limit=5`, `${url}?limit=5&skip=5`]
                );
                expect(headerInfo).to.have.deep.property('links[1].rel', 'previous');
                expect(headerInfo).to.have.deep.property('links[2].value').that.is.oneOf(
                    [`${url}?skip=&limit=5`, `${url}?limit=5&skip=`]
                );
                expect(headerInfo).to.have.deep.property('links[2].rel', 'first');
                expect(headerInfo).to.have.deep.property('links[3].value').that.is.oneOf(
                    [`${url}?skip=${(numPages-1)*5}&limit=5`, `${url}?limit=5&skip=${(numPages-1)*5}`]
                );
                expect(headerInfo).to.have.deep.property('links[3].rel', 'last');
                done();
                return;
            });
        });

    });

    describe('#parseSelect', function() {

        it("should return the select string parsed", function() {
            const strigToBeParsed = '[{"example":10}]';
            const expectedObject = JSON.parse(strigToBeParsed);
            let req = {
                baseUrl: 'http:/localhost:80',
                path: '/data',
                params: {
                    select: strigToBeParsed
                },
                param: function(par) {
                    return this.params[par];
                }
            };

            let res = QueryService.parseSelect(req);
            expect(res['select']).to.eql(expectedObject);

        });

        it("should return null with a wrong string object", function() {
            const strigToBeParsed = '[{wrongobject}]';

            let req = {
                baseUrl: 'http:/localhost:80',
                path: '/data',
                params: {
                    select: strigToBeParsed
                },
                param: function(par) {
                    return this.params[par];
                }
            };

            let res = QueryService.parseSelect(req);
            expect(res).to.be.null;
        });

        it("should return null with no select string ", function() {
            const strigToBeParsed = '';

            let req = {
                baseUrl: 'http:/localhost:80',
                path: '/data',
                params: {
                    select: false
                },
                param: function(par) {
                    return this.params[par];
                }
            };

            let res = QueryService.parseSelect(req);
            expect(res).to.be.null;
        });

        it("should return null with an empty object select string", function() {
            const strigToBeParsed = '{}';

            let req = {
                baseUrl: 'http:/localhost:80',
                path: '/data',
                params: {
                    select: strigToBeParsed
                },
                param: function(par) {
                    return this.params[par];
                }
            };

            let res = QueryService.parseSelect(req);
            expect(res).to.be.null;
        });
    });

    describe('#parseParams', function() {

        let parseCriteriaStub, mockReq;

        beforeEach(() => {
            mockReq = {
                baseUrl: 'http:/localhost:80',
                path: '/data',
                params: {
                    parentSubject:1,
                    parentSample:13
                },
                allParams: function() {
                    return this.params;
                }
            };

            parseCriteriaStub = sinon.stub(actionUtil, 'parseCriteria', () => { return { parentSubject:1, parentSample:13 }; });
        });

        afterEach(() => {
            parseCriteriaStub.restore();
        });

        it('should compose correctly the where params object including privileges', function() {

            const privileges = _.where(fixtures.datatypeprivileges, { 'group': 1 });
            const expectedType = privileges.map(el => el.dataType);
            const resultParams = QueryService.parseParams(mockReq, privileges);

            console.log(resultParams);

            expect(resultParams).to.be.not.empty;
            expect(resultParams).to.have.property('parentSubject').that.is.deep.equal(1);
            expect(resultParams).to.have.property('parentSample').that.is.deep.equal(13);
            expect(resultParams).to.have.property('type').that.is.deep.equal(expectedType);

        });

        it('should compose correctly the where params object without privileges', function() {

            const privileges = _.where(fixtures.datatypeprivileges, { 'group': 8 });
            const resultParams = QueryService.parseParams(mockReq, privileges);

            expect(resultParams).to.be.not.empty;
            expect(resultParams).to.have.property('parentSubject').that.is.deep.equal(1);
            expect(resultParams).to.have.property('parentSample').that.is.deep.equal(13);
            expect(resultParams).to.not.have.property('type');

        });
    });

});
