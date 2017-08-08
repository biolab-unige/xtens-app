/* jshint node:true */
/* jshint mocha: true */
/* globals _, sails, fixtures, OperatorService, DataType*/
"use strict";
var chai = require("chai");
var expect = chai.expect, sinon = require('sinon');

describe('OperatorService', function() {

    describe('#getOwners', function() {

        it("should return an empty array", function(done) {
            // var idProject = fixtures.project[0].id;

            OperatorService.getOwners().then(function (err,res) {

                expect(res).to.be.empty;
                done();
                return;
            });
        });


        it("should return an array containg all elegible owners", function(done) {
            let spy = sinon.spy(DataType, "findOne");
            var datum = _.cloneDeep(fixtures.data[0]);
            datum.type = _.cloneDeep(fixtures.datatype[2]);
            var expectedOperators = _.cloneDeep(fixtures.operator);

            OperatorService.getOwners(datum).then(function (res) {
                sinon.assert.notCalled(spy);
                expect(res.length).to.eql(expectedOperators.length);

                DataType.findOne.restore();
                done();
                return;
            });
        });

        it("should return an array containg all elegible owners retrieving dataType ", function(done) {
            let spy = sinon.spy(DataType, "findOne");
            var datum = _.cloneDeep(fixtures.data[0]);
            var expectedOperators = _.cloneDeep(fixtures.operator);
            OperatorService.getOwners(datum).then(function (res) {
                sinon.assert.called(spy);
                expect(res.length).to.eql(expectedOperators.length);

                DataType.findOne.restore();
                done();
                return;
            });
        });
    });

});
