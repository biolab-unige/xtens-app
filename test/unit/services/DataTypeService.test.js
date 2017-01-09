"use strict";
var chai = require("chai");
var chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
var expect = chai.expect, assert = chai.assert, sinon = require('sinon');
var BluebirdPromise = require("bluebird");

describe('DataTypeService', function() {

    describe("#validateMetadataField", function() {

        it("should correctly validate a valid metadata field", function() {
            var field = _.cloneDeep(fixtures.datatype[2].schema.body[0].content[3].content[0]);
            var result = DataTypeService.validateMetadataField(field);
            expect(result.error).to.be.null;
        });
    });

    describe("#validate", function() {

        it("should validate a correctly structured data type schema", function() {
            var dataType = _.cloneDeep(fixtures.datatype[2]);
            var result = DataTypeService.validate(dataType, true);  // validate schema as well
            expect(result.error).to.be.null;
            expect(result.value).to.eql(dataType);
        });

        it("should not validate a wrongly structured data type schema with error in header", function() {
            var dataType = _.cloneDeep(fixtures.datatype[2]);
            dataType.schema.header.model = "Invalid Model";
            var result = DataTypeService.validate(dataType, true);  // validate schema as well
            expect(result.error).not.to.be.null;
            expect(result.error).to.be.an.instanceof(Error);
        });

        it("should not validate a wrongly structured data type schema with error in body (wrong metadata field)", function() {
            var dataType = _.cloneDeep(fixtures.datatype[2]);
            dataType.schema.body[0].content[3].content[0].unauthorisedProperty = "This should not be here";
            var result = DataTypeService.validate(dataType, true);  // validate schema as well
            expect(result.error).not.to.be.null;
            expect(result.error).to.be.an.instanceof(Error);
        });

        it("should validate a correctly structured data type schema with a case-insensitive textual field", function() {
            var dataType = _.cloneDeep(fixtures.datatype[2]);
            dataType.schema.body[0].content[0].caseInsensitive = true;
            var result = DataTypeService.validate(dataType, true);  // validate schema as well
            expect(result.error).to.be.null;
            expect(result.value).to.eql(dataType);
        });

        it("should validate a correctly structured data type schema with a case sensitive list field", function() {
            var dataType = _.cloneDeep(fixtures.datatype[2]);
            dataType.schema.body[0].content[1].caseInsensitive = false;
            var result = DataTypeService.validate(dataType, true);  // validate schema as well
            expect(result.error).to.be.null;
            expect(result.value).to.eql(dataType);
        });

        it("should not validate a wrongly structured data type schema with a case-insensitive metadata field from list", function() {
            var dataType = _.cloneDeep(fixtures.datatype[2]);
            dataType.schema.body[0].content[1].caseInsensitive = true;  // this is not allowed cause Constellation is from list
            var result = DataTypeService.validate(dataType, true);
            expect(result.error).not.to.be.null;
            expect(result.error).to.be.an.instanceof(Error);
        });

    });


    describe('#getFlattenedFields', function() {

        it('returns a 1-d array with all the metadata fields', function() {
            DataType.findOne(3).exec(function(err, dataType) {
                var flattened = DataTypeService.getFlattenedFields(dataType) || [];
                expect(flattened).to.have.length(9);
                flattened.forEach(function(field){
                    expect(field.label).to.equal("METADATA FIELD");
                });
                expect(flattened[0].name).to.equal('Name');
                expect(flattened[1].name).to.equal('Constellation');
                expect(flattened[2].name).to.equal('Classification');
                expect(flattened[3].name).to.equal('Designation');
                expect(flattened[4].name).to.equal('Mass');
                expect(flattened[5].name).to.equal('Radius');
                expect(flattened[6].name).to.equal('Luminosity');
                expect(flattened[7].name).to.equal('Temperature');
            });
        });

    });

    describe('#putMetadataFieldsIntoEAV', function() {

        beforeEach(function() {
            /*
            this.eavAttributeCreate = sinon.stub(EavAttribute,'create');
            this.eavLoopCreate = sinon.stub(EavLoop,'create'); */
            this.dataType = fixtures.datatype[2];
            this.fields = DataTypeService.getFlattenedFields(this.dataType, false);
            this.crudManager = sails.config.xtens.crudManager;
            this.transactionalPutMetadataFieldsIntoEAV = sinon.stub(this.crudManager, 'putMetadataFieldsIntoEAV', function() {
                return BluebirdPromise.try(function() { return [1]; });
            });
        });

        afterEach(function() {
            this.crudManager.putMetadataFieldsIntoEAV.restore();
        });

        it('should populate the table eav_attribute', function() {

            var _this = this;

            return DataTypeService.putMetadataFieldsIntoEAV(this.dataType).then(function(res) {
                sails.log('testing after promise fulfilled');
                expect(_this.transactionalPutMetadataFieldsIntoEAV.calledOnce).to.be.true;
            });

        });
    });

    describe('#getDataTypePrivilegeLevel', function() {

        it("should return the right privilege level of the given DataType for the operator", function(done) {

            DataTypeService.getDataTypePrivilegeLevel(1, 1).then(function(result) {
                // sails.log("DataType Privilege Level: " + JSON.stringify(result));

                expect(result.privilegeLevel).to.be.equal("edit");
                done();
            }).catch(function(err) {
                done(err);
            });
        });

        it("should return undefined", function(done) {

            DataTypeService.getDataTypePrivilegeLevel(1,undefined).then(function(result) {
                // sails.log("DataType Privilege Level: " + JSON.stringify(result));

                expect(result).to.be.undefined;
                done();
            }).catch(function(err) {
                done(err);
            });
        });

        it("should return an empty array", function(done) {

            DataTypeService.getDataTypePrivilegeLevel(8,5).then(function(result) {
                // sails.log("DataType Privilege Level: " + JSON.stringify(result));

                expect(result).to.be.empty;
                done();
            }).catch(function(err) {
                done(err);
            });
        });
    });

    describe('#getDataTypeToEditPrivileges', function() {

        it("should return the right DataType of the given Privilege", function(done) {
            const expectedDataType = _.cloneDeep(fixtures.datatype[0]);

            DataTypeService.getDataTypeToEditPrivileges(1).then(function(result) {

                expect(result.id).to.be.equal(expectedDataType.id);
                expect(result.model).to.be.equal(expectedDataType.model);
                expect(result.name).to.be.equal(expectedDataType.name);
                done();
            }).catch(function(err) {
                done(err);
            });
        });

        it("should return undefined", function(done) {

            DataTypeService.getDataTypeToEditPrivileges().then(function(result) {

                expect(result).to.be.undefined;
                done();
            }).catch(function(err) {
                done(err);
            });
        });
    });

    describe('#getDataTypesToCreateNewPrivileges', function() {

        it("should return the right DataType of the given Privilege", function(done) {
            const expectedDataType = [_.cloneDeep(fixtures.datatype[5])];

            DataTypeService.getDataTypesToCreateNewPrivileges(1).then(function(result) {

                expect(result[0].id).be.equal(expectedDataType[0].id);
                done();
            }).catch(function(err) {
                done(err);
            });
        });

        it("should return undefined", function(done) {

            DataTypeService.getDataTypesToCreateNewPrivileges().then(function(result) {

                expect(result).to.be.undefined;
                done();
            }).catch(function(err) {
                done(err);
            });
        });

    });

    describe('#filterDataTypes', function() {

        it("should return the right set of DataTypes", function(done) {
            const dataTypes = _.cloneDeep(fixtures.datatype);
            const expectedDataTypes = _.reject(dataTypes, function (dt) {
                return dt.name === "Variant Annotation";
            });

            DataTypeService.filterDataTypes(1, dataTypes).then(function(result) {

                expect(result.length).be.equal(expectedDataTypes.length);
                done();
            }).catch(function(err) {
                done(err);
            });
        });

        it("should return undefined", function(done) {

            DataTypeService.filterDataTypes(1).then(function(result) {

                expect(result).to.be.undefined;
                done();
            }).catch(function(err) {
                done(err);
            });
        });

        it("should return an empty array", function(done) {

            DataTypeService.filterDataTypes(8,4).then(function(result) {

                expect(result).to.be.empty;
                done();
            }).catch(function(err) {
                done(err);
            });
        });

    });

    describe('#getDataTypePrivileges', function() {

        it("should return the right set of DataTypes", function(done) {
            const expectedDataTypePrivilege = _.cloneDeep(fixtures.datatypeprivileges[0]);

            DataTypeService.getDataTypePrivileges(1, function(err ,result) {

                expect(result.id).be.equal(expectedDataTypePrivilege.id);
                expect(result.dataType).be.equal(expectedDataTypePrivilege.dataType);
                expect(result.group).be.equal(expectedDataTypePrivilege.group);
                expect(result.group).be.equal(expectedDataTypePrivilege.group);
                expect(result.privilegeLevel).be.equal(expectedDataTypePrivilege.privilegeLevel);

                done();
                return;
            });
        });

        it("should return undefined", function(done) {
            const expectedDataTypePrivilege = _.cloneDeep(fixtures.datatypeprivileges[0]);

            DataTypeService.getDataTypePrivileges(false,function(err ,result) {

                expect(result).to.be.undefined;

                done();
                return;
            });
        });
    });
});
