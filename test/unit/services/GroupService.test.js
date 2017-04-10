/* jshint node:true */
/* jshint mocha: true */
/* globals _, sails, fixtures, GroupService, Group */
"use strict";
var chai = require("chai");
var expect = chai.expect, sinon = require('sinon');

var callback = sinon.stub();

describe('GroupService', function() {

    describe('#getGroupsToEditProject', function() {

        it("should return an empty array, because all existing groups are yet associated with project 1", function(done) {
            var idProject = fixtures.project[0].id;

            GroupService.getGroupsToEditProject(idProject).then(function (err,res) {

                expect(res).to.be.empty;
                done();
                return;
            });
        });

        it("should return an array containg all existing groups beacuse no one is yet associated with project 5", function(done) {
            var idProject = "6";
            var expectedGroups = _.cloneDeep(fixtures.group);
            GroupService.getGroupsToEditProject(idProject).then(function (res) {
                expect(res.length).to.eql(expectedGroups.length);
                done();
                return;
            });
        });

    });

    describe('#getGroupsByProject', function() {

        it("should return the right set of groups", function(done) {
            var idProject = fixtures.project[0].id;
            var expectedGroups = _.cloneDeep(fixtures.group);
            GroupService.getGroupsByProject(idProject).then(function (res) {

                expect(res.length).to.eql(expectedGroups.length);
                done();
                return;
            });
        });
    });

    describe('#getAsync', function() {

        var spy;

        beforeEach(function() {
            spy = sinon.spy(Group, "find");
        });

        afterEach(function() {
            Group.find.restore();
        });

        it("should not fire the Group.find method with ", function() {
            GroupService.get(null, callback);
            GroupService.get(0, callback);
            expect(spy.called).to.be.true;
        });

        it("should fire the Group.find operation", function() {
            GroupService.getAsync(1, callback);
            expect(spy.withArgs(1).calledOnce).to.be.false;
        });

    });

});
