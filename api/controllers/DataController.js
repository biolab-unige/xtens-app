/**
 * DataController
 *
 * @description :: Server-side logic for managing data
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */
/* jshint node: true */
/* globals _, sails, Data, DataType, DataService, DataTypeService, SubjectService, SampleService, QueryService, TokenService, DataTypePrivileges */
"use strict";

const BluebirdPromise = require('bluebird');
const ControllerOut = require("xtens-utils").ControllerOut;
const ValidationError = require('xtens-utils').Errors.ValidationError;
const PrivilegesError = require('xtens-utils').Errors.PrivilegesError;
const NonexistentResourceError = require('xtens-utils').Errors.NonexistentResourceError;
const xtensConf = global.sails.config.xtens;
const crudManager = sails.hooks.persistence.crudManager;
const DATA = xtensConf.constants.DataTypeClasses.DATA;
const VIEW_OVERVIEW = xtensConf.constants.DataTypePrivilegeLevels.VIEW_OVERVIEW;
const EDIT = xtensConf.constants.DataTypePrivilegeLevels.EDIT;
const actionUtil = require('sails/lib/hooks/blueprints/actionUtil');

const coroutines = {

    /**
     * @method
     * @name create
     * @param{Request} req
     * @param{Response} res
     * @description coroutine for new Data instance creation
     */
    create: BluebirdPromise.coroutine(function *(req, res) {
        let data = req.allParams();
        const operator = TokenService.getToken(req);
        const dataTypePrivilege = yield DataTypeService.getDataTypePrivilegeLevel(operator.id, data.type);
        if (!dataTypePrivilege || _.isEmpty(dataTypePrivilege) || dataTypePrivilege.privilegeLevel !== EDIT) {
            throw new PrivilegesError(`Authenticated user does not have edit privileges on the data type ${data.type}`);
        }
        DataService.simplify(data);
        const dataType = yield DataType.findOne(data.type);
        sails.log.debug(dataType);
        sails.log.debug(crudManager);
        const validationRes = DataService.validate(data, true, dataType);
        if (validationRes.error !== null) {
            throw new ValidationError(validationRes.error);
        }
        data = validationRes.value;
        const dataTypeName = dataType && dataType.name;
        const result = yield crudManager.createData(data, dataTypeName);
        sails.log.info(result);
        res.set('Location', `${req.baseUrl}${req.url}/${result.id}`);
        return res.json(201, result);
    })

};


