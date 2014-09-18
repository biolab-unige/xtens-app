var Sails = require('sails');
var operator = require('/home/valentina/workspace/xtens-app/api/models/Operator.js');
var request = require('supertest');

var OperatorController = require('/home/valentina/workspace/xtens-app/api/controllers/OperatorController.js');


describe('OperatorController', function() {

   
  describe('addGroupToOperator', function() {
    it('association', function (done) {
       
      request(Sails.hooks.http.app)
        .post('/operatorGroup')
        .send({ operator_id: 13, group_id: [2,3] }).expect(operator.groups,[2,3]);
     


           });
  });

});
