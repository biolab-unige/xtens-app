/* jshint node:true */
/* jshint mocha: true */
/* globals _, sails, fixtures, BiobankService */
"use strict";
var chai = require("chai");
var expect = chai.expect;

describe('DataService', function() {

    describe('#get', function() {

        it("should return all biobanks", function(done) {
            var expectedBiobanks = _.cloneDeep(fixtures.biobank);
            var params = {};
            BiobankService.get(params, (err, res) =>{
                expect(res.length).to.eql(expectedBiobanks.length);
                expect(res[0].id).to.eql(expectedBiobanks[0].id);
                done();
                return;
            });
        });

        it("should return the right biobank", function(done) {
            var expectedBiobank = _.cloneDeep(fixtures.biobank[1]);
            var params = {idBiobanks:"2"};
            BiobankService.get(params, (err, res) =>{
                expect(res.length).to.eql(1);
                expect(res[0].id).to.eql(expectedBiobank.id);
                done();
                return;
            });
        });

    });

});
