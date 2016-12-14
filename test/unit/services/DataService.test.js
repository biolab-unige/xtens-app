/* jshint node:true */
/* jshint mocha: true */
/* globals _, sails, fixtures, Data, DataService, TokenService */
"use strict";
var chai = require("chai");
var chaiAsPromised = require("chai-as-promised");
var chaiStream = require('chai-stream');
chai.use(chaiAsPromised);
chai.use(chaiStream);
var expect = chai.expect, assert = chai.assert, sinon = require('sinon');
var Joi = require("joi");
var BluebirdPromise = require('bluebird');
const fs = require('fs');
const writeFileSync = require("fs").writeFileSync;
const request = require('supertest');
const loginHelper = require('../controllers/loginHelper');



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

    let tokenSA, tokenNS;
    before(function(done) {

        loginHelper.loginSuperAdmin(request, function (bearerToken) {
            tokenSA = bearerToken;
            sails.log(`Got token: ${tokenSA}`);
            loginHelper.loginAnotherStandardUserNoDataSens(request, function (bearerToken) {
                tokenNS = bearerToken;
                sails.log(`Got token: ${tokenSA}`);
                done();
            });

        });
    });

    describe("#validate", function() {

        it("should correctly validate a valid data using its schema", function() {
            var data = _.cloneDeep(fixtures.data[0]);
            var dataType = _.cloneDeep(_.findWhere(fixtures.datatype, {id: data.type}));
            var res = DataService.validate(data, true, dataType); // skip metadata validation
            data.metadata.name.value = data.metadata.name.value.toUpperCase(); // set case insensitive value to uppercase;
            expect(res.error).to.be.null;
            expect(res.value).to.eql(data);
        });

        it("should raise an Error if the data is not valid", function() {
            var invalidData = _.cloneDeep(fixtures.data[0]);
            var dataType = _.cloneDeep(_.findWhere(fixtures.datatype, {id: invalidData.type}));
            invalidData.metadata.radius = {value: "Unknown", unit: "M☉"};
            var res = DataService.validate(invalidData, true, dataType);
            expect(res.error).to.be.not.null;
            sails.log(res.error);
        });

    });

    describe("#buildMetadataFieldValidationSchema", function() {

        it("should create the correct schema for an textual metadata field", function() {
            var textField = _.cloneDeep(fixtures.datatype[2].schema.body[0].content[0]);  // name of star
            var schema = DataService.buildMetadataFieldValidationSchema(textField);
            var expectedSchema = Joi.object().required().keys({
                value: Joi.string().uppercase().required(),
                // unit: Joi.string().required().valid(textField.unit),
                group: Joi.string()
            });
            writeFileSync('actual-schema.json', schema);
            writeFileSync('expected-schema.json', expectedSchema);
            expect(JSON.stringify(schema)).to.eql(JSON.stringify(expectedSchema));
        });

        it("should create the correct schema for an integer metadata field", function() {
            var integerField = _.cloneDeep(fixtures.datatype[2].schema.body[1].content[3]); // temperature of star
            var schema = DataService.buildMetadataFieldValidationSchema(integerField);
            var expectedSchema = Joi.object().keys({
                value: Joi.number().integer().allow(null),
                group: Joi.string(),
                unit: Joi.string().required().valid(integerField.possibleUnits)
            });
            expect(JSON.stringify(schema)).to.eql(JSON.stringify(expectedSchema));
        });

        it("should create the correct schema for a float metadata field", function() {
            var floatField = _.cloneDeep(fixtures.datatype[2].schema.body[1].content[0]); // mass of star
            var schema = DataService.buildMetadataFieldValidationSchema(floatField);
            var expectedSchema = Joi.object().required().keys({
                value: Joi.number().required(),
                group: Joi.string(),
                unit: Joi.string().required().valid(floatField.possibleUnits)
            });
            expect(JSON.stringify(schema)).to.eql(JSON.stringify(expectedSchema));
        });

        it("should create the correct schema for an textual metadata field from controlled vocabulary", function() {
            var controlledVocField = _.cloneDeep(fixtures.datatype[2].schema.body[0].content[1]); // constellation of star
            var schema = DataService.buildMetadataFieldValidationSchema(controlledVocField);
            var expectedSchema = Joi.object().required().keys({
                value: Joi.string().required().valid(controlledVocField.possibleValues),
                group: Joi.string()
            });
            expect(JSON.stringify(schema)).to.eql(JSON.stringify(expectedSchema));
        });

        it("should create the correct schema for an textual metadata field in loop (case sensitive)", function() {
            var loopTextField = _.extend(_.cloneDeep(fixtures.datatype[2].schema.body[0].content[3].content[0]), {_loop: true});
            var schema = DataService.buildMetadataFieldValidationSchema(loopTextField);
            var expectedSchema = Joi.object().required().keys({
                values: Joi.array().required().items(Joi.string().required()),
                group: Joi.string(),
                loop: Joi.string()
            });
            expect(JSON.stringify(schema)).to.eql(JSON.stringify(expectedSchema));
        });

        it("should create the correct schema for an textual metadata field in loop (case insensitive/uppercase)", function() {
            var loopTextField = _.extend(_.cloneDeep(fixtures.datatype[2].schema.body[0].content[3].content[0]), {_loop: true, caseInsensitive: true});
            var schema = DataService.buildMetadataFieldValidationSchema(loopTextField);
            var expectedSchema = Joi.object().required().keys({
                values: Joi.array().required().items(Joi.string().uppercase().required()),
                group: Joi.string(),
                loop: Joi.string()
            });
            expect(JSON.stringify(schema)).to.eql(JSON.stringify(expectedSchema));
        });

    });

    describe('#getOneAsync', function() {

        var spy;

        beforeEach(function() {
            spy = sinon.spy(Data, "findOne");
        });

        afterEach(function() {
            Data.findOne.restore();
        });

        it("should not fire the Data.findOne method with ", function() {
            DataService.getOne(null, callback);
            DataService.getOne(0, callback);
            expect(spy.called).to.be.false;
        });

        it("should fire the Data.findOne operation", function() {
            DataService.getOneAsync(1, callback);
            expect(spy.withArgs(1).calledOnce).to.be.true;
        });

    });

    describe("#advancedQuery", function() {

        var composeStub, queryStub;
        var queryStatement = 'SELECT * FROM data WHERE type = $1';

        /**
         * @description BEFORE HOOK: stub all the methods wrapped inside DataService.advancedQuery()
         */
        beforeEach(function() {
            composeStub = sinon.stub(sails.config.xtens.queryBuilder, 'compose', function(args) {
                return {
                    statement: queryStatement,
                    parameters: args.type
                };
            });

            queryStub = sinon.stub(Data, "query", function(query, next) {
                if (query.statement === queryStatement && _.isArray(query.parameters)) {
                    next(null, foundRecords);
                }
                else {
                    next(new Error("wrong or malformed query argumenent"));
                }
            });
        });

        afterEach(function() {
            sails.config.xtens.queryBuilder.compose.restore();
            Data.query.restore();
        });

        /*
           it("should return the query result", function() {
           var queryArgs = {type: 1};
           expect(composeStub.called).to.be.false;
           DataService.advancedQuery(queryArgs, callback);
           expect(composeStub.called).to.be.true;
           expect(queryStub.called).to.be.true;
           }); */

    });

    describe("#storeMetadataIntoEAV", function() {

        it("#should call the CRUD manager to execute the storage of metadata value", function() {

            sails.log.debug(sails.config.xtens.crudManager);

            var stub = sinon.stub(sails.config.xtens.crudManager, 'putMetadataValuesIntoEAV', function() {
                return BluebirdPromise.try(function() { return [1]; } );
            });

            return DataService.storeMetadataIntoEAV([1])

            .then(function() {
                console.log('DataService.test.storeMetadataIntoEAV - testing after promise fulfilled');
                expect(stub.calledOnce).to.be.true;
                sails.config.xtens.crudManager.putMetadataValuesIntoEAV.restore();
            })
            .catch(function(err) {
                sails.log.error(err);
                assert.fail("DataService.test.storeMetadataIntoEAV - error caught");
            });

        });

    });

    describe('#hasDataSensitive', function() {

        it("should return an object with true result of investigation", function(done) {

            var data = _.cloneDeep(fixtures.data[0]);

            // console.log("Data: " + JSON.stringify(data));

            var result = DataService.hasDataSensitive(data.id, "Data");

            expect(result).to.eventually.have.deep.property('hasDataSensitive', true);
            done();
            return;
        });

        it("should return an object with false result of investigation", function(done) {

            var data = _.cloneDeep(fixtures.subject[1]);

            // console.log("Data: " + JSON.stringify(data));

            var result = DataService.hasDataSensitive(data.id, "Subject");

            expect(result).to.eventually.have.deep.property('hasDataSensitive', false);
            done();
            return;
        });
    });

    describe('#filterOutSensitiveInfo', function() {


        it("should return the object array without sensitive fields defined on schema objects", function(done) {
            var data = [];
            data = _.cloneDeep(fixtures.data);
            data[2] ={
                "type": 5,
                "metadata": {
                    "name":{"value":"Prova","group":"Generic Info"},
                    "gene_id":{"value":"34553","group":"Generic Info"},
                    "deleteriousness":{"value":1,"group":"Generic Info"},
                    "quality_prediction":{"value":"Benign","group":"Generic Info"}
                },
                "id": 2
            };


            // console.log("Data Star METADATA: " + JSON.stringify(data));

            var result = DataService.filterOutSensitiveInfo(data, false);

            delete data[0].metadata['name'];
            delete data[1].metadata['gene_id'];
            delete data[1].metadata['quality_prediction'];
            var expectedData = data;

            // console.log("EXPECTED Metadata Star: " + JSON.stringify(expectedData));

            expect(result).to.eventually.equal(expectedData);
            done();
            return;

        });

        it("should return the same objects array in input", function(done) {
            var data = [];
            data = _.cloneDeep(fixtures.data);
            data[2] ={
                "type": 5,
                "metadata": {
                    "name":{"value":"Prova","group":"Generic Info"},
                    "gene_id":{"value":"34553","group":"Generic Info"},
                    "deleteriousness":{"value":1,"group":"Generic Info"},
                    "quality_prediction":{"value":"Benign","group":"Generic Info"}
                },
                "id": 2
            };

            // console.log("Data Star METADATA: " + JSON.stringify(data));


            var result = DataService.filterOutSensitiveInfo(data, true);

            expect(result).to.eventually.equal(data);
            done();
            return;

        });
    });

    describe('#preprocessQueryParams', function() {

        var composeStub, operatorPayload;
        var queryStatement = "SELECT DISTINCT d.id, d.metadata FROM data d WHERE d.type = $1";


          /**
           * @description BEFORE HOOK: stub all the methods wrapped inside DataService.executeAdvancedQuery()
           */
        beforeEach(function() {
            var bearer = "Bearer "+ tokenSA;
            var req = {headers:{authorization : bearer}};
            operatorPayload = TokenService.getToken(req);

            composeStub = sinon.stub(sails.config.xtens.queryBuilder, 'compose', function(args) {
                return ({
                    statement: queryStatement,
                    parameters: [args.dataType]
                });
            });
            // afterEach(function() {
            //     sails.config.xtens.queryBuilder.compose.restore();
            // });

        });

        it("should return an object with the right queryObject, dataPrivilege, dataType and forbiddenFields array", function(done) {
            var dataType = _.cloneDeep(fixtures.datatype[2]);
            var dataPrivilege = _.cloneDeep(fixtures.datatypeprivileges[2]);
            var param = [dataType.id];
            var queryObj = { statement: queryStatement, parameters: param};
            var queryArgs = {
                "wantsSubject":false,
                "dataType":3,
                "model":"Data",
                "content":[]
            };
            var expectedResults = {
                queryObj:queryObj,
                dataType: dataType,
                dataTypePrivilege: dataPrivilege,
                forbiddenFields: [{
                    "label":"METADATA FIELD",
                    "fieldType":"Text",
                    "name":"Name",
                    "formattedName":"name",
                    "ontologyUri":null,
                    "customValue":null,
                    "visible":true,
                    "caseInsensitive":true,
                    "required":true,
                    "sensitive":true,
                    "hasRange":false,
                    "isList":false,
                    "possibleValues":null,
                    "hasUnit":false,
                    "possibleUnits":null
                }]
            };
            DataService.preprocessQueryParamsAsync(queryArgs, operatorPayload.id, dataType.id).then(function (results) {

                expect(results.queryObj).to.eql(expectedResults.queryObj);
                expect(results.dataTypePrivilege.id).to.equal(expectedResults.dataTypePrivilege.id);
                expect(results.dataType.id).to.eql(expectedResults.dataType.id);
                expect(results.forbiddenFields).to.eql(expectedResults.forbiddenFields);
                done();
                return;
            }).catch(function (err) {
                console.log(err);
                done(err);
            });
        });
    });

    describe('#executeAdvancedQuery', function() {

        var queryStub, operatorPayload;
        var queryStatement = "WITH s AS (SELECT id, code, sex, personal_info FROM subject), pd AS (SELECT id, given_name, surname, birth_date FROM personal_details) SELECT DISTINCT d.id, s.code, s.sex, pd.given_name, pd.surname, pd.birth_date, d.metadata FROM data d LEFT JOIN s ON s.id = d.parent_subject LEFT JOIN pd ON pd.id = s.personal_info WHERE d.type = $1;";
        var recordFound =[{
            "id":1,
            "type":3,
            "date": "2012-12-28",
            "metadata": {
                "name":{"value":"Aldebaran","group":"Generic Info"},
                "constellation":{"value":"taurus","group":"Generic Info"},
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

          /**
           * @description BEFORE HOOK: stub all the methods wrapped inside DataService.executeAdvancedQuery()
           */
        beforeEach(function(done) {


            queryStub = sinon.stub(sails.config.xtens.crudManager, "query", function(query,next) {
                if (query.statement === queryStatement && _.isArray(query.parameters)) {
                    next(null, {rows:recordFound});
                }
                else {
                    next(new Error("wrong or malformed query argumenent"));
                }
            });
            done();
        });

        afterEach(function(done) {
            sails.config.xtens.crudManager.query.restore();
            done();
        });


        it("should return an object with right attributes", function(done) {
            var bearer = "Bearer "+ tokenSA;
            var req = {headers:{authorization : bearer}};
            operatorPayload = TokenService.getToken(req);
            var expectedData = _.cloneDeep(fixtures.data[0]);
            var dataType = _.cloneDeep(fixtures.datatype[2]);
            var dataPrivilege = _.cloneDeep(fixtures.datatypeprivileges[2]);
            var param = [dataType.id];
            var queryObj = { statement: queryStatement, parameters: param};
            var processedArgs = {queryObj: queryObj, dataType: dataType, dataTypePrivilege : dataPrivilege, forbiddenFields: []};

            DataService.executeAdvancedQuery(processedArgs, operatorPayload, (err, results) =>{
                if (err) {
                    console.log(err);
                    done(err);
                    return;
                }

                expect(results.dataType).to.eql(dataType);
                expect(results.dataTypePrivilege).to.eql(dataPrivilege);
                expect(results.data[0]).to.eql(expectedData);
                done();
                return;
            });
        });

        it("should return an object with right attributes and data without sensitive informations", function(done) {
            var expectedData = [{
                "id":1,
                "type":3,
                "date": "2012-12-28",
                "metadata": {
                    "constellation":{"value":"taurus","group":"Generic Info"},
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
            var bearer = "Bearer "+ tokenNS;
            var req = {headers:{authorization : bearer}};
            operatorPayload = TokenService.getToken(req);
            var dataType = _.cloneDeep(fixtures.datatype[2]);
            var dataPrivilege = _.cloneDeep(fixtures.datatypeprivileges[2]);
            var param = [dataType.id];
            var queryObj = { statement: queryStatement, parameters: param};
            var processedArgs = {queryObj: queryObj, dataType: dataType, dataTypePrivilege : dataPrivilege, forbiddenFields: [{"label":"METADATA FIELD","fieldType":"Text","name":"Name","formattedName":"name","ontologyUri":null,"customValue":null,"visible":true,"caseInsensitive":true,"required":true,"sensitive":true,"hasRange":false,"isList":false,"possibleValues":null,"hasUnit":false,"possibleUnits":null}]};

            DataService.executeAdvancedQuery(processedArgs, operatorPayload, (err, results) =>{
                if (err) {
                    console.log(err);
                    done(err);
                    return;
                }

                expect(results.dataType).to.eql(dataType);
                expect(results.dataTypePrivilege).to.eql(dataPrivilege);
                expect(results.data).to.eql(expectedData);
                done();
                return;
            });
        });

        it("should return an error and results should be null", function(done) {
            var expectedData = _.cloneDeep(fixtures.data[0]);
            var dataType = _.cloneDeep(fixtures.datatype[2]);
            var dataPrivilege = _.cloneDeep(fixtures.datatypeprivileges[2]);
            var invalidQueryStatement = "WITH s AS (SELECT id, code, sex, personal_info FROM subject), pd AS (SELECT id, given_name, surname, birth_date FROM personal_details) SELECT DISTINCT d.id, s.code, s.sex, pd.given_name, pd.surname, pd.birth_date, d.metadata FROM data d LEFT JOIN s ON s.id = d.parent_subject LEFT JOIN pd ON pd.id = s.personal_info WHERE d.type = ;";
            var param = [dataType.id];
            var queryObj = { statement: invalidQueryStatement, parameters: param};
            var processedArgs = {queryObj: queryObj, dataType: dataType, dataTypePrivilege : dataPrivilege, forbiddenFields: []};

            DataService.executeAdvancedQuery(processedArgs, operatorPayload, (err, results) =>{


                expect(err).to.be.an('error');
                expect(results).to.equal(null);

                done();
                return;
            });
        });

    });

    describe('#executeAdvancedStreamQuery', function() {

        var queryStreamStub, operatorPayload, queryObj;

        beforeEach(function() {
            var dataType = _.cloneDeep(fixtures.datatype[2]);
            var dataPrivilege = _.cloneDeep(fixtures.datatypeprivileges[2]);
            queryObj = { statement: "WITH s AS (SELECT id, code, sex, personal_info FROM subject) SELECT DISTINCT d.id, s.code, s.sex, d.metadata FROM data d LEFT JOIN s ON s.id = d.parent_subject WHERE d.type = $1;", parameters: [dataType.id]};

            queryStreamStub = sinon.stub(sails.config.xtens.crudManager, "queryStream", function(query, next) {
                console.log("STUUUB");
                let stream = fs.createReadStream('./test/resources/data.json');
                return next(stream,null);

            });
        });
        // afterEach(function(done) {
        //     sails.config.xtens.crudManager.queryStream.restore();
        //     done();
        // });

        it("should return a Readable Stream and should end", function(done) {
            var expectedData = _.cloneDeep(fixtures.data[0]);
            var dataType = _.cloneDeep(fixtures.datatype[2]);
            var dataPrivilege = _.cloneDeep(fixtures.datatypeprivileges[2]);
            var param = [dataType.id];
            var processedArgs = {queryObj: queryObj, dataType: dataType, dataTypePrivilege : dataPrivilege, forbiddenFields: []};

            DataService.executeAdvancedStreamQuery(processedArgs, operatorPayload, (err, stream) =>{
                console.log(err,stream);
                if (err) {
                    console.log(err);
                    done(err);
                    return;
                }
                assert.isStream(stream);
                expect(stream).to.be.a.ReadableStream;
                expect(stream).to.end;
                done();
                return;
            });
        });

    });

    /**
     * TODO write some test:
     *      - filter out metadata content if privileges are only for VIEW_OVERVIEW
     */
    describe('#filterListByPrivileges', function() {

        let stub;

        beforeEach(() => {
            stub = sinon.stub(DataService, 'filterOutSensitiveInfo', arr => arr);
        });

        afterEach(() => {
            stub.restore();
        });

        it('should return an empty array if no privileges were found', () => {
            const dataToFilter = _.cloneDeep(fixtures.data),
                dataTypesId = [3, 4, 5], privileges = [], canAccessSensitiveData = false;
            const filteredData = DataService.filterListByPrivileges(dataToFilter, dataTypesId, privileges, canAccessSensitiveData);
            expect(filteredData).to.be.empty;
        });

        it('should return all the data unfiltered', () => {
            const dataTypesId = [3, 4];
            const dataToFilter = _.filter(fixtures.data, el => {
                return dataTypesId.indexOf(el.type) > -1;
            });
            const privileges = _.filter(fixtures.datatypeprivileges, {'group': 1}),
                canAccessSensitiveData = true;
            const filteredData = DataService.filterListByPrivileges(dataToFilter, dataTypesId, privileges, canAccessSensitiveData);
            expect(filteredData).to.eql(dataToFilter);
        });

        it('should filter out all the data for which the user does not posses a privilege level', () => {
            const dataToFilter = _.cloneDeep(fixtures.data),
                dataTypesId = [3, 4, 5], privileges = fixtures.datatypeprivileges.filter(el => {
                    return el.group === 1 && dataTypesId.indexOf(el.dataType) > -1;
                });
            const canAccessSensitiveData = false;
            const actualFilteredData = DataService.filterListByPrivileges(dataToFilter, dataTypesId, privileges, canAccessSensitiveData);
            const allowedDataTypesId = privileges.map(el => el.dataType);
            const expectedFilteredData = _.filter(fixtures.data, el => {
                return allowedDataTypesId.indexOf(el.type) > -1;
            });
            expect(actualFilteredData).to.eql(expectedFilteredData);
        });

    });

    describe('#prepareAndSendResponse', () => {

        const res = {
            set: function() {},
            json: function(thing) {
                return thing;
            }
        };
        let setSpy, jsonSpy;

        beforeEach(() => {
            setSpy = sinon.spy(res, 'set');
            jsonSpy = sinon.spy(res, 'json');
        });

        afterEach(() => {
            setSpy.restore();
            jsonSpy.restore();
        });

        it('should write the correct headers and send the response as json', () => {
            const dataToSend = fixtures.data.filter(datum => datum.type === 3);
            const headerInfo = {
                count: 1200,
                pageSize: 100,
                numPages: 12,
                currPage: 1,
                links: [
                    { value: 'http://link.next', rel: 'next' },
                    { value: 'http://link.prev', rel: 'previous'},
                    { value: 'http://link.first', rel: 'first' },
                    { value: 'http://link.last', rel: 'last'}
                ]
            };
            const sentRes = DataService.prepareAndSendResponse(res, dataToSend, headerInfo);
            expect(setSpy).to.be.calledTwice;
            expect(jsonSpy).to.be.calledOnce;
            expect(setSpy.firstCall.args[0]).to.equal('Access-Control-Expose-Headers');
            expect(setSpy.firstCall.args[1]).to.eql([
                'X-Total-Count', 'X-Page-Size', 'X-Total-Pages', 'X-Current-Page', 'Link'
            ]);
            expect(setSpy.secondCall.args[0]).to.eql({
                'X-Total-Count': headerInfo.count,
                'X-Page-Size': headerInfo.pageSize,
                'X-Total-Pages': headerInfo.numPages,
                'X-Current-Page': headerInfo.currPage,
                'Link': '<http://link.next>; rel=next, <http://link.prev>; rel=previous, <http://link.first>; rel=first, <http://link.last>; rel=last'
            });
            expect(jsonSpy.calledWithExactly(dataToSend));
            expect(sentRes).to.eql(dataToSend);
        });

    });

});
