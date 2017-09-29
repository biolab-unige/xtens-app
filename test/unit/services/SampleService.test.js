// var SampleService = require('../../../api/services/SampleService.js'),
var sinon = require('sinon');
var chai = require('chai');
var expect = chai.expect;
var chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);


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

        it("should correctly validate a valid sample using its schema", function(done) {
            var sample = _.cloneDeep(fixtures.sample[0]);
            var dataType = _.cloneDeep(_.findWhere(fixtures.datatype, {id: sample.type}));
            return SampleService.validate(sample, true, dataType).then(function (res) {

                expect(res.error).to.be.null;
                expect(res.value).to.eql(sample);
                done();
                return;
            });
        });

        it("should raise an Error if the data is not valid", function(done) {
            var invalidSample = _.cloneDeep(fixtures.sample[0]);
            var dataType = _.cloneDeep(_.findWhere(fixtures.datatype, {id: invalidSample.type}));
            invalidSample.metadata.location = {value: "nose"};
            return SampleService.validate(invalidSample, true, dataType).then(function (res) {

                expect(res.error).not.to.be.null;
                done();
                return;
            });
        });


    });
    describe('#simplify', function() {
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

    describe('#getOne', function() {
        it('should return the right sample', function(done) {
            var expectedSample = _.cloneDeep(fixtures.sample[0]);
            var id = expectedSample.id;
            var code = expectedSample.code;
            SampleService.getOne(id, function(err,res){
                expect(res.id).to.eql(expectedSample.id);
                expect(res.biobankCode).to.eql(expectedSample.biobankCode);
                expect(res.metadata).to.eql(expectedSample.metadata);
                done();
            });
        });
    });
});
