var expect = require("chai").expect;

describe('DataTypeService', function() {

 
    describe('#getFlattenedFields', function() {

        it('returns a 1-d array with all the metadata fields', function() {
            DataType.findOne(3).exec(function(err, dataType) {
                var flattened = DataTypeService.getFlattenedFields(dataType) || [];
                expect(flattened).to.have.length(9);
                flattened.forEach(function(field){
                    expect(field.label).to.equal("METADATA FIELD");
                });
                expect(flattened[0].name).to.equal('name');
                expect(flattened[1].name).to.equal('constellation');
                expect(flattened[2].name).to.equal('classification');
                expect(flattened[3].name).to.equal('designation');
                expect(flattened[4].name).to.equal('mass');
                expect(flattened[5].name).to.equal('radius');
                expect(flattened[6].name).to.equal('luminosity');
                expect(flattened[7].name).to.equal('temperature');
            });
        });

    });

});

