/**
 * SampleController
 *
 * @description :: Server-side logic for managing samples
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */
/* jshint node: true */
/* globals _, sails, Sample, DataType, SubjectService, BiobankService, SampleService, DataTypePrivileges, TokenService, QueryService, DataService, DataTypeService */
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

module.exports = {

    /**
     *  POST /sample
     *  @method
     *  @name create
     *  @description: create a new sample; transaction-safe implementation
     */
    create: function(req, res) {
        let sample = req.allParams();
        const co = new ControllerOut(res);
        const operator = TokenService.getToken(req);

        DataTypeService.getDataTypePrivilegeLevel(operator.id, sample.type).then(function(dataTypePrivilege) {

            if (!dataTypePrivilege || _.isEmpty(dataTypePrivilege) || dataTypePrivilege.privilegeLevel != EDIT) {
                throw new PrivilegesError(`Authenticated user does not have edit privileges on the sample type ${sample.type}`);
            }
            else {
                SampleService.simplify(sample);
                return DataType.findOne(sample.type);
            }
        })
        .then(sampleType => {
            let validationRes = SampleService.validate(sample, true, sampleType);
            if (validationRes.error === null) {
                sample = validationRes.value;
                const sampleTypeName = sampleType && sampleType.name;
                return crudManager.createSample(sample, sampleTypeName);
            }
            else {
                throw new ValidationError(validationRes.error);
            }
        })
        .then(result => {
            sails.log.info(result);
            res.set('Location', req.baseUrl + req.url + '/'  + result.id);
            return res.json(201, result);
        })
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
        const id = req.param('id');
        const operator = TokenService.getToken(req);
        let sample;
        let query = Sample.findOne(id);
        query = actionUtil.populateRequest(query, req);

        query.then(result => {
            if (!result) {
                return {};
            }
            sample = result;
            const idDataType = _.isObject(sample.type) ? sample.type.id : sample.type;

            //retrieve dataTypePrivilege
            return DataTypeService.getDataTypePrivilegeLevel(operator.id, idDataType);
        })
        .then(dataTypePrivilege => {
            //filter Out Metadata if operator has not the privilege
            if (!dataTypePrivilege || _.isEmpty(dataTypePrivilege) ){ return {}; }
            else if( dataTypePrivilege.privilegeLevel === VIEW_OVERVIEW) { sample.metadata = {}; }

            if( operator.canAccessSensitiveData || _.isEmpty(sample.metadata) ){ return sample; }
            //filter Out Sensitive Info if operator can not access to Sensitive Data
            return DataService.filterOutSensitiveInfo(sample, operator.canAccessSensitiveData);
        })
        .then(filteredSample => {
            return res.json(filteredSample);
        })
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
        const operator = TokenService.getToken(req);
        let samples = [], dataTypesId, allPrivileges, pagePrivileges;

        return DataTypePrivileges.find({group:operator.groups[0]}).then(results =>{
            allPrivileges = results;
            let query = QueryService.composeFind(req, null, allPrivileges);
            return query;
        })
        .then(results => {

            samples = results;
            //retrieve dataTypes id and Privileges id
            dataTypesId = !_.isEmpty(samples) ? _.isObject(samples[0].type) ? _.uniq(_.map(_.map(samples, 'type'), 'id')) : _.uniq(_.map(samples, 'type')) : [];
            let arrDtPrivId = allPrivileges.map(el => el.dataType);

            pagePrivileges = _.intersection(arrDtPrivId, dataTypesId);

            return BluebirdPromise.all([
                DataService.filterListByPrivileges(samples, dataTypesId, pagePrivileges, operator.canAccessSensitiveData),
                QueryService.composeHeaderInfo(req, allPrivileges)
            ]);

        })
        .spread((payload, headerInfo) => {
            return DataService.prepareAndSendResponse(res, payload, headerInfo);
        })
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
        let sample = req.allParams();
        const co = new ControllerOut(res);
        const operator = TokenService.getToken(req);

        DataService.hasDataSensitive(sample.id, SAMPLE).then(function(result) {

            if (result.hasDataSensitive && !operator.canAccessSensitiveData) {
                throw new PrivilegesError("Authenticated user is not allowed to modify sensitive data");
            }
        //retrieve dataType id
            const idDataType = _.isObject(sample.type) ? sample.type.id : sample.type;
            return DataTypeService.getDataTypePrivilegeLevel(operator.id, idDataType);

        })
        .then(dataTypePrivilege => {

            if (!dataTypePrivilege || dataTypePrivilege.privilegeLevel != EDIT) {
                throw new PrivilegesError(`Authenticated user does not have edit privileges on the sample type ${sample.type}`);
            }
            SampleService.simplify(sample);

            return DataType.findOne(sample.type);

        })
        .then(dataType => {
            const validationRes = SampleService.validate(sample, true, dataType);
            if (validationRes.error === null) {
                sample = validationRes.value;
                return crudManager.updateSample(sample, dataType.name);
            }
            else {
                throw new ValidationError(validationRes.error);
            }
        })
        .then(result => {
            sails.log.info(result);
            res.set('Location', req.baseUrl + req.url + '/'  + result.id);
            return res.json(result);
        })
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
        const id = req.param('id');
        const operator = TokenService.getToken(req);
        let sample;

        if (!id) {
            return co.badRequest({ message: 'Missing sample ID on DELETE request' });
        }

        Sample.findOne({ id: id }).then(function(result) {
            if(!result){
                throw new NonexistentResourceError("Missing Resource");
            }
            sample = result;
          //retrieve dataType id
            const idDataType = _.isObject(result.type) ? result.type.id : result.type;

            return DataTypeService.getDataTypePrivilegeLevel(operator.id, idDataType);
        })
          .then(dataTypePrivilege => {

              if (!dataTypePrivilege || dataTypePrivilege.privilegeLevel != EDIT) {
                  throw new PrivilegesError(`Authenticated user does not have edit privileges on the sample type ${sample.type}`);
              }
              sails.log.info(`Data to be deleted:  ${sample.data}`);

              return crudManager.deleteSample(id);
          })
          .then(deleted => {
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
     * @description retrieve all required models for editing/creating a Sample via client web-form
     */
    edit: function(req, res) {
        const co = new ControllerOut(res);
        const params = req.allParams();
        const operator = TokenService.getToken(req);
        let payload;

        sails.log.info("SampleController.edit - Decoded ID is: " + operator.id);

        return BluebirdPromise.props({
            sample: SampleService.getOneAsync(params.id),
            dataTypes: crudManager.getDataTypesByRolePrivileges({
                idOperator: operator.id,
                model: SAMPLE,
                idDataTypes: params.idDataTypes,
                parentDataType: params.parentDataType,
                privilegeLevel: EDIT
            }),
            biobanks: BiobankService.getAsync(params),
            donor: SubjectService.getOneAsync(params.donor, params.donorCode),
            parentSample: SampleService.getOneAsync(params.parentSample)
        })
          .then(results => {
              payload = results;

              //if operator has not the privilege to EDIT datatype, then return forbidden
              if (_.isEmpty(results.dataTypes)) {
                  throw new PrivilegesError(`Authenticated user does not have edit privileges on any sample type`);
              }

              if(results.sample){
                  // const idDataTypes = _.isObject(results.sample.type) ? results.sample.type.id : results.sample.type;
                  return DataService.hasDataSensitive(results.sample.id, SAMPLE);
              }

          })
          .then(sensitiveRes => {

              // sails.log.info(sensitiveRes);
              // operator has not the privilege to EDIT datatype, then throw Privileges Error
              if (payload.sample && (_.isEmpty(payload.dataTypes) || !_.find(payload.dataTypes, {id : payload.sample.type.id}))) {
                  throw new PrivilegesError(`Authenticated user does not have edit privileges on the sample type`);
              }
              // if operator has not access to Sensitive Data and dataType has sensitive data, then return forbidden
              if (sensitiveRes && (sensitiveRes.hasDataSensitive && !operator.canAccessSensitiveData)) {
                  throw new PrivilegesError("Authenticated user is not allowed to edit sensitive data");
              }
              return res.json(payload);

          })
          .catch(err => {
              sails.log.error(err);
              return co.error(err);
          });
    }

};
