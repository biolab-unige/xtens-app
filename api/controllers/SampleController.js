/**
 * SampleController
 *
 * @description :: Server-side logic for managing samples
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */
/* jshint node: true */
/* globals _, sails, Sample, DataType, SubjectService, BiobankService, OperatorService, SampleService, DataTypePrivileges, TokenService, QueryService, DataService, DataTypeService */
"use strict";

const BluebirdPromise = require('bluebird');
const ControllerOut = require("xtens-utils").ControllerOut;
const crudManager = sails.hooks.persistence.crudManager;
const ValidationError = require('xtens-utils').Errors.ValidationError;
const PrivilegesError = require('xtens-utils').Errors.PrivilegesError;
const NonexistentResourceError = require('xtens-utils').Errors.NonexistentResourceError;
const xtensConf = global.sails.config.xtens;
const SAMPLE = xtensConf.constants.DataTypeClasses.SAMPLE;
const VIEW_OVERVIEW = xtensConf.constants.DataTypePrivilegeLevels.VIEW_OVERVIEW;
const EDIT = xtensConf.constants.DataTypePrivilegeLevels.EDIT;
const actionUtil = require('sails/lib/hooks/blueprints/actionUtil');

const coroutines = {

    /**
     * @method
     * @name create
     * @param{Request} req
     * @param{Response} res
     * @description coroutine for new Sample instance creation
     */
    create: BluebirdPromise.coroutine(function *(req, res) {
        let sample = req.allParams();
        const operator = TokenService.getToken(req);
        const dataTypePrivilege = yield DataTypeService.getDataTypePrivilegeLevel(operator.groups, sample.type);
        if (!dataTypePrivilege || _.isEmpty(dataTypePrivilege || dataTypePrivilege.privilegeLevel != EDIT)) {
            throw new PrivilegesError(`Authenticated user has not edit privileges on the sample type ${sample.type}`);
        }
        SampleService.simplify(sample);
        const dataType = yield DataType.findOne(sample.type);

        const validationRes = yield SampleService.validate(sample, true, dataType);
        if (validationRes.error !== null) {
            throw new ValidationError(validationRes.error);
        }
        sample = validationRes.value;
        const dataTypeName = dataType && dataType.name;
        const result = yield crudManager.createSample(sample, dataTypeName);
        sails.log.info(result);
        res.set('Location', `${req.baseUrl}${req.url}/${result.id}`);
        return res.json(201, result);
    }),

    findOne: BluebirdPromise.coroutine(function *(req, res) {
        const id = req.param('id');
        const operator = TokenService.getToken(req);

        let query = Sample.findOne(id);
        query = actionUtil.populateRequest(query, req);

        let sample = yield BluebirdPromise.resolve(query);
        const idSampleType = sample ? _.isObject(sample.type) ? sample.type.id :  sample.type : undefined;
        const dataTypePrivilege = yield DataTypeService.getDataTypePrivilegeLevel(operator.groups, idSampleType);

              //filter Out Metadata if operator has not the privilege
        if (!dataTypePrivilege || _.isEmpty(dataTypePrivilege)){ sample = {}; }
        else if( dataTypePrivilege.privilegeLevel === VIEW_OVERVIEW) { sample.metadata = {}; }

        if( !operator.canAccessSensitiveData && !_.isEmpty(sample.metadata) ){
            sample = yield DataService.filterOutSensitiveInfo(sample, operator.canAccessSensitiveData);
        }
        return res.json(sample);

    }),

    find: BluebirdPromise.coroutine(function *(req, res) {

        const operator = TokenService.getToken(req);
        let allPrivileges = yield DataTypePrivileges.find({group:operator.groups});
        allPrivileges = operator.groups.length > 1 ? DataTypeService.getHigherPrivileges(allPrivileges) : allPrivileges;
        let params = req.allParams();
        params.model = SAMPLE;
        params.privilegeLevel = VIEW_OVERVIEW;
        params.idOperator = operator.id;

        let samples = yield crudManager.findData(params);
        const dataTypesId = !_.isEmpty(samples) ? _.isObject(samples[0].type) ? _.uniq(_.map(_.map(samples, 'type'), 'id')) : _.uniq(_.map(samples, 'type')) : [];
        const pagePrivileges = allPrivileges.filter( obj => {
            return _.find(dataTypesId, id =>{ return id === obj.dataType;});
        });

        const [payload, headerInfo]  = yield BluebirdPromise.all([
            DataService.filterListByPrivileges(samples, dataTypesId, pagePrivileges, operator.canAccessSensitiveData),
            QueryService.composeHeaderInfo(req, params)
        ]);
        return DataService.prepareAndSendResponse(res, payload, headerInfo);

    }),

    update: BluebirdPromise.coroutine(function *(req, res) {
        let sample = req.allParams();
        const operator = TokenService.getToken(req);

        let result = yield DataService.hasDataSensitive(sample.id, SAMPLE);
        if (result.hasDataSensitive && !operator.canAccessSensitiveData) {
            throw new PrivilegesError("Authenticated user is not allowed to modify sensitive data");
        }

        const idSampleType = _.isObject(sample.type) ? sample.type.id : sample.type;
        const dataTypePrivilege = yield DataTypeService.getDataTypePrivilegeLevel(operator.groups, idSampleType);
        if (!dataTypePrivilege || dataTypePrivilege.privilegeLevel != EDIT) {
            throw new PrivilegesError(`Authenticated user has not edit privileges on the sample type ${sample.type}`);
        }
        SampleService.simplify(sample);

        const dataType = yield DataType.findOne(idSampleType);
        const validationRes = yield SampleService.validate(sample, true, dataType);
        if (validationRes.error !== null) {
            throw new ValidationError(validationRes.error);
        }
        const dataTypeName = dataType && dataType.name;
        sample = validationRes.value;
        const updatedSample = yield crudManager.updateSample(sample, dataTypeName);

        return res.json(updatedSample);
    }),

    destroy: BluebirdPromise.coroutine(function *(req, res, co) {
        const id = req.param('id');
        const operator = TokenService.getToken(req);

        if (!id) {
            return co.badRequest({ message: 'Missing sample ID on DELETE request' });
        }

        const sample = yield Sample.findOne({ id: id });
        if (!sample) {
            throw new NonexistentResourceError("Missing Resource");
        }
            //retrieve dataType id
        const idSampleType = _.isObject(sample.type) ? sample.type.id : sample.type;

        const dataTypePrivilege = yield DataTypeService.getDataTypePrivilegeLevel(operator.groups, idSampleType);
        if (!dataTypePrivilege || dataTypePrivilege.privilegeLevel != EDIT) {
            throw new PrivilegesError(`Authenticated user has not edit privileges on the sample type ${sample.type}`);
        }
        sails.log.info(`Subject to be deleted:  ${sample.id}`);

        const deleted = yield crudManager.deleteSample(id);
        return res.json(200, { deleted: deleted });

    }),

    edit: BluebirdPromise.coroutine(function *(req, res) {
        const operator = TokenService.getToken(req);
        const params = req.allParams();
        sails.log.info("SampleController.edit - Decoded ID is: " + operator.id);

        const payload = yield BluebirdPromise.props({
            sample: SampleService.getOneAsync(params.id),
            dataTypes: crudManager.getDataTypesByRolePrivileges({
                idOperator: operator.id,
                model: SAMPLE,
                idDataTypes: params.idDataTypes,
                parentDataType: params.parentDataType,
                project: params.project,
                privilegeLevel: EDIT
            }),
            biobanks: BiobankService.getAsync(params),
            donor: SubjectService.getOneAsync(params.donor, params.donorCode),
            parentSample: SampleService.getOneAsync(params.parentSample)
        });
        // if(payload.sample){ throw new ValidationError('No sample found with id: ${params.id}'); }
              //if operator has not the privilege to EDIT datatype, then return forbidden
        if (_.isEmpty(payload.dataTypes)){ throw new PrivilegesError(`Authenticated user has not edit privileges on any sample type`); }


        if (payload.sample){

            let operators = yield OperatorService.getOwners(payload.sample);
            payload.operators = operators;
          // if operator has not access to Sensitive Data and dataType has sensitive data, then return forbidden
            const sensitiveRes = yield DataService.hasDataSensitive(payload.sample.id, SAMPLE);
            if (sensitiveRes && ((sensitiveRes.hasDataSensitive && !operator.canAccessSensitiveData))) {
                throw new PrivilegesError("Authenticated user is not allowed to edit sensitive data");
                // if edit sample exists and operator has not the privilege to EDIT datatype, then throw Privileges Error
            }
            if(_.isEmpty(payload.dataTypes) || !_.find(payload.dataTypes, {id : payload.sample.type.id})) {
                throw new PrivilegesError(`Authenticated user has not edit privileges on the sample type`);
            }
        }
        return res.json(payload);


    })

};

