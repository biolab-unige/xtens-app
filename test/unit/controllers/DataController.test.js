var expect = require("chai").expect;
var request = require('supertest');

describe('DataController', function() {

    var token;

    const metadata = {
        "name":{"value":"Antares", "group": "Generic Info" },
        "constellation":{"value":"scorpius", "group":"Generic Info"},
        "classification":{"value":"supergiant", "group":"Generic Info"},
        "designation":{"values":["α Scorpii, Cor Scorpii", "21 Sco"],"group":"Generic Info","loop":"Other Designations"},
        "mass":{"value": 12.4,"unit":"M☉","group":"Physical Details"},
        "radius":{"value": 883,"unit":"R☉","group":"Physical Details"},
        "luminosity":{"value": 57500,"unit":"L☉","group":"Physical Details"},
        "temperature":{"value": 3400,"unit":"K","group":"Physical Details"}
    };

    before(function(done) {
        var admin = fixtures.operator[0];
        var passport = _.find(fixtures.passport, {
            'user': admin.id,
            'protocol': 'local'
        });

        console.log("DataController.test - admin and local passport is: ");
        console.log(admin);
        console.log(passport);

        request(sails.hooks.http.app)
        .post('/login')
        .send({identifier: admin.login, password: passport.password})
        .end(function(err, res) {
            if (err) {
                console.log("DataController.test - login failed");
                console.log(err);
            }
            console.log(res.body);
            token = res.body && res.body.token;
            console.log("Got token: " + token);
            done();
        });
    });

    describe('POST /data', function() {
        it('Should return OK 201, with location of new Data', function (done) {

            request(sails.hooks.http.app)
            .post('/data')
            .set('Authorization', token)
            .send({
                "type": 5,
                "metadata": metadata,
                "date": "2015-12-06",
                "notes": "New data"
            })
            .expect(201)
            .end(function(err, res) {
                if (err) {
                    console.log(err);
                    done(err);
                }
                var l = res.header.location;
                var loc = l.split('/');
                var location = '/' + loc[3]+ '/' + loc[4];
                expect(location).to.equals('/data/2');
        });
    });

    it('Should return 400, metadata required', function (done) {

       request(sails.hooks.http.app)
         .post('/data')
         .set('Authorization', token)
         .send({type:3, metadata:{}, date:"2015-12-06",tags:[],notes:"New data"})
         .expect(400, done);

    });
  });

  describe('PUT /data', function() {
    it('Should return OK 200, notes Updated', function (done) {
      const note = "New Data Updated";

      request(sails.hooks.http.app)
        .put('/data/2')
        .set('Authorization', token)
        .send({
            id: 2,
            type: 5,
            metadata: metadata,
            notes: "New Data Updated"
        })
        .expect(200)
        .end(function(err, res) {
          console.log(res.body[0].notes);
          expect(res.body[0].notes).to.equals(note);
          if (err) {
              done(err);
          }
          done();
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
            .set('Authorization', token)
            //.send({id:1})
            .expect(200)
            .end(function(err, res) {
              console.log(res.body);
              expect(res.body).to.have.length(fixtures.data.length+1);
              if (err) {
                  done(err);
              }
              done();
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
            .set('Authorization', token)
            .send()
            .expect(200)
            .end(function(err, res) {
              console.log('N° Data deleted: ' + res.body.deleted);
              expect(res.body.deleted).to.equals(1);
              if (err) {
                  done(err);
              }
              done();
             });
        });

        it('Should return OK 200, with array lenght to 0', function (done) {

           request(sails.hooks.http.app)
             .delete('/data/1')
             .set('Authorization', token)
             .expect(200)
             .end(function(err, res) {
               console.log('N° Subject deleted: ' + res.body.deleted);
               expect(res.body.deleted).to.equals(0);
               if (err) {
                   done(err);
               }
               done();
        });
      });


    });
});
