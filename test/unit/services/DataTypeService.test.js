var expect = require("chai").expect;
var sinon = require("sinon");
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
            this.transactionHandler = sails.config.xtens.transactionHandler;
            this.transactionalPutMetadataFieldsIntoEAV = sinon.stub(this.transactionHandler, 'putMetadataFieldsIntoEAV', function() {
                return BluebirdPromise.try(function() { return [1]; });
            });
        });

        afterEach(function() {
            this.transactionHandler.putMetadataFieldsIntoEAV.restore();
        });

        it('should populate the table eav_attribute', function() {

            var _this = this;
            
            return DataTypeService.putMetadataFieldsIntoEAV(this.dataType).then(function(res) {
                console.log('testing after promise fulfilled');
                expect(_this.transactionalPutMetadataFieldsIntoEAV.calledOnce).to.be.true;
            });
                        
        });
    });

});