module.exports = {

    /**
     *  POST /sample
     *  @method
     *  @name create
     *  @description: create a new sample; transaction-safe implementation
     */
    create: function(req, res) {
        const co = new ControllerOut(res);
        coroutines.create(req,res)
        .catch(error => {
            sails.log.error("SampleController.create: " + error.message);
            return co.error(error);
        });

    },

    /**
     * GET /sample/:id
     * @method
     * @name findOne
     * @description - retrieve an existing sample
     */
    findOne: function(req, res) {
        const co = new ControllerOut(res);
        coroutines.findOne(req,res)
        .catch(error => {
            return co.error(error);
        });

    },

    /**
     * GET /sample
     * GET /sample/find
     *
     * @method
     * @name find
     * @description Find samples based on criteria provided in the request
     */
    find: function(req, res) {
        const co = new ControllerOut(res);
        coroutines.find(req,res)
        .catch(err => {
            sails.log.error(err);
            return co.error(err);
        });
    },

    /**
     * PUT /sample/:ID
     * @method
     * @name update
     * @description - update an existing sample.
     *              Transaction-safe implementation
     */
    update: function(req, res) {
        const co = new ControllerOut(res);
        coroutines.update(req,res)
        .catch(error => {
            sails.log.error(error);
            return co.error(error);
        });

    },

    /**
     * DELETE /sample/:id
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
     * @description retrieve all required models for editing/creating a Sample via client web-form
     */
    edit: function(req, res) {
        const co = new ControllerOut(res);
        coroutines.edit(req,res)
        .catch(err => {
            sails.log.error(err);
            return co.error(err);
        });
    }

};
