/* jshint node:true */
/* jshint mocha: true */
/* globals _, sails, fixtures, ProjectService */
"use strict";
var chai = require("chai");
var expect = chai.expect;

describe('ProjectService', function() {

    describe('#getOne', function() {

        it("should return the right Project", function(done) {
            var expectedProject = _.cloneDeep(fixtures.project[0]);
            var idProject = expectedProject.id;
            ProjectService.getOne(idProject, (err, res) =>{

                expect(res.id).to.eql(expectedProject.id);
                expect(res.name).to.eql(expectedProject.name);

                done();
                return;
            });
        });

        it("should not return any project", function(done) {
            var idProject = undefined;
            ProjectService.getOne(idProject, (err, res) =>{
                expect(res).to.be.null;
                expect(err).to.be.null;
                done();
                return;
            });
        });

    });

});
