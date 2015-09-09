var SubjectService = require('../../../api/services/SubjectService.js'),
    expect = require('chai').expect,
    sinon = require('sinon');

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
        // TODO
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
            projects: [{
                name: "MIMAS",
                description: "MIMAS",
                id: 1,
                createdAt: "2015-09-08T10:13:32.000Z",
                updatedAt: "2015-09-08T10:13:32.000Z"
            }],
            createdAt: new Date(),
            updatedAt: new Date()
        };

        it('should replace the type "property" (that is an object) with its id (i.e. type -> type.id)', function() {
            var testId = populatedSubject.type.id;
            SubjectService.simplify(populatedSubject);
            console.log("Simplified Subject: ");
            console.log(populatedSubject);
            expect(populatedSubject.type).to.equals(testId);
            expect(populatedSubject.projects).to.eql([1]);
        });
     
    });

});
