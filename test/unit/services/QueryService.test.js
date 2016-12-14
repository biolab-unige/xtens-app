/* globals _, sails, fixtures, QueryService, Data */
"use strict";
const expect = require('chai').expect, sinon = require('sinon');
const actionUtil = require('sails/lib/hooks/blueprints/actionUtil');

// var BluebirdPromise = require('bluebird');

describe('QueryService', function() {

    describe('parseCriteria', function() {

        it("should return the criterias as stored in the 'where' property, if present", function() {



        });

    });

    /**
     * TODO stub the promise chain
     */
    describe('composeHeaderInfo', function() {

        let parseModelStub, parseCriteriaStub, parseLimitStub, parseSkipStub, mockReq;

        beforeEach(() => {
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
                    skip: 10,
                },
                allParams: function() {
                    return this.params;
                }
            };

            parseModelStub = sinon.stub(actionUtil, 'parseModel', () => {
                return Data;
            });

            parseCriteriaStub = sinon.stub(actionUtil, 'parseCriteria', () => null);
            parseLimitStub = sinon.stub(actionUtil, 'parseLimit', req => req.params.limit);
            parseSkipStub = sinon.stub(actionUtil, 'parseSkip', req => req.params.skip);

        });

        afterEach(() => {
            parseModelStub.restore();
            // this.modelCountStub.restore();
            parseCriteriaStub.restore();
            parseSkipStub.restore();
            parseLimitStub.restore();
        });

        it('should compose correctly the header info given the response', function() {
            const url = `${mockReq.baseUrl}${mockReq.path}`, totalCount = fixtures.data.length,
                numPages = Math.ceil(totalCount/5);
            return QueryService.composeHeaderInfo(mockReq).then(headerInfo => {
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
            });
        });

    });

});
