/**
 * SampleController
 *
 * @description :: Server-side logic for managing samples
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */
/* jshint node: true */
/* globals _, sails, Sample, DataType, SubjectService, BiobankService, SampleService, TokenService, QueryService, DataService, DataTypeService */
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
            sails.log.error("SubjectController.create: " + error.message);
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
        query = QueryService.populateRequest(query, req);

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
        let samples = [], arrPrivileges = [], dataTypesId;
        let query = Sample.find()
        .where(QueryService.parseCriteria(req))
        .limit(QueryService.parseLimit(req))
        .skip(QueryService.parseSkip(req))
        .sort(QueryService.parseSort(req));

        query = QueryService.populateRequest(query, req);

        query.then(function(results) {
            if (!results || _.isEmpty(results)) {
                return [];
            }
            samples = results;

          //retrieve dataType id
            dataTypesId = _.isObject(samples[0].type) ? _.uniq(_.pluck(_.pluck(samples, 'type'), 'id')) : _.uniq(_.pluck(samples, 'type'));

            return DataTypeService.getDataTypePrivilegeLevel(operator.id, dataTypesId);

        }).then(privileges => {

            _.isArray(privileges) ? arrPrivileges = privileges : arrPrivileges[0] = privileges;
                //filter Out Metadata if operator has not at least a privilege on Data or exists at least a VIEW_OVERVIEW privilege level
            if (!arrPrivileges || _.isEmpty(arrPrivileges) ){
                return [];
            }
            else if( arrPrivileges.length < dataTypesId.length ||
                  (arrPrivileges.length === dataTypesId.length && _.find(arrPrivileges, { privilegeLevel: VIEW_OVERVIEW }))) {

                  // check for each datum if operator has the privilege to view details. If not metadata object is cleaned
                let index = 0, arrDtPrivId = arrPrivileges.map(function(e) { return e.dataType; });
                for ( let i = samples.length - 1; i >= 0; i-- ) {
                    let idDataType = _.isObject(samples[i].type) ? samples[i].type.id : samples[i].type;
                    index = arrDtPrivId.indexOf(idDataType);
                    if( index < 0 ){ samples.splice(i,1); }
                    else if (arrPrivileges[index].privilegeLevel === VIEW_OVERVIEW) { samples[i].metadata = {}; }
                }
            }
            if( operator.canAccessSensitiveData ){ return samples; }
                //filter Out Sensitive Info if operator can not access to Sensitive Data
            return DataService.filterOutSensitiveInfo(samples, operator.canAccessSensitiveData);
        })
        .then(data => {
            return res.json(data);
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
                throw new PrivilegesError(`"Authenticated user is not allowed to modify sensitive data"`);
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
              // sails.log.info(payload);

              if(results.sample){
                  const idDataTypes = _.isObject(results.sample.type) ? results.sample.type.id : results.sample.type;

                  return DataService.hasDataSensitive(results.sample.id, SAMPLE);
              }
              else {
                //if operator has not the privilege to EDIT datatype, then return forbidden
                  if (_.isEmpty(results.dataTypes)) {
                      throw new PrivilegesError(`Authenticated user does not have EDIT privileges on any data type`);
                  }
              }

          })
          .then(sensitiveRes => {

              // sails.log.info(sensitiveRes);
              // if operator has not access to Sensitive Data and dataType has sensitive data, then return forbidden
              if (sensitiveRes && ((sensitiveRes.hasDataSensitive && !operator.canAccessSensitiveData))) {
                  throw new PrivilegesError("Authenticated user is not allowed to edit sensitive data");
              }
              // operator has not the privilege to EDIT datatype, then throw Privileges Error
              if (payload.sample && (_.isEmpty(payload.dataTypes) || !_.find(payload.dataTypes, {id : payload.sample.type.id}))) {
                  throw new PrivilegesError(`Authenticated user does not have edit privileges on the sample type`);
              }
              return res.json(payload);

          })
          .catch(err => {
              sails.log.error(err);
              return co.error(err);
          });
    }

};
