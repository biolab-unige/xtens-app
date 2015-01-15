var expect = require('chai').expect;

describe('PopulateService', function() {
    
    describe('#generateData', function() {

        before(function() {
            this.type = fixtures.datatype[2];
            this.fields = DataTypeService.getFlattenedFields(this.type, true);
        });


        it('should create a new data with all the metadata fields',function(){
            /*
            var data = PopulateService.generateData(this.type);
            expect(data).to.have.property('type');
            expect(data).to.have.property('metadata');
            expect(data.type).to.equals(this.type.id);
            var names = _.pluck(this.fields,"name");
            names.forEach(function(name) {
                expect(data.metadata[name]).to.exist;
                expect(data.metadata[name]).to.have.property('value');
            });
            */
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
            var textField = fixtures.datatype[2].schema.body[0].content[0];

            var field = PopulateService.generateTextField(textField);
            expect(field.value).to.be.a('string');
           
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



});