module.exports = {

  /**
   *  POST /data
   *  @method
   *  @name create
   *  @description -> create a new Data Instance; transaction-safe implementation
   *
   */
    create: function(req, res) {

        const co = new ControllerOut(res);
        coroutines.create(req, res)
        .catch(error => {
            sails.log.error("DataController.create: " + error.message);
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
        let data;
        let query = Data.findOne(id);

        query = actionUtil.populateRequest(query, req);

        query.then(function(result) {
            if (!result) {
                return {};
            }
            data = result;

            const idDataType = _.isObject(data.type) ? data.type.id : data.type;
            //retrieve dataTypePrivilege
            return DataTypeService.getDataTypePrivilegeLevel(operator.id, idDataType);
        })
        .then(dataTypePrivilege => {
                //filter Out Metadata if operator has not the privilege
            if (!dataTypePrivilege || _.isEmpty(dataTypePrivilege)){ return {};}
            else if( dataTypePrivilege.privilegeLevel === VIEW_OVERVIEW) { data.metadata = {}; }

            if( operator.canAccessSensitiveData || _.isEmpty(data.metadata) ){ return data; }
            return DataService.filterOutSensitiveInfo(data, operator.canAccessSensitiveData);
        })
        .then(filteredData => {
            return res.json(filteredData);
        })
        .catch(error => {
            sails.log.error("DataController.findOne: " + error.message);
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

        let data = [], dataTypesId, allPrivileges;
        return DataTypePrivileges.find({group:operator.groups[0]}).then(results =>{
            allPrivileges = results;
            let query = QueryService.composeFind(req, null, allPrivileges);

            return query;
        })
        .then(results => {
            // if (!results || _.isEmpty(results)) {
            //     return [];
            // }
            data = results;

            //retrieve dataTypes id and Privileges id
            dataTypesId = !_.isEmpty(data) ? _.isObject(data[0].type) ? _.uniq(_.map(_.map(data, 'type'), 'id')) : _.uniq(_.map(data, 'type')) : [];
            let arrDtPrivId = allPrivileges.map(el => el.dataType);
            let pagePrivileges = _.intersection(arrDtPrivId, dataTypesId);
        //     return DataTypeService.getDataTypePrivilegeLevel(operator.id, dataTypesId);
        //
        // }).then(pagePrivileges => {

            return BluebirdPromise.all([
                DataService.filterListByPrivileges(data, dataTypesId, pagePrivileges, operator.canAccessSensitiveData),
                QueryService.composeHeaderInfo(req, allPrivileges)
            ]);

        })
        .spread((payload, headerInfo) => {
            return DataService.prepareAndSendResponse(res, payload, headerInfo);
        })
        .catch( function(err) {
            sails.log.error(err);
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
        const operator = TokenService.getToken(req);

        DataService.hasDataSensitive(data.id, DATA).then(result => {

            if (result.hasDataSensitive && !operator.canAccessSensitiveData) {
                throw new PrivilegesError("Authenticated user is not allowed to modify sensitive data");
            }
        //retrieve dataType id
            const idDataType = _.isObject(data.type) ? data.type.id : data.type;
            return DataTypeService.getDataTypePrivilegeLevel(operator.id, idDataType);
        })
        .then(dataTypePrivilege =>  {

            if (!dataTypePrivilege || dataTypePrivilege.privilegeLevel != EDIT) {
                throw new PrivilegesError(`Authenticated user does not have edit privileges on the data type ${data.type}`);
            }

            DataService.simplify(data);

            return DataType.findOne(data.type);

        })
        .then(dataType => {
            const validationRes = DataService.validate(data, true, dataType);
            if (validationRes.error === null) {
                const dataTypeName = dataType && dataType.name;
                data = validationRes.value;
                return crudManager.updateData(data, dataTypeName);
            }
            else {
                throw new ValidationError(validationRes.error);
            }
        })
        .then(function(result) {
            sails.log(result);
            return res.json(result);
        })
        .catch(function(error) {
            sails.log.error(error);
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
        const operator = TokenService.getToken(req);
        let data;

        if (!id) {
            return co.badRequest({ message: 'Missing data ID on DELETE request' });
        }

        Data.findOne({ id: id }).then(result => {
            if (!result) {
                throw new NonexistentResourceError("Missing Resource");
            }
            data = result;
              //retrieve dataType id
            const idDataType = _.isObject(data.type) ? data.type.id : data.type;

            return DataTypeService.getDataTypePrivilegeLevel(operator.id, idDataType);
        })
        .then(dataTypePrivilege => {

            if (!dataTypePrivilege || dataTypePrivilege.privilegeLevel != EDIT) {
                throw new PrivilegesError(`Authenticated user does not have edit privileges on the data type ${data.type}`);
            }
            sails.log.info(`Subject to be deleted:  ${data.data}`);

            return crudManager.deleteData(id);
        })
        .then(function(deleted) {
            return res.json(200, {
                deleted: deleted
            });
        })
        .catch(err => {
            if (err instanceof NonexistentResourceError) {
                return res.json(200, { deleted: 0 });
            }
            sails.log.error(err);
            return co.error(err);
        });

    },

  /**
   * @method
   * @name edit
   * @description retrieve all required information to create an EditData form
   */

    edit: function(req, res) {
        const co = new ControllerOut(res);
        const params = req.allParams();
        const operator = TokenService.getToken(req);
        let payload;

        sails.log.info("DataController.edit - Decoded ID is: " + operator.id);

        BluebirdPromise.props({
            data: DataService.getOneAsync(params.id),
            dataTypes: crudManager.getDataTypesByRolePrivileges({
                idOperator: operator.id,
                model: DATA,
                idDataTypes: params.idDataTypes,
                parentDataType: params.parentDataType,
                privilegeLevel: EDIT
            }),
            parentSubject: SubjectService.getOneAsync(params.parentSubject, params.parentSubjectCode),
            parentSample: SampleService.getOneAsync(params.parentSample),
            parentData: DataService.getOneAsync(params.parentData)
        })
            .then(results => {
                payload = results;
                //if operator has not the privilege to EDIT datatype, then return forbidden
                if (_.isEmpty(results.dataTypes)){
                    throw new PrivilegesError(`Authenticated user does not have edit privileges on any data type`);
                }

                if(results.data){
                    // const idDataTypes = _.isObject(results.data.type) ? results.data.type.id : results.data.type;
                    return DataService.hasDataSensitive(results.data.id, DATA);
                }

            })
            .then(function(sensitiveRes) {

                // sails.log.info(sensitiveRes);
                // if operator has not access to Sensitive Data and dataType has sensitive data, then return forbidden
                if (sensitiveRes && ((sensitiveRes.hasDataSensitive && !operator.canAccessSensitiveData))) {
                    throw new PrivilegesError("Authenticated user is not allowed to edit sensitive data");
                }
                // if edit data exists and operator has not the privilege to EDIT datatype, then throw Privileges Error
                if (payload.data && (_.isEmpty(payload.dataTypes) || !_.find(payload.dataTypes, {id : payload.data.type.id}))) {
                    throw new PrivilegesError(`Authenticated user does not have edit privileges on the data type`);
                }
                return res.json(payload);

            })
            .catch(err => {
                sails.log.error(err);
                return co.error(err);
            });

    }

};
