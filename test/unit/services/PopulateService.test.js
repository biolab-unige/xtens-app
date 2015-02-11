var assert = require('chai').assert;
var expect = require('chai').expect;
var sinon = require('sinon');

describe('PopulateService', function() {
    
    describe('#generateData', function() {

        before(function() {
            this.type = fixtures.datatype[2];
            this.fields = DataTypeService.getFlattenedFields(this.type, true);
        });


        it('should create a new data with all the metadata fields',function(){
            
            var data = PopulateService.generateData(this.type);
            expect(data).to.have.property('type');
            expect(data).to.have.property('metadata');
            expect(data.type).to.equals(this.type.id);
            var names = _.pluck(this.fields,"name");
            names.forEach(function(name) {
                expect(data.metadata[name]).to.exist;
                expect(data.metadata[name]).to.have.property('value');
            });
            
        });

    });

    describe('generateFloatField', function() {
        
        it('should create a metadata field with a float value', function(){
            var floatField = fixtures.datatype[2].schema.body[1].content[0];
            
            var min = floatField.min || sails.config.xtens.constants.TEST_MIN;
            var max = floatField.max || sails.config.xtens.constants.TEST_MAX;

            var field = PopulateService.generateFloatField(floatField);
            expect(field.value).to.be.a('number');
            expect(field.value).to.be.at.least(min);
            expect(field.value).to.be.at.most(max);

            if (field.hasUnit) {
                expect(field.unit).to.equals(floatField.possibleUnits[0]);
            }


        });

    });

    describe('generateTextField', function() {
        
        it('should create a metadata field with a text value', function(){
            var textField = fixtures.datatype[2].schema.body[0].content[1];

            var field = PopulateService.generateTextField(textField);
            expect(field.value).to.be.a('string');
            expect(textField.possibleValues).to.include.members([field.value]);
           
        });

    });

    describe('generateIntegerField', function() {
        
        it('should create a metadata field with a integer value', function(){
            var integerField = fixtures.datatype[2].schema.body[1].content[2];
            
            var min = integerField.min || sails.config.xtens.constants.TEST_MIN;
            var max = integerField.max || sails.config.xtens.constants.TEST_MAX;

            var field = PopulateService.generateIntegerField(integerField);
            expect(field.value).to.be.a('number');
            expect(field.value).to.be.at.least(min);
            expect(field.value).to.be.at.most(max);

            if (field.hasUnit) {
                expect(field.unit).to.equals(integerField.possibleUnits[0]);
            }


        });

    });

     describe('generateBooleanField', function() {
        
        it('should create a metadata field with a boolean value', function(){
            var booleanField = fixtures.datatype[2].schema.body[1].content[4];
            
            var field = PopulateService.generateBooleanField(booleanField);
            expect(field.value).to.be.a('boolean');


        });

    });

    describe('generateDateField',function() {
    
        it('should create a metadata field with a date value', function(){
        
            var dateField = fixtures.datatype[1].schema.body[0].content[3];

            var field = PopulateService.generateDateField(dateField);
            expect(field.value).to.be.a('date');
        });

        it ('should create a correct date providing the start date',function(){

            var date = "2014-01-26";
        
            var dateField = fixtures.datatype[1].schema.body[0].content[3];

            var field = PopulateService.generateDateField(dateField,date);
            expect(field.value).to.be.a('date');
            expect(field.value).to.be.above(new Date(date));
        });
    });

    describe('generateVariantData',function() {
    
        it('should create a Variant Data', function(){
        
            var variantFields = fixtures.datatype[3];
             var fields = {};

            fields.fields = DataTypeService.getFlattenedFields(variantFields,false);
            fields.id = variantFields.id;

        
            var variant = PopulateService.generateVariantData(fields);

            expect(variant).to.be.a('object');
            expect(variant.metadata.chromosome.value).to.be.a('string');
            expect(Object.keys(variant.metadata).length).to.equals(13);            
            
        });
    });

    describe('generateVariantAnnotationData',function(){
    
        it('should create a Variant Annotation Data', function(){

            var annotationFields = fixtures.datatype[4];
            var fields = {};

            fields.fields = DataTypeService.getFlattenedFields(annotationFields);
            fields.id = annotationFields.id;

            var annotation = PopulateService.generateVariantAnnotationData(fields);

            expect(annotation).to.be.a('object');
            expect(annotation.metadata.gene_id.value).to.be.a('string');
        
        
        });
    
    
    });

    describe('generateSubjectSampleData',function() {

        beforeEach(function() {
            this.dataCreateStub = sinon.stub(Data, 'create');
            this.sampleCreateStub = sinon.stub(Sample, 'create');
            this.subjectCreateStub = sinon.stub(Subject, 'create', function() {
                console.log('PopulateService.test.generateSubjectSampleData - New Fake Subject created!!');
            });
            this.generateChildrenStub = sinon.stub(PopulateService, 'generateSubjectChildren', function() {
                console.log("PopulateService.test.generateSubjectSampleData - Fake Children generated");
                return true;
            });
        });

        afterEach(function() {
            Data.create.restore();
            Sample.create.restore();
            Subject.create.restore();
            PopulateService.generateSubjectChildren.restore();
        });
    
        it('should call Subject.create method',function(){
            var _this = this;
            var dataType = fixtures.datatype[0];
            return PopulateService.generateSubjectSampleData(dataType).then(function(res) {
                console.log('testing after promise fulfilled');
                expect(_this.subjectCreateStub.calledOnce).to.be.true;
                expect(_this.sampleCreateStub.called).to.be.false;
                expect(_this.dataCreateStub.called).to.be.false;
                expect(_this.generateChildrenStub.calledOnce).to.be.true;
            })
            .catch(function(err) {
                assert.fail();
            });
        
        });
    
    
    });

   




});
