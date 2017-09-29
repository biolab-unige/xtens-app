/* jshint node:true */
/* jshint mocha: true */
/* globals _, sails, fixtures, SuperTypeService */
"use strict";
var chai = require("chai");
var expect = chai.expect;

describe('SuperTypeService', function() {

    describe('#isMultiProject', function() {

        it("should return Error - isMultiProject - Error: No SuperType object", function(done) {
            // var expectedBiobanks = _.cloneDeep(fixtures.superType[]);
            var expectedError = new Error("isMultiProject - Error: No SuperType object");
            return SuperTypeService.isMultiProject().then(( res )=>{
                // console.log(err,res);
                expect(res).to.eql(expectedError);
                done();
                return;
            });
        });

        it("should return FALSE. Super type is not shared between project", function(done) {
            var superType = _.cloneDeep(fixtures.supertype[1]);
            // var params = {idBiobanks:"2"};
            return SuperTypeService.isMultiProject(superType).then(( res ) =>{
                expect(res).to.eql(false);
                done();
                return;
            });
        });

        it("should return TRUE. Super type is shared between project", function(done) {
            var superType = _.cloneDeep(fixtures.supertype[2]);
            // var params = {idBiobanks:"2"};
            return SuperTypeService.isMultiProject(superType).then(( res ) =>{
                expect(res).to.eql(true);
                done();
                return;
            });
        });

        it("should work passing id and return TRUE. Super type is shared between project", function(done) {
            var superType = _.cloneDeep(fixtures.supertype[2]);
            // var params = {idBiobanks:"2"};
            return SuperTypeService.isMultiProject(superType.id).then(( res ) =>{
                expect(res).to.eql(true);
                done();
                return;
            });
        });

    });

});
