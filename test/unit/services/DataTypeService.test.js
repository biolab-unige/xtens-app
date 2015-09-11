var expect = require("chai").expect;
var sinon = require("sinon");
var BluebirdPromise = require("bluebird");


describe('DataTypeService', function() {

 
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

