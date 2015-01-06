var SampleService = require('../../../api/services/SampleService.js'),
    expect = require('chai').expect;

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
