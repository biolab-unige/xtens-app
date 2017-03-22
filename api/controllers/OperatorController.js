/**
* OperatorController
*
* @description :: Server-side logic for managing operators
* @help        :: See http://links.sailsjs.org/docs/controllers
*/

/* jshint node: true */
/* globals _, sails, TokenService,  PassportService */
'use strict';

const ControllerOut = require('xtens-utils').ControllerOut;
const BluebirdPromise = require('bluebird');
const createUser = BluebirdPromise.promisify(PassportService.protocols.local.createUser);
const updatePassword = BluebirdPromise.promisify(PassportService.protocols.local.updatePassword);

var OperatorController = {

    create: function(req, res) {
        const co = new ControllerOut(res);
        sails.log(req.allParams());
        return createUser(req.allParams())

        .then(function(operator) {

            // set a password field (for Backbone)
            operator.password = true;

            sails.log(operator);
            return res.json(201, operator);

        }).catch(function(error) {
            sails.log(error.message);
            return co.error(error);
        });

    },

    /**
     * @method
     * @name patchPassword
     * @description given a correct old password and a new password (with confirmation)
     *              updates the local stored password
     */
    patchPassword: function(req, res) {
        const co = new ControllerOut(res);
        const idOperator = TokenService.getToken(req).id;
        if (idOperator) {

            return updatePassword(req.allParams(), idOperator)

            .then(function() {

                return res.json(204, null);

            }).catch(function(error) {
                sails.log(error.message);
                return co.error(error);
            });
        } else {
            return res.json(400, 'Operator not Found');
        }

    }

    // addGroupToOperator: function(req, res, next) {

        /* Operator.findOne(req.param('operator_id')).populate('groups').exec(function(err,bean){
        if(err) return next(err);
        if(!bean) return next();
        bean.groups.add(req.param('group_id'));
        bean.save(function(err) {
        if(err) return next(err);
        res.redirect('/operator');
        });
        });*/
};


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
// };

module.exports = OperatorController;
