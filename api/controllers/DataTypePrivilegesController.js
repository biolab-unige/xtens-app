/**
 * DataTypePrivilegesController
 *
 * @description :: Server-side logic for managing Datatypeprivileges
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
/* jshint esnext: true */
/* jshint node: true */
/* globals _, Group, DataType, DataTypeService, QueryService */
"use strict";
let ControllerOut = require("xtens-utils").ControllerOut;
let BluebirdPromise = require("bluebird");
let Joi = BluebirdPromise.promisifyAll(require('joi'));
const DataTypePrivilegeLevels = global.sails.config.xtens.constants.DataTypePrivilegeLevels;

let DataTypePrivilegesController = {

    /**
     * POST /dataTypePrivileges
     * @method
     * @name create
     */
    create: function(req, res) {
        let co = new ControllerOut(res);
        let validationSchema = {
            group: Joi.number().integer().positive().required(),
            dataType: Joi.number().integer().positive().required(),
            privilegeLevel: Joi.string().valid(_.values(DataTypePrivilegeLevels))
        };
        let payload = req.body;
        Joi.validateAsync(req.body, validationSchema)

        .then(function(validatedBody) {
            return global.sails.models.datatypeprivileges.create(validatedBody);
        })

        .then(function(result) {
            res.set('Location', req.baseUrl + req.url + '/'  + result.id);
            return res.json(201, result);
        })

        .catch(function(err) {
            sails.log("DataTypePrivilegesController.create - got some error while creating new data type privileges");
            return co.error(err);
        });

    },

    /**
     * GET /dataTypePrivileges/:id
     * @method
     * @name findOne
     * @description - retrieve an existing dataTypePrivilege
     */
    findOne: function(req, res) {
        let co = new ControllerOut(res);
        let id = req.param('id');

        let query = global.sails.models.datatypeprivileges.findOne(id);

        query = QueryService.populateRequest(query, req);

        query.then(function(result) {
            return res.json(result);
        })

        .catch(function(error) {
            return co.error(error);
        });

    },


    /**
     * GET /dataTypePrivileges
     * @method
     * @name find
     */
    find: function(req, res) {
        let co = new ControllerOut(res);
        let query = global.sails.models.datatypeprivileges.find()
        .where(QueryService.parseCriteria(req))
        .limit(QueryService.parseLimit(req))
        .skip(QueryService.parseSkip(req))
        .sort(QueryService.parseSort(req));

        query = QueryService.populateRequest(query, req);

        query.then(function(data) {
            res.json(data);
        })
        .catch(function(err) {
            return co.error(err);
        });
    },

    /**
     * PUT /dataTypePrivileges/:id
     * @method
     * @name update
     */
    update: function(req, res) {
        let co = new ControllerOut(res);
        let validationSchema = {
            id: Joi.number().integer().positive().required(),
            group: Joi.number().integer().positive().required(),
            dataType: Joi.number().integer().positive().required(),
            privilegeLevel: Joi.string().valid(_.values(DataTypePrivilegeLevels)),
            createdAt: Joi.date(),
            updatedAt: Joi.date()
        };
        let payload = req.body;
        Joi.validateAsync(req.body, validationSchema)

        .then(function(validatedBody) {
            return global.sails.models.datatypeprivileges.update({id: validatedBody.id}, validatedBody);
        })

        .then(function(result) {
            return res.json(result);
        })

        .catch(function(err) {
            sails.log("DataTypePrivilegesController.update - got some error while updating existing data type privileges");
            return co.error(err);
        });

    },

    /**
     * DELETE /dataTypePrivileges/:id
     * @method
     * @name destroy
     * @description
     */
    destroy: function(req, res) {
        let co = new ControllerOut(res);
        let id = req.param('id');
        global.sails.models.datatypeprivileges.destroy(id)

        .then(function(results) {
            return res.json({deleted: results && results.length});
        })

        .catch(function(err) {
            return co.error(err);
        });

    },

    /**
     * @method
     * @name edit
     * @description return all the info required for a privileges edit
     */
    edit: function(req, res) {
        let co = new ControllerOut(res);
        let params = req.allParams();
        let getDataTypePrivileges = BluebirdPromise.promisify(DataTypeService.getDataTypePrivileges);

        return BluebirdPromise.props({
            group: Group.findOne({id: params.groupId}),
            // retrieve all dataTypes not yet authorized for this group
            dataTypes: DataTypeService.getDataTypesToCreateNewPrivileges(params.groupId, params.id),
            dataType: DataTypeService.getDataTypeToEditPrivileges(params.id),
            dataTypePrivileges: getDataTypePrivileges(params.id)
        })


        .then(function(result) {
            sails.log(result);
            return res.json(result);
        })

        .catch(function(err) {
            sails.log(err);
            return co.error(err);
        });

    }

};

module.exports = DataTypePrivilegesController;
