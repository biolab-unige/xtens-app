var expect = require("chai").expect;
var request = require('supertest');
var cloneDeep = require('clone-deep');
var token = require("/home/nico/Copy/Workspace/xtens-app/config/local.js").token;


describe('DataController', function() {


  describe('POST /sample', function() {
    it('Should return OK 201, with location of new sample', function(done) {

      request(sails.hooks.http.app)
        .post('/sample')
        .set('Authorization', token)
        .send({
          type: 2,
          biobank:2,
          biobankCode: "081852",
          donor: 11,
          metadata: {},
        })
        .expect(201, done)
        .expect(function(res) {
          var l = res.header.location;
          var loc = l.split('/');
          var location = '/' + loc[3] + '/' + loc[4];
          expect(location).to.equals('/sample/2');
        });


    });

    it('Should return 400, Wrong Model', function(done) {

      request(sails.hooks.http.app)
        .post('/sample')
        .set('Authorization', token)
        .send({
          type: 3,
          biobank:2,
          biobankCode: "081852",
          donor: 11,
          metadata: {},
        })
        .expect(400, done);

    });
  });

  describe('PUT /sample', function() {
    it('Should return OK 200, biobank Updated', function(done) {
      var biobank = 14;
      //  var sample;
      //  sample.findOne({id:4}).then(function(res){
      // sample=_.cloneDeep(res);
      // sample.notes=note;
      // console.log('Log findOne sample PUT: ' + JSON.stringify(sample));

      request(sails.hooks.http.app)
        .put('/sample/2')
        .set('Authorization', token)
        .send({
          type: 2,
          biobank:14,
          biobankCode: "081852",
          donor: 11,
          metadata: {},
        })
        .expect(200, done)
        .expect(function(res) {
          //console.log(res.body[0].notes);
          expect(res.body[0].biobank).to.equals(biobank);
        });
      //}).catch(function(err){console.log(err);});
    });

    it('Should return 400, Wrong Model', function(done) {

      request(sails.hooks.http.app)
        .put('/sample/2')
        .set('Authorization', token)
        .send({
          type: 3,
          biobank:14,
          biobankCode: "081852",
          donor: 11,
          metadata: {},
        })
        .expect(400, done);
    });

  });
  //
  describe('GET /sample', function() {
    it('Should return OK 200', function(done) {

      request(sails.hooks.http.app)
        .get('/sample')
        .set('Authorization', token)
        //.send({id:1})
        .expect(200, done)
        .expect(function(res) {
          console.log(res.body);
          expect(res.body).to.have.length(fixtures.sample.length + 1);
        });

    });
  //   //
  //   //        it('Should return 400, metadata required', function (done) {
  //   //
  //   //           request(sails.hooks.http.app)
  //   //             .get('/sample/2')
  //   //             .set('Authorization',token)
  //   //             .expect(400, done)
  //   //             .expect(function(res) {
  //   //               //console.log("Header: " + res.header);
  //   //               //expect(res.body).to.have.length(fixtures.sample.length+1);
  //   //               });
  //   //      });
  });
  describe('DELETE /sample', function() {
    it('Should return OK 200, with array length to 1', function(done) {

      request(sails.hooks.http.app)
        .delete('/sample/2')
        .set('Authorization', token)
        .expect(200, done)
        .expect(function(res) {
          console.log('N° Sample deleted: ' + res.body.deleted);
          expect(res.body.deleted).to.equals(1);
        });
    });

      it('Should return OK 200, with array lenght to 0', function (done) {

         request(sails.hooks.http.app)
           .delete('/sample/5')
           .set('Authorization',token)
           .expect(200, done)
           .expect(function(res) {
             console.log('N° Sample deleted: ' + res.body.deleted);
             expect(res.body.deleted).to.equals(0);
      });
    });


  });
});
