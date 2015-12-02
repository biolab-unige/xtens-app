/**
 * DataController
 *
 * @description :: Server-side logic for managing data
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */
/* jshint esnext: true */
/* jshint node: true */
/* globals _, sails, Data, DataType, DataService, SubjectService, SampleService, QueryService, TokenService */
"use strict";

let BluebirdPromise = require('bluebird');
let ControllerOut = require("xtens-utils").ControllerOut;
let xtensConf = global.sails.config.xtens;
let crudManager = xtensConf.crudManager;
let DATA = xtensConf.constants.DataTypeClasses.DATA;

module.exports = {

    
    /** 
     *  POST /data
     *  @method
     *  @name create
     *  @description -> create a new Data Instance; transaction-safe implementation 
     *                   
     */
    create: function(req, res) {
        let data = req.allParams();
        let co = new ControllerOut(res);

        DataService.simplify(data);

        DataType.findOne(data.type).then(function(dataType) {
            let validationRes = DataService.validate(data, true, dataType);
            if (validationRes.error === null) {
                data = validationRes.value;
                let dataTypeName = dataType && dataType.name;
                return crudManager.createData(data, dataTypeName);
            }
            else {
                throw new Error(validationRes.error);
            } 
        })
        .then(function(idData) {
            console.log(idData);
            return Data.findOne(idData).populate('files');
        })
        .then(function(result) {
            res.set('Location', req.baseUrl + req.url + '/'  + result.id);
            return res.json(201, result);
        })
        .catch(function(error) {
            console.log("Error: " + error.message);
            return co.error(error);
        });
    },

    /**
     * GET /data/:id 
     * @method
     * @name findOne
     * @description - retrieve an existing data
     */
    findOne: function(req, res) {
        let co = new ControllerOut(res);
        let id = req.param('id');
        
        let query = Data.findOne(id);

        query = QueryService.populateRequest(query, req);
        
        query.then(function(result) {
            return res.json(result);
        })

        .catch(function(error) {
            return co.error(error);
        });

    },

    /**
     * GET /data
     * GET /data/find
     *
     * @method
     * @name find
     * @description Find data based on criteria
     */
    find: function(req, res) {
        let co = new ControllerOut(res);

        let query = Data.find()
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
     *  PUT /data/:id
     *  @method
     *  @name update
     *  @description  -> update an existing Data Instance; transaction-safe implementation
     *
     */
    update: function(req, res) {
        let data = req.body;
        let co = new ControllerOut(res);

        DataService.simplify(data);

        DataType.findOne(data.type).then(function(dataType) {
            let validationRes = DataService.validate(data, true, dataType);
            if (validationRes.error === null) {
                let dataTypeName = dataType && dataType.name;
                data = validationRes.value;
                return crudManager.updateData(data, dataTypeName);
            }
            else {
                throw new Error(validationRes.error);
            } 
        })
        .then(function(idData) {
            return Data.findOne(idData).populate('files');
        })
        .then(function(result) {
            return res.json(result);
        })
        .catch(function(error) {
            console.log("Error: " + error.message);
            return co.error(error);
        });
    },

    /**
     * DELETE /data/:id
     * @method
     * @name destroy
     * @description      
     */
    destroy: function(req, res) {
        let co = new ControllerOut(res);
        let id = req.param('id');
        let idOperator = TokenService.getToken(req).id;

        if (!id) {
            return co.badRequest({message: 'Missing data ID on DELETE request'});
        }

        return BluebirdPromise.props({
            data: Data.findOne({id: id}),
            dataTypes: crudManager.getDataTypesByRolePrivileges({
                idOperator: idOperator,
                model: DATA
            })
        })
        .then(function(result) {
            let allowedDataTypes = _.pluck(result.dataTypes, 'id');
            console.log('idOperator: ' + idOperator);
            console.log(allowedDataTypes);
            console.log(result.data.type);
            if (!result.data) {
                // TODO add logic to throw a NotFoundError (implement it!!)
            }
            if (allowedDataTypes.indexOf(result.data.type) > -1) {
                return crudManager.deleteData(id);
            }
        })

        .then(function(deleted) {
            if (deleted === undefined) {
                return co.forbidden({message: 'User nor authorized to delete Data with ID: ' + id});
            }
            return res.json({
                deleted: deleted
            });
        })

        .catch(function(err) {
            return co.error(err);
        });

    },

    /**
     * @method
     * @name edit
     * @description retrieve all required information to create an EditData form
     */

    edit: function(req, res) {
        let co = new ControllerOut(res);
        let params = req.allParams();
        let idOperator = TokenService.getToken(req).id;

        return BluebirdPromise.props({
            data: DataService.getOneAsync(params.id),
            dataTypes: crudManager.getDataTypesByRolePrivileges({
                idOperator: idOperator,
                model: DATA,
                idDataTypes: params.idDataTypes
            }),
            parentSubject: SubjectService.getOneAsync(params.parentSubject),
            parentSample: SampleService.getOneAsync(params.parentSample),
            parentData: DataService.getOneAsync(params.parentData)
        })

        .then(function(results) {
            return res.json(results);
        })

        .catch(function(err) {
            return co.error(err);
        });

    }

};

