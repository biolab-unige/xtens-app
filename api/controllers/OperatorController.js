/**
 * OperatorController
 *
 * @description :: Server-side logic for managing operators
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

 /* jshint node: true */
 /* globals _, sails, Subject, Sample, Data, DataType, SubjectService, BiobankService, SampleService, TokenService, QueryService, DataService, PassportService */
 "use strict";

const ControllerOut = require("xtens-utils").ControllerOut;
const crudManager = sails.hooks.persistence.crudManager;
const BluebirdPromise = require('bluebird');
const createUser = BluebirdPromise.promisify(PassportService.protocols.local.createUser);
const updatePassword = BluebirdPromise.promisify(PassportService.protocols.local.updatePassword);
const ValidationError = require('xtens-utils').Errors.ValidationError;

var OperatorController = {

    create: function(req, res) {

        return createUser(req.allParams())

        .then(function(operator) {

            // set a password field (for Backbone)
            operator.password = true;

            console.log(operator);
            return res.json(200, operator);

        });

    },

    updatePassword: function(req, res) {
        const co = new ControllerOut(res);
        const idOperator = TokenService.getToken(req).id;
        if (idOperator){

        return updatePassword(req.allParams(),idOperator)

        .then(function(operator) {

            return res.json(200);

        }).catch(function(error) {
            console.log(error.message);
            return co.error(error);
        });
      }
      else {
              return res.json(400, "Operator not Found");
      }

    },

    addGroupToOperator: function(req,res,next) {

        /* Operator.findOne(req.param('operator_id')).populate('groups').exec(function(err,bean){
           if(err) return next(err);
           if(!bean) return next();
           bean.groups.add(req.param('group_id'));
           bean.save(function(err) {
           if(err) return next(err);
           res.redirect('/operator');
           });
           });*/
    }


                        /*removeGroupFromOperator: function(req,res,next){
                          }
                        /**
                         * `OperatorController.create()`

create: function (req, res) {
res.view();
},
*/

                        /**
                         * `OperatorController.destroy()`

destroy: function (req, res) {
return res.json({
todo: 'destroy() is not implemented yet!'
});
},


/**
 * `OperatorController.tag()`

tag: function (req, res) {
return res.json({
todo: 'tag() is not implemented yet!'
});
},


/**
 * `OperatorController.like()`

like: function (req, res) {
return res.json({
todo: 'like() is not implemented yet!'
});
}*/
};

module.exports = OperatorController;
