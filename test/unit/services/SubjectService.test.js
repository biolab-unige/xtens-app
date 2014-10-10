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

    describe('#createWithPersonalDetails', function() {
        // SubjectService.createWithPersonal
    });

});
