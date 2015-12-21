var expect = require("chai").expect;
var request = require('supertest');
var cloneDeep = require('clone-deep');
var token = require("/home/nico/Copy/Workspace/xtens-app/config/local.js").token;

describe('DataController', function() {


  describe('POST /data', function() {
    it('Should return OK 201, with location of new Data', function (done) {

      request(sails.hooks.http.app)
        .post('/data')
        .set('Authorization',token)
        .send({type:5, metadata:{}, date:"2015-12-06",notes:"New data"})
        .expect(201, done)
        .expect(function(res) {
          var l=res.header.location;
          var loc=l.split('/');
          var location= '/' + loc[3]+ '/' + loc[4];
          expect(location).to.equals('/data/2');
          });


    });

    it('Should return 400, metadata required', function (done) {

       request(sails.hooks.http.app)
         .post('/data')
         .set('Authorization',token)
         .send({type:3, metadata:{}, date:"2015-12-06",tags:[],notes:"New data"})
         .expect(400, done);

    });
  });

  describe('PUT /data', function() {
    it('Should return OK 200, notes Updated', function (done) {
      var note="New Data Updated";

      request(sails.hooks.http.app)
        .put('/data/2')
        .set('Authorization',token)
        .send({id:2,type:5,metadata:{}, notes:"New Data Updated"})
        .expect(200, done)
        .expect(function(res) {
          console.log(res.body[0].notes);
          expect(res.body[0].notes).to.equals(note);
          });

           });

           it('Should return 400, metadata Required', function (done) {

              request(sails.hooks.http.app)
                .put('/data/2')
                .set('Authorization',token)
                .send({id:2, type:3, metadata:{}, date:"2015-12-06",tags:[],notes:"New data"})
                .expect(400, done);
           });
  });

    describe('GET /data', function() {
      it('Should return OK 200', function (done) {

          request(sails.hooks.http.app)
            .get('/data')
            .set('Authorization',token)
            //.send({id:1})
            .expect(200, done)
            .expect(function(res) {
              console.log(res.body);
              expect(res.body).to.have.length(fixtures.data.length+1);
              });

        });
 //
 //        it('Should return 400, metadata required', function (done) {
 //
 //           request(sails.hooks.http.app)
 //             .get('/data/2')
 //             .set('Authorization',token)
 //             .expect(400, done)
 //             .expect(function(res) {
 //               //console.log("Header: " + res.header);
 //               //expect(res.body).to.have.length(fixtures.data.length+1);
 //               });
 //      });
 });
      describe('DELETE /data', function() {
        it('Should return OK 200, with array length to 1', function (done) {

          request(sails.hooks.http.app)
            .delete('/data/1')
            .set('Authorization',token)
            .send()
            .expect(200, done)
            .expect(function(res) {
              console.log('N° Data deleted: ' + res.body.deleted);
              expect(res.body.deleted).to.equals(1);
              });
        });

        it('Should return OK 200, with array lenght to 0', function (done) {

           request(sails.hooks.http.app)
             .delete('/data/1')
             .set('Authorization',token)
             .expect(200, done)
             .expect(function(res) {
               console.log('N° Subject deleted: ' + res.body.deleted);
               expect(res.body.deleted).to.equals(0);
        });
      });


    });
});
