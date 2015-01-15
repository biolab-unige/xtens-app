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

});
