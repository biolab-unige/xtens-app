// var SampleService = require('../../../api/services/SampleService.js'),
var expect = require('chai').expect;


describe('SampleService', function() {

    var populatedSample = {
        id: 100,
        biobankCode: "080100",
        // DataType
        type: {
                id: 12,
                name: "Tissue",
                schema: {"header": {}, "body": []},
                classTemplate: "SAMPLE"
        },
        metadata: {},
        // Subject
        donor: {
            id: 1,
            code: "SUBJ1",
            type: {
                id: 12,
                name: "Patient",
                schema: {"header": {}, "body": []},
                classTemplate: "SUBJECT"
            },
            createdAt: new Date(),
            updatedAt: new Date()
        },
        parentSample: undefined,
        biobank: 1 // Biobank is already "simplified"
    };

    describe("#validate", function() {
        
        it("should correctly validate a valid sample using its schema", function() {
            var sample = _.cloneDeep(fixtures.sample[0]);
            var dataType = _.cloneDeep(_.findWhere(fixtures.datatype, {id: sample.type}));
            var res = SampleService.validate(sample, true, dataType);
            expect(res.error).to.be.null;
            expect(res.value).to.eql(sample);
        });

        it("should raise an Error if the data is not valid", function() {
            var invalidSample = _.cloneDeep(fixtures.sample[0]);
            var dataType = _.cloneDeep(_.findWhere(fixtures.datatype, {id: invalidSample.type}));
            invalidSample.metadata.location = {value: "nose"};
            var res = SampleService.validate(invalidSample, true, dataType);
            expect(res.error).not.to.be.null;
        });


    });

    it("should replace the populated properties (e.g. type, donor, parentSample...) with their id (i.e. type -> type.id)", function() {
         var typeId = populatedSample.type.id;
         var donorId = populatedSample.donor.id;
         var biobankId = populatedSample.biobank;
         var parentSampleId = populatedSample.parentSample;
         SampleService.simplify(populatedSample);
         expect(populatedSample.type).to.equals(typeId);
         expect(populatedSample.donor).to.equals(donorId);
         expect(populatedSample.biobank).to.equals(biobankId);
         expect(populatedSample.parentSample).to.equals(parentSampleId);
    });

});
