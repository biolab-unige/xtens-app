var expect = require('chai').expect, assert = require('chai').assert,
sinon = require('sinon');
var BluebirdPromise = require('bluebird');

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

    describe("#queryAndPopulateItemsById", function() {
        
        var dataSpy, subjectSpy, sampleSpy;

        beforeEach(function() {
            this.dataTypeClasses = sails.config.xtens.constants.DataTypeClasses;
            dataSpy = sinon.spy(Data, "find");
            sampleSpy = sinon.spy(Sample, "find");
            subjectSpy = sinon.spy(Subject, "find");
        });

        afterEach(function() {
            Data.find.restore();
            Subject.find.restore();
            Sample.find.restore();
        });

        it("#should fire a the proper Model.find call depending on the classTemplate", function() {
            var subjParam = [{id: 0}];
            DataService.queryAndPopulateItemsById(subjParam, this.dataTypeClasses.SUBJECT, callback);
            expect(subjectSpy.called).to.be.true;
        });

        it("#should fire a the proper Model.find call depending on the classTemplate", function() {
            var sampleParam = [{id: 1}];
            DataService.queryAndPopulateItemsById(sampleParam, this.dataTypeClasses.SAMPLE, callback);
            expect(sampleSpy.called).to.be.true;
        });
        
        it("#should fire a the proper Model.find call depending on the classTemplate", function() {
            var dataParam = [{id: 3}];
            DataService.queryAndPopulateItemsById(dataParam, this.dataTypeClasses.GENERIC, callback);
            expect(dataSpy.called).to.be.true;
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
        
        it("#should call the transactionHandler to execute the storage of metadata value", function() {
            
            var stub = sinon.stub(sails.config.xtens.transactionHandler, 'putMetadataValuesIntoEAV', function() {
                return BluebirdPromise.try(function() { return [1]; } );
            });
            
            return DataService.storeMetadataIntoEAV(1)
            
            .then(function() {
                console.log('DataService.test.storeMetadataIntoEAV - testing after promise fulfilled');
                expect(stub.calledOnce).to.be.true;
                sails.config.xtens.transactionHandler.putMetadataValuesIntoEAV.restore();
            })
            .catch(function(error) {
               assert.fail("DataService.test.storeMetadataIntoEAV - error caught"); 
            });

        });

    });

});
