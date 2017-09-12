// var SubjectService = require('../../../api/services/SubjectService.js'),

var sinon = require('sinon');
var chai = require('chai');
var expect = chai.expect;
var chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);


describe('SubjectService', function() {

    var personalDetails = {
        givenName: 'Marcello',
        surname: 'Mastropizza',
        birthDate: new Date(),
        sex: 'MALE'
    };
    var subject = {
        code: 'PAT001',
        notes: 'just a test case',
        tags: ['test', 'patient'],
        metadata: {},
        personalDetails: personalDetails
    };

    describe('#getOne', function() {
        it('should return the right subject', function() {
            var expectedSubject = _.cloneDeep(fixtures.subject[0]);
            var id = expectedSubject.id;
            var code = expectedSubject.code;
            SubjectService.getOne(id,code, function(err,res){
                expect(res.id).to.eql(expectedSubject.id);
                expect(res.code).to.eql(expectedSubject.code);
                expect(res.sex).to.eql(expectedSubject.sex);
                expect(res.personalInfo.givenName).to.eql(expectedSubject.personalInfo.givenName);
                expect(res.personalInfo.surname).to.eql(expectedSubject.personalInfo.surname);
                expect(res.personalInfo.birthDate).to.eql(expectedSubject.personalInfo.birthDate);
                expect(res.metadata).to.eql(expectedSubject.metadata);

            });
        });
    });

    describe('#simplify', function() {

        var populatedSubject = {
            id: 1,
            code: "SUBJ1",
            type: {
                id: 12,
                name: "Patient",
                schema: {"header": {}, "body": []},
                classTemplate: "SUBJECT"
            },
            // projects: [{
            //     name: "MIMAS",
            //     description: "MIMAS",
            //     id: 1,
            //     createdAt: "2015-09-08T10:13:32.000Z",
            //     updatedAt: "2015-09-08T10:13:32.000Z"
            // }],
            createdAt: new Date(),
            updatedAt: new Date()
        };

        it('should replace the type "property" (that is an object) with its id (i.e. type -> type.id)', function() {
            var testId = populatedSubject.type.id;
            SubjectService.simplify(populatedSubject);
            console.log("Simplified Subject: ");
            console.log(populatedSubject);
            expect(populatedSubject.type).to.equals(testId);
            // expect(populatedSubject.projects).to.eql([1]);
        });

    });

    describe("#validate", function() {

        it("should correctly validate a valid subject using its schema", function(done) {
            var subject = _.cloneDeep(fixtures.subject[0]);
            var dataType = _.cloneDeep(_.findWhere(fixtures.datatype, {id: subject.type}));
            return SubjectService.validate(subject, true, dataType).then(function (res) {

                expect(res.error).to.be.null;
                expect(_.omit(res.value, 'personalInfo')).to.eql(_.omit(subject, 'personalInfo'));
                done();
                return;
            });
        });

        it("should correctly validate a valid subject with complete metadata using its schema", function(done) {
            var subject = _.cloneDeep(fixtures.subject[1]);
            var dataType = _.cloneDeep(_.findWhere(fixtures.datatype, {id: subject.type}));
            return SubjectService.validate(subject, true, dataType).then(function (res) {

                expect(res.error).to.be.null;
                expect(_.omit(res.value, 'personalInfo')).to.eql(_.omit(subject, 'personalInfo'));
                done();
                return;
            });
        });

    });

});
