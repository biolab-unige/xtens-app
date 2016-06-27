/* jshint node:true */
/* jshint mocha: true */
/* globals _, sails, fixtures, Data, Sample, Subject, DataService */
"use strict";
var chai = require("chai");
var chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
var expect = chai.expect, assert = chai.assert, sinon = require('sinon');
var Joi = require("joi");
var BluebirdPromise = require('bluebird');
const writeFileSync = require("fs").writeFileSync;



var foundRecords = [
    {"type": "sometype", "metadata": {"somemetadata": {"value": "val"}}},
    {"type": "sometype", "metadata": {"someothermetadata": {"value": "val"}}}
];


var callback = sinon.stub();
callback.withArgs(null,null).returns(0);
callback.withArgs(new Error()).returns("got an error");
callback.withArgs(null, foundRecords).returns(foundRecords);
callback.returns(1);

describe('DataService', function() {

    // describe("#validate", function() {
    //
    //     it("should correctly validate a valid data using its schema", function() {
    //         var data = _.cloneDeep(fixtures.data[0]);
    //         var dataType = _.cloneDeep(_.findWhere(fixtures.datatype, {id: data.type}));
    //         var res = DataService.validate(data, true, dataType); // skip metadata validation
    //         data.metadata.name.value = data.metadata.name.value.toUpperCase(); // set case insensitive value to uppercase;
    //         expect(res.error).to.be.null;
    //         expect(res.value).to.eql(data);
    //     });
    //
    //     it("should raise an Error if the data is not valid", function() {
    //         var invalidData = _.cloneDeep(fixtures.data[0]);
    //         var dataType = _.cloneDeep(_.findWhere(fixtures.datatype, {id: invalidData.type}));
    //         invalidData.metadata.radius = {value: "Unknown", unit: "M☉"};
    //         var res = DataService.validate(invalidData, true, dataType);
    //         expect(res.error).to.be.not.null;
    //         console.log(res.error);
    //     });
    //
    // });
    //
    // describe("#buildMetadataFieldValidationSchema", function() {
    //
    //     it("should create the correct schema for an textual metadata field", function() {
    //         var textField = _.cloneDeep(fixtures.datatype[2].schema.body[0].content[0]);  // name of star
    //         var schema = DataService.buildMetadataFieldValidationSchema(textField);
    //         var expectedSchema = Joi.object().required().keys({
    //             value: Joi.string().uppercase().required(),
    //             // unit: Joi.string().required().valid(textField.unit),
    //             group: Joi.string()
    //         });
    //         writeFileSync('actual-schema.json', schema);
    //         writeFileSync('expected-schema.json', expectedSchema);
    //         expect(JSON.stringify(schema)).to.eql(JSON.stringify(expectedSchema));
    //     });
    //
    //     it("should create the correct schema for an integer metadata field", function() {
    //         var integerField = _.cloneDeep(fixtures.datatype[2].schema.body[1].content[3]); // temperature of star
    //         var schema = DataService.buildMetadataFieldValidationSchema(integerField);
    //         var expectedSchema = Joi.object().keys({
    //             value: Joi.number().integer().allow(null),
    //             group: Joi.string(),
    //             unit: Joi.string().required().valid(integerField.possibleUnits)
    //         });
    //         expect(JSON.stringify(schema)).to.eql(JSON.stringify(expectedSchema));
    //     });
    //
    //     it("should create the correct schema for a float metadata field", function() {
    //         var floatField = _.cloneDeep(fixtures.datatype[2].schema.body[1].content[0]); // mass of star
    //         var schema = DataService.buildMetadataFieldValidationSchema(floatField);
    //         var expectedSchema = Joi.object().required().keys({
    //             value: Joi.number().required(),
    //             group: Joi.string(),
    //             unit: Joi.string().required().valid(floatField.possibleUnits)
    //         });
    //         expect(JSON.stringify(schema)).to.eql(JSON.stringify(expectedSchema));
    //     });
    //
    //     it("should create the correct schema for an textual metadata field from controlled vocabulary", function() {
    //         var controlledVocField = _.cloneDeep(fixtures.datatype[2].schema.body[0].content[1]); // constellation of star
    //         var schema = DataService.buildMetadataFieldValidationSchema(controlledVocField);
    //         var expectedSchema = Joi.object().required().keys({
    //             value: Joi.string().required().valid(controlledVocField.possibleValues),
    //             group: Joi.string()
    //         });
    //         expect(JSON.stringify(schema)).to.eql(JSON.stringify(expectedSchema));
    //     });
    //
    //     it("should create the correct schema for an textual metadata field in loop (case sensitive)", function() {
    //         var loopTextField = _.extend(_.cloneDeep(fixtures.datatype[2].schema.body[0].content[3].content[0]), {_loop: true});
    //         var schema = DataService.buildMetadataFieldValidationSchema(loopTextField);
    //         var expectedSchema = Joi.object().required().keys({
    //             values: Joi.array().required().items(Joi.string().required()),
    //             group: Joi.string(),
    //             loop: Joi.string()
    //         });
    //         expect(JSON.stringify(schema)).to.eql(JSON.stringify(expectedSchema));
    //     });
    //
    //     it("should create the correct schema for an textual metadata field in loop (case insensitive/uppercase)", function() {
    //         var loopTextField = _.extend(_.cloneDeep(fixtures.datatype[2].schema.body[0].content[3].content[0]), {_loop: true, caseInsensitive: true});
    //         var schema = DataService.buildMetadataFieldValidationSchema(loopTextField);
    //         var expectedSchema = Joi.object().required().keys({
    //             values: Joi.array().required().items(Joi.string().uppercase().required()),
    //             group: Joi.string(),
    //             loop: Joi.string()
    //         });
    //         expect(JSON.stringify(schema)).to.eql(JSON.stringify(expectedSchema));
    //     });
    //
    // });
    //
    // describe('#getOneAsync', function() {
    //
    //     var spy;
    //
    //     beforeEach(function() {
    //         spy = sinon.spy(Data, "findOne");
    //     });
    //
    //     afterEach(function() {
    //         Data.findOne.restore();
    //     });
    //
    //     it("should not fire the Data.findOne method with ", function() {
    //         DataService.getOne(null, callback);
    //         DataService.getOne(0, callback);
    //         expect(spy.called).to.be.false;
    //     });
    //
    //     it("should fire the Data.findOne operation", function() {
    //         DataService.getOneAsync(1, callback);
    //         expect(spy.withArgs(1).calledOnce).to.be.true;
    //     });
    //
    // });
    //
    // describe("#queryAndPopulateItemsById", function() {
    //
    //     var dataSpy, subjectSpy, sampleSpy;
    //
    //     beforeEach(function() {
    //         this.dataTypeClasses = sails.config.xtens.constants.DataTypeClasses;
    //         dataSpy = sinon.spy(Data, "find");
    //         sampleSpy = sinon.spy(Sample, "find");
    //         subjectSpy = sinon.spy(Subject, "find");
    //     });
    //
    //     afterEach(function() {
    //         Data.find.restore();
    //         Subject.find.restore();
    //         Sample.find.restore();
    //     });
    //
    //     it("#should fire a the proper Model.find call depending on the classTemplate", function() {
    //         var subjParam = [{id: 0}];
    //         DataService.queryAndPopulateItemsById(subjParam, this.dataTypeClasses.SUBJECT, callback);
    //         expect(subjectSpy.called).to.be.true;
    //     });
    //
    //     it("#should fire a the proper Model.find call depending on the classTemplate", function() {
    //         var sampleParam = [{id: 1}];
    //         DataService.queryAndPopulateItemsById(sampleParam, this.dataTypeClasses.SAMPLE, callback);
    //         expect(sampleSpy.called).to.be.true;
    //     });
    //
    //     it("#should fire a the proper Model.find call depending on the classTemplate", function() {
    //         var dataParam = [{id: 3}];
    //         DataService.queryAndPopulateItemsById(dataParam, this.dataTypeClasses.GENERIC, callback);
    //         expect(dataSpy.called).to.be.true;
    //     });
    //
    //
    // });
    //
    // describe("#advancedQuery", function() {
    //
    //     var composeStub, queryStub;
    //     var queryStatement = 'SELECT * FROM data WHERE type = $1';
    //
    //     /**
    //      * @description BEFORE HOOK: stub all the methods wrapped inside DataService.advancedQuery()
    //      */
    //     beforeEach(function() {
    //         composeStub = sinon.stub(sails.config.xtens.queryBuilder, 'compose', function(args) {
    //             return {
    //                 statement: queryStatement,
    //                 parameters: args.type
    //             };
    //         });
    //
    //         queryStub = sinon.stub(Data, "query", function(query, next) {
    //             if (query.statement === queryStatement && _.isArray(query.parameters)) {
    //                 next(null, foundRecords);
    //             }
    //             else {
    //                 next(new Error("wrong or malformed query argumenent"));
    //             }
    //         });
    //     });
    //
    //     afterEach(function() {
    //         sails.config.xtens.queryBuilder.compose.restore();
    //         Data.query.restore();
    //     });
    //
    //     /*
    //        it("should return the query result", function() {
    //        var queryArgs = {type: 1};
    //        expect(composeStub.called).to.be.false;
    //        DataService.advancedQuery(queryArgs, callback);
    //        expect(composeStub.called).to.be.true;
    //        expect(queryStub.called).to.be.true;
    //        }); */
    //
    // });
    //
    // describe("#storeMetadataIntoEAV", function() {
    //
    //     it("#should call the CRUD manager to execute the storage of metadata value", function() {
    //
    //         sails.log.debug(sails.config.xtens.crudManager);
    //
    //         var stub = sinon.stub(sails.config.xtens.crudManager, 'putMetadataValuesIntoEAV', function() {
    //             return BluebirdPromise.try(function() { return [1]; } );
    //         });
    //
    //         return DataService.storeMetadataIntoEAV([1])
    //
    //         .then(function() {
    //             console.log('DataService.test.storeMetadataIntoEAV - testing after promise fulfilled');
    //             expect(stub.calledOnce).to.be.true;
    //             sails.config.xtens.crudManager.putMetadataValuesIntoEAV.restore();
    //         })
    //         .catch(function(err) {
    //             sails.log.error(err);
    //             assert.fail("DataService.test.storeMetadataIntoEAV - error caught");
    //         });
    //
    //     });
    //
    // });


    describe('#hasDataSensitive', function() {

        it("should return an object with true result of investigation", function() {

            var data = _.cloneDeep(fixtures.data[0]);

            console.log("Data Star: " + JSON.stringify(data));

            DataService.hasDataSensitive(data.id).then(function(result){

                console.log("Result: " + result);

                expect(result.hasDataSensitive).to.be.true;
            });
        });

        it("should return an object with false result of investigation", function() {

            var data = _.cloneDeep(fixtures.data[0]);

            console.log(fixtures.datatype[2].schema.body[0].content[0].sensitive);
            fixtures.datatype[2].schema.body[0].content[0].sensitive = false;

            console.log("Data Star: " + JSON.stringify(data));

            DataService.hasDataSensitive(data.id).then(function(result){

                console.log("Result: " + result);

                expect(result.hasDataSensitive).to.be.false;
            });
        });
    });

});
