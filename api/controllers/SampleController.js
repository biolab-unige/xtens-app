/**
 * SampleController
 *
 * @description :: Server-side logic for managing samples
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */
/* jshint node: true */
/* globals _, sails, Subject, Sample, Data, DataType, SubjectService, BiobankService, SampleService, TokenService, QueryService, DataService, DataTypeService */
"use strict";

const BluebirdPromise = require('bluebird');
const ControllerOut = require("xtens-utils").ControllerOut;
const crudManager = sails.hooks.persistence.crudManager;
const ValidationError = require('xtens-utils').Errors.ValidationError;
const xtensConf = global.sails.config.xtens;
const SAMPLE = xtensConf.constants.DataTypeClasses.SAMPLE;
const DATA = xtensConf.constants.DataTypeClasses.DATA;
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
                return co.forbidden();
            }
            else {
                SampleService.simplify(sample);

                DataType.findOne(sample.type)
        .then(function(sampleType) {
            const validationRes = SampleService.validate(sample, true, sampleType);
            if (validationRes.error === null) {
                sample = validationRes.value;
                const sampleTypeName = sampleType && sampleType.name;
                return crudManager.createSample(sample, sampleTypeName);
            }
            else {
                throw new ValidationError(validationRes.error);
            }
        })

        .then(function(result) {
            console.log(result);
            res.set('Location', req.baseUrl + req.url + '/'  + result.id);
            return res.json(201, result);
        })
        .catch(function(error) {
            console.log(error.message);
            return co.error(error);
        });
            }
        });
    },

    /**
     * GET /sample/:id
     * @method
     * @name findOne
     * @description - retrieve an existing subject
     */
    findOne: function(req, res) {
        const co = new ControllerOut(res);
        const id = req.param('id');
        const operator = TokenService.getToken(req);
        let sample = {};
        let query = Sample.findOne(id);

        query = QueryService.populateRequest(query, req);

        query.then(function(result) {
            sample = result;

            const idDataType = _.isObject(sample.type) ? sample.type.id : sample.type;
          //retrieve dataTypePrivilege
            DataTypeService.getDataTypePrivilegeLevel(operator.id, idDataType).then(function(dataTypePrivilege) {

            //filter Out Metadata if operator has not the privilege
                if (!dataTypePrivilege || _.isEmpty(dataTypePrivilege) ){ return res.json({});}
                else if( dataTypePrivilege.privilegeLevel === VIEW_OVERVIEW) { sample.metadata = {}; }

                if( operator.canAccessSensitiveData || _.isEmpty(sample.metadata) ){ return res.json(sample); }
              //filter Out Sensitive Info if operator can not access to Sensitive Data
                DataService.filterOutSensitiveInfo(sample, operator.canAccessSensitiveData).then(function(sampleFiltered) {
                    return res.json(sampleFiltered);
                });
            });
        })
        .catch(function(error) {
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
        let samples = [], arrPrivileges = [];
        let query = Sample.find()
        .where(QueryService.parseCriteria(req))
        .limit(QueryService.parseLimit(req))
        .skip(QueryService.parseSkip(req))
        .sort(QueryService.parseSort(req));

        query = QueryService.populateRequest(query, req);

        query.then(function(results) {
            samples = results;

          //retrieve dataType id
            const dataTypesId = _.isObject(samples.type) ? _.uniq(_.pluck(_.pluck(samples, 'type'), 'id')) : _.uniq(_.pluck(samples, 'type'));

            DataTypeService.getDataTypePrivilegeLevel(operator.id, dataTypesId).then(function(privileges) {

                _.isArray(privileges) ? arrPrivileges = privileges : arrPrivileges[0] = privileges;
            //filter Out Metadata if operator has not at least a privilege on Data or exists at least a VIEW_OVERVIEW privilege level
                if (!arrPrivileges || _.isEmpty(arrPrivileges) ){ return res.json({});}
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
                if( operator.canAccessSensitiveData ){ return res.json(samples); }
                //filter Out Sensitive Info if operator can not access to Sensitive Data
                DataService.filterOutSensitiveInfo(samples, operator.canAccessSensitiveData).then(function(samplesFiltered) {
                    return res.json(samplesFiltered);
                });
            });
        })
        .catch(function(err) {
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
                return co.forbidden();
            }
        //retrieve dataType id
            const idDataType = _.isObject(sample.type) ? sample.type.id : sample.type;
            DataTypeService.getDataTypePrivilegeLevel(operator.id, idDataType).then(function(dataTypePrivilege) {

                if (!dataTypePrivilege || dataTypePrivilege.privilegeLevel != EDIT) {
                    return co.forbidden();
                }

                SampleService.simplify(sample);

                DataType.findOne(sample.type).then(function(dataType) {
                    const validationRes = SampleService.validate(sample, true, dataType);
                    if (validationRes.error === null) {
                        sample = validationRes.value;
                        return crudManager.updateSample(sample, dataType.name);
                    }
                    else {
                        throw new ValidationError(validationRes.error);
                    }
                })
                  .then(function(result) {
                      return res.json(result);
                  })
                    .catch(function(error) {
                        console.log(error.message);
                        return co.error(error);
                    });
            });
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

        if (!id) {
            return co.badRequest({ message: 'Missing sample ID on DELETE request' });
        }

        Sample.findOne({ id: id })

        .then(function(result) {
            if(!result){ return res.json(200, { deleted: 0 }); }
          //retrieve dataType id
            const idDataType = _.isObject(result.type) ? result.type.id : result.type;

            DataTypeService.getDataTypePrivilegeLevel(operator.id, idDataType).then(function(dataTypePrivilege) {

                if (!dataTypePrivilege || dataTypePrivilege.privilegeLevel != EDIT) {
                    return co.forbidden();
                }
                sails.log.info(`Data to be deleted:  ${result.data}`);

                return crudManager.deleteSample(id)

                .then(function(deleted) {
                    return res.json(200, {
                        deleted: deleted
                    });
                })
                .catch(function(err) {
                    return co.error(err);
                });
            });
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

        BluebirdPromise.props({
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
          .then(function(results) {
              if(results.sample){
                  const idDataTypes = _.isObject(results.sample.type) ? results.sample.type.id : results.sample.type;

                  DataService.hasDataSensitive(results.sample.id, DATA).then(function(r) {
                    //if operator has not access to Sensitive Data and dataType has Data Sensitive, or
                    // operator has not the privilege to EDIT datatype, then return forbidden
                      if ((r.hasDataSensitive && !operator.canAccessSensitiveData)
                        || _.isEmpty(results.dataTypes) || !_.find(results.dataTypes, {name : results.sample.type.name})  ){
                          return co.forbidden();
                      }
                      return res.json(results);
                  });}
              else {
                //if operator has not the privilege to EDIT datatype, then return forbidden
                  if (_.isEmpty(results.dataTypes)){ return co.forbidden(); }
                  return res.json(results);}
          })
            .catch(function(err) {
                return co.error(err);
            });
    }

};
