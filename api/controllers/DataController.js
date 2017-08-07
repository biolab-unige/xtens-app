/**
 * DataController
 *
 * @description :: Server-side logic for managing data
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */
/* jshint node: true */
/* globals _, sails, Data, DataType, DataService, DataTypeService, SubjectService, OperatorService, SampleService, QueryService, TokenService, DataTypePrivileges */
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
        const dataTypePrivilege = yield DataTypeService.getDataTypePrivilegeLevel(operator.groups, data.type);
        if (!dataTypePrivilege || _.isEmpty(dataTypePrivilege)) {
          // || dataTypePrivilege.privilegeLevel !== EDIT
            throw new PrivilegesError(`Authenticated user has not edit privileges on the data type ${data.type}`);
        }
        DataService.simplify(data);
        const dataType = yield DataType.findOne(data.type);
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
    }),

    findOne: BluebirdPromise.coroutine(function *(req, res) {
        const id = req.param('id');
        const operator = TokenService.getToken(req);

        let query = Data.findOne(id);
        query = actionUtil.populateRequest(query, req);

        let data = yield BluebirdPromise.resolve(query);
        const idDataType = data ? _.isObject(data.type) ? data.type.id :  data.type : undefined;
        const dataTypePrivilege = yield DataTypeService.getDataTypePrivilegeLevel(operator.groups, idDataType);

              //filter Out Metadata if operator has not the privilege
        if (!dataTypePrivilege || _.isEmpty(dataTypePrivilege)){ data = {}; }
        else if( dataTypePrivilege.privilegeLevel === VIEW_OVERVIEW) { data.metadata = {}; }

        if( !operator.canAccessSensitiveData && !_.isEmpty(data.metadata) ){
            data = yield DataService.filterOutSensitiveInfo(data, operator.canAccessSensitiveData);
        }
        return res.json(data);

    }),

    find: BluebirdPromise.coroutine(function *(req, res) {

        const operator = TokenService.getToken(req);
        let allPrivileges = yield DataTypePrivileges.find({group:operator.groups});
        allPrivileges = operator.groups.length > 1 ? DataTypeService.getHigherPrivileges(allPrivileges) : allPrivileges;
        let params = req.allParams();
        params.model = DATA;
        params.privilegeLevel = VIEW_OVERVIEW;
        params.idOperator = operator.id;
        let data = yield crudManager.findData(params);

        const dataTypesId = !_.isEmpty(data) ? _.isObject(data[0].type) ? _.uniq(_.map(_.map(data, 'type'), 'id')) : _.uniq(_.map(data, 'type')) : [];

        const pagePrivileges = allPrivileges.filter( obj => {
            return _.find(dataTypesId, id =>{ return id === obj.dataType;});
        });

        const [payload, headerInfo]  = yield BluebirdPromise.all([
            DataService.filterListByPrivileges(data, dataTypesId, pagePrivileges, operator.canAccessSensitiveData),
            QueryService.composeHeaderInfo(req, params)
        ]);
        return DataService.prepareAndSendResponse(res, payload, headerInfo);

    }),

    update: BluebirdPromise.coroutine(function *(req, res) {
        let data = req.allParams();
        const operator = TokenService.getToken(req);

        let result = yield DataService.hasDataSensitive(data.id, DATA);
        if (result.hasDataSensitive && !operator.canAccessSensitiveData) {
            throw new PrivilegesError("Authenticated user is not allowed to modify sensitive data");
        }

        const idDataType = _.isObject(data.type) ? data.type.id : data.type;
        const dataTypePrivilege = yield DataTypeService.getDataTypePrivilegeLevel(operator.groups, idDataType);
        if (!dataTypePrivilege || dataTypePrivilege.privilegeLevel != EDIT) {
            throw new PrivilegesError(`Authenticated user has not edit privileges on the data type ${data.type}`);
        }
        DataService.simplify(data);

        const dataType = yield DataType.findOne(idDataType);
        const validationRes = DataService.validate(data, true, dataType);
        if (validationRes.error !== null) {
            throw new ValidationError(validationRes.error);
        }
        const dataTypeName = dataType && dataType.name;
        data = validationRes.value;
        const updatedData = yield crudManager.updateData(data, dataTypeName);

        return res.json(updatedData);
    }),

    destroy: BluebirdPromise.coroutine(function *(req, res, co) {
        const id = req.param('id');
        const operator = TokenService.getToken(req);

        if (!id) {
            return co.badRequest({ message: 'Missing data ID on DELETE request' });
        }

        const data = yield Data.findOne({ id: id });
        if (!data) {
            throw new NonexistentResourceError("Missing Resource");
        }
            //retrieve dataType id
        const idDataType = _.isObject(data.type) ? data.type.id : data.type;

        const dataTypePrivilege = yield DataTypeService.getDataTypePrivilegeLevel(operator.groups, idDataType);
        if (!dataTypePrivilege || dataTypePrivilege.privilegeLevel != EDIT) {
            throw new PrivilegesError(`Authenticated user has not edit privileges on the data type ${data.type}`);
        }
        sails.log.info(`Subject to be deleted:  ${data.id}`);

        const deleted = yield crudManager.deleteData(id);
        return res.json(200, { deleted: deleted });

    }),

    edit: BluebirdPromise.coroutine(function *(req, res) {
        const operator = TokenService.getToken(req);
        const params = req.allParams();
        sails.log.info("DataController.edit - Decoded ID is: " + operator.id);

        const payload = yield BluebirdPromise.props({
            data: DataService.getOneAsync(params.id),
            dataTypes: crudManager.getDataTypesByRolePrivileges({
                idOperator: operator.id,
                model: DATA,
                idDataTypes: params.idDataTypes,
                parentDataType: params.parentDataType,
                project: params.project,
                privilegeLevel: EDIT
            }),
            parentSubject: SubjectService.getOneAsync(params.parentSubject, params.parentSubjectCode),
            parentSample: SampleService.getOneAsync(params.parentSample),
            parentData: DataService.getOneAsync(params.parentData)
        });

        if (_.isEmpty(payload.dataTypes)){ throw new PrivilegesError(`Authenticated user has not edit privileges on any data type`); }

        if (payload.data){
            let operators = yield OperatorService.getOwners(payload.data);
            payload.operators = operators;
          // if operator has not access to Sensitive Data and dataType has sensitive data, then return forbidden
            const sensitiveRes = yield DataService.hasDataSensitive(payload.data.id, DATA);
            if (sensitiveRes && ((sensitiveRes.hasDataSensitive && !operator.canAccessSensitiveData))) {
                throw new PrivilegesError("Authenticated user is not allowed to edit sensitive data");
                // if edit data exists and operator has not the privilege to EDIT datatype, then throw Privileges Error
            }
            if(_.isEmpty(payload.dataTypes) || !_.find(payload.dataTypes, {id : payload.data.type.id})) {
                throw new PrivilegesError(`Authenticated user has not edit privileges on the data type`);
            }
        }
        return res.json(payload);


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
        coroutines.findOne(req, res)
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
        coroutines.find(req,res)
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
        const co = new ControllerOut(res);
        coroutines.update(req, res, co)
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
        coroutines.destroy(req,res,co)
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
        coroutines.edit(req, res)
            .catch(err => {
                sails.log.error(err);
                return co.error(err);
            });

    }

};
