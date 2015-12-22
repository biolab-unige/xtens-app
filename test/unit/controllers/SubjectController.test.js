var expect = require("chai").expect;
var request = require('supertest');
// var cloneDeep = require('clone-deep');
var token = require("../../../config/local.js").token;


describe('DataController', function() {


  describe('POST /subject', function() {
    it('Should return OK 201, with location of new subject', function(done) {

      request(sails.hooks.http.app)
        .post('/subject')
        .set('Authorization', token)
        .send({
          personalInfo: {
            givenName: 'Gino',
            surname: 'Oliveri',
            birthDate: '12-11-2003'
          },
          type: 1,
          code: '888',
          sex: 'N.D.',
          metadata: {
            status: {
              value: 'diseased'
            },
            disease: {},
            diagnosis_age: {
              unit: 'day'
            }
          },
          notes: "New subject"
        })
        .expect(201, done)
        .expect(function(res) {
          var l = res.header.location;
          var loc = l.split('/');
          var location = '/' + loc[3] + '/' + loc[4];
          expect(location).to.equals('/subject/4');
        });


    });

    it('Should return 400, Wrong Model', function(done) {

      request(sails.hooks.http.app)
        .post('/subject')
        .set('Authorization', token)
        .send({
          type: 3,
          metadata: {},
          date: "2015-12-06",
          tags: [],
          notes: "New subject"
        })
        .expect(400, done);

    });
  });

  describe('PUT /subject', function() {
    it('Should return OK 200, notes Updated', function(done) {
      var note = "New subject Updated";
      //  var subject;
      //  Subject.findOne({id:4}).then(function(res){
      // subject=_.cloneDeep(res);
      // subject.notes=note;
      // console.log('Log findOne Subject PUT: ' + JSON.stringify(subject));

      request(sails.hooks.http.app)
        .put('/subject/4')
        .set('Authorization', token)
        .send({
          id: 4,
          personalInfo: {
            id: 2,
            givenName: 'Gino',
            surname: 'Oliveri',
            birthDate: '12-11-2003'
          },
          type: 1,
          code: '888',
          sex: 'N.D.',
          metadata: {
            status: {
              value: 'diseased'
            },
            disease: {},
            diagnosis_age: {
              unit: 'day'
            }
          },
          notes: "New subject Updated"
        })
        .expect(200, done)
        .expect(function(res) {
          //console.log(res.body[0].notes);
          expect(res.body[0].notes).to.equals(note);
        });
      //}).catch(function(err){console.log(err);});
    });

    it('Should return 400, Wrong Model', function(done) {

      request(sails.hooks.http.app)
        .put('/subject/2')
        .set('Authorization', token)
        .send({
          id: 2,
          type: 3,
          metadata: {},
          date: "2015-12-06",
          tags: [],
          notes: "New subject"
        })
        .expect(400, done);
    });

  });

  describe('GET /subject', function() {
    it('Should return OK 200', function(done) {

      request(sails.hooks.http.app)
        .get('/subject')
        .set('Authorization', token)
        //.send({id:1})
        .expect(200, done)
        .expect(function(res) {
          console.log(res.body);
          expect(res.body).to.have.length(fixtures.subject.length + 1);
        });

    });
    //
    //        it('Should return 400, metadata required', function (done) {
    //
    //           request(sails.hooks.http.app)
    //             .get('/subject/2')
    //             .set('Authorization',token)
    //             .expect(400, done)
    //             .expect(function(res) {
    //               //console.log("Header: " + res.header);
    //               //expect(res.body).to.have.length(fixtures.subject.length+1);
    //               });
    //      });
  });
  describe('DELETE /subject', function() {
    it('Should return OK 200, with array length to 1', function(done) {

      request(sails.hooks.http.app)
        .delete('/subject/2')
        .set('Authorization', token)
        .expect(200, done)
        .expect(function(res) {
          console.log('N° Subject deleted: ' + res.body.deleted);
          expect(res.body.deleted).to.equals(1);
        });
    });

      it('Should return OK 200, with array lenght to 0', function (done) {

         request(sails.hooks.http.app)
           .delete('/subject/5')
           .set('Authorization',token)
           .expect(200, done)
           .expect(function(res) {
             console.log('N° Subject deleted: ' + res.body.deleted);
             expect(res.body.deleted).to.equals(0);
      });
    });


  });
});
