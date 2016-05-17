/**
 * OperatorController
 *
 * @description :: Server-side logic for managing operators
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

var BluebirdPromise = require("bluebird");
var createUser = BluebirdPromise.promisify(PassportService.protocols.local.createUser);
var updatePassUser = BluebirdPromise.promisify(PassportService.protocols.local.updatePassUser);

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

        return updatePassUser(req.allParams())

        .then(function(operator) {

            console.log("Operator: "+ operator);
            return res.json(200, operator);

        });

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
