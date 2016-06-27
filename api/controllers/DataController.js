/**
 * DataController
 *
 * @description :: Server-side logic for managing data
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */
/* jshint node: true */
/* globals _, sails, Data, DataType, DataService, SubjectService, SampleService, QueryService, TokenService */
"use strict";

const BluebirdPromise = require('bluebird');
const ControllerOut = require("xtens-utils").ControllerOut;
const ValidationError = require('xtens-utils').Errors.ValidationError;
const xtensConf = global.sails.config.xtens;
const crudManager = sails.hooks.persistence.crudManager;
const DATA = xtensConf.constants.DataTypeClasses.DATA;

module.exports = {


    /**
     *  POST /data
     *  @method
     *  @name create
     *  @description -> create a new Data Instance; transaction-safe implementation
     *
     */
    create: function(req, res) {
        sails.log("DataController.create - here we are!!");
        let data = req.allParams();
        const co = new ControllerOut(res);

        DataService.simplify(data);

        DataType.findOne(data.type).then(function(dataType) {
            sails.log.debug(dataType);
            sails.log.debug(crudManager);
            const validationRes = DataService.validate(data, true, dataType);
            if (validationRes.error === null) {
                data = validationRes.value;
                const dataTypeName = dataType && dataType.name;
                return crudManager.createData(data, dataTypeName);
            }
            else {
                throw new ValidationError(validationRes.error);
            }
        })
        /*
        .then(function(idData) {
            console.log(idData);
            return Data.findOne(idData).populate('files');
        }) */
        .then(function(result) {
            res.set('Location', req.baseUrl + req.url + '/'  + result.id);
            return res.json(201, result);
        })
        .catch(function(error) {
            sails.log.error(error.message);
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
        const co = new ControllerOut(res);
        const id = req.param('id');
        const operator = TokenService.getToken(req);

        let query = Data.findOne(id);

        query = QueryService.populateRequest(query, req);

        query.then(function(result) {
          //filter Out Sensitive Info if operator can not access to Sensitive Data
            DataService.filterOutSensitiveInfo(result, operator.canAccessSensitiveData).then(function(data) {

                return res.json(data);
            });
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
        const co = new ControllerOut(res);
        const operator = TokenService.getToken(req);

        let query = Data.find()
        .where(QueryService.parseCriteria(req))
        .limit(QueryService.parseLimit(req))
        .skip(QueryService.parseSkip(req))
        .sort(QueryService.parseSort(req));

        query = QueryService.populateRequest(query, req);

        query.then(function(result) {

            //filter Out Sensitive Info if operator can not access to Sensitive Data
            DataService.filterOutSensitiveInfo(result, operator.canAccessSensitiveData).then(function(data) {

                res.json(data);
            });

        })
        .catch(function(err) {
            sails.log.error(err.message);
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
        const co = new ControllerOut(res);

        DataService.simplify(data);

        DataType.findOne(data.type).then(function(dataType) {
            const validationRes = DataService.validate(data, true, dataType);
            if (validationRes.error === null) {
                const dataTypeName = dataType && dataType.name;
                data = validationRes.value;
                return crudManager.updateData(data, dataTypeName);
            }
            else {
                throw new ValidationError(validationRes.error);
            }
        }) /*
        .then(function(idData) {
            return Data.findOne(idData).populate('files');
        }) */
        .then(function(result) {
            sails.log(result);
            return res.json(result);
        })
        .catch(function(error) {
            sails.log.error(error.message);
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
        const co = new ControllerOut(res);
        const id = req.param('id');
        const idOperator = TokenService.getToken(req).id;

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
            const allowedDataTypes = _.pluck(result.dataTypes, 'id');
            sails.log.info('idOperator: ' + idOperator);
            sails.log.info(allowedDataTypes);
            sails.log.info(`Data to be deleted:  ${result.data}`);

            // if data does not exist return 0 rows deleted
            if (!result.data) {
                return BluebirdPromise.resolve(0);
            }

            if (allowedDataTypes.indexOf(result.data.type) > -1) {
                return crudManager.deleteData(id);
            }

        })

        .then(function(deleted) {
            if (deleted === undefined) {
                return co.forbidden({message: 'User nor authorized to delete Data with ID: ' + id});
            }
            return res.json(200, {
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
     //FARE TESTT
    edit: function(req, res) {
        const co = new ControllerOut(res);
        const params = req.allParams();
        const operator = TokenService.getToken(req);
        let resHasData = {};
        return DataService.hasDataSensitive(params.id).then(function(results) {

            if (resHasData.hasDataSensitive && !operator.canAccessSensitiveData){
                return res.forbidden();
            }
            else{

                return BluebirdPromise.props({
                    data: results.data,
                    dataTypes: crudManager.getDataTypesByRolePrivileges({
                        idOperator: operator.id,
                        model: DATA,
                        idDataTypes: params.idDataTypes,
                        parentDataType: params.parentDataType
                    }),
                    parentSubject: SubjectService.getOneAsync(params.parentSubject, params.parentSubjectCode),
                    parentSample: SampleService.getOneAsync(params.parentSample),
                    parentData: DataService.getOneAsync(params.parentData)
                })

                .then(function(results) {
                // TODO: how to manage edit data with operator canNotAccessSensitiveData but can edit data with sensitive Data??
                  // let dataTypePrivilege = _.filter(results.dataTypes,function (res) { return res.id === results.data['type'];});
                  // if(resHasData.hasDataSensitive && dataTypePrivilege.privilege_level === 'edit')
                    return res.json(results);
                })
                .catch(function(err) {
                    sails.log.error(err);
                    return co.error(err);
                });
            }
        });

    }
    // let dataTypePrivilege = _.filter(results,function (res) { return res.id === data['type'];});
    // if (dataTypePrivilege.privilege_level //DEVO CAPIRE SE IL DATATYPE HA DATI SENSITIVE)
};
