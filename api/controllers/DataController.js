/**
 * DataController
 *
 * @description :: Server-side logic for managing data
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */
/* jshint node: true */
/* globals _, sails, Data, DataType, DataService, DataTypeService, SubjectService, SampleService, QueryService, TokenService */
"use strict";

const BluebirdPromise = require('bluebird');
const ControllerOut = require("xtens-utils").ControllerOut;
const ValidationError = require('xtens-utils').Errors.ValidationError;
const xtensConf = global.sails.config.xtens;
const crudManager = sails.hooks.persistence.crudManager;
const DATA = xtensConf.constants.DataTypeClasses.DATA;
const VIEW_OVERVIEW = xtensConf.constants.DataTypePrivilegeLevels.VIEW_OVERVIEW;
const EDIT = xtensConf.constants.DataTypePrivilegeLevels.EDIT;

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
        const co = new ControllerOut(res);
        const operator = TokenService.getToken(req);

        DataTypeService.getDataTypePrivilegeLevel(operator.id, data.type).then(function(dataTypePrivilege) {

            if (!dataTypePrivilege || _.isEmpty(dataTypePrivilege) || dataTypePrivilege.privilegeLevel != EDIT) {
                return co.forbidden();
            }
            else {
                sails.log("DataController.create - here we are!!");
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

          .then(function(result) {
              res.set('Location', req.baseUrl + req.url + '/' + result.id);
              return res.json(201, result);
          })
          .catch(function(error) {
              sails.log.error(error.message);
              return co.error(error);
          });
            }
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
        let data = {};
        let query = Data.findOne(id);

        query = QueryService.populateRequest(query, req);

        query.then(function(result) {
            if (!result) {
                return res.json(result);
            }
            data = result;

            const idDataType = _.isObject(data.type) ? data.type.id : data.type;
            //retrieve dataTypePrivilege
            DataTypeService.getDataTypePrivilegeLevel(operator.id, idDataType).then(function(dataTypePrivilege) {

              //filter Out Metadata if operator has not the privilege
                if (!dataTypePrivilege || _.isEmpty(dataTypePrivilege) ){ return res.json({});}
                else if( dataTypePrivilege.privilegeLevel === VIEW_OVERVIEW) { data.metadata = {}; }

                if( operator.canAccessSensitiveData || _.isEmpty(data.metadata) ){ return res.json(data); }
                //filter Out Sensitive Info if operator can not access to Sensitive Data
                DataService.filterOutSensitiveInfo(data, operator.canAccessSensitiveData).then(function(dataFiltered) {
                    console.log(dataFiltered);
                    return res.json(dataFiltered);
                });

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
        let data = [], arrPrivileges = [];
        let query = Data.find()
      .where(QueryService.parseCriteria(req))
      .limit(QueryService.parseLimit(req))
      .skip(QueryService.parseSkip(req))
      .sort(QueryService.parseSort(req));

        query = QueryService.populateRequest(query, req);

        query.then(function(result) {
            data = result;

            //retrieve dataType id
            const dataTypesId = _.isObject(data.type) ? _.uniq(_.pluck(_.pluck(data, 'type'), 'id')) : _.uniq(_.pluck(data, 'type'));

            DataTypeService.getDataTypePrivilegeLevel(operator.id, dataTypesId).then(function(privileges) {

                _.isArray(privileges) ? arrPrivileges = privileges : arrPrivileges[0] = privileges;
              //filter Out Metadata if operator has not at least a privilege on Data or exists at least a VIEW_OVERVIEW privilege level
                if (!arrPrivileges || _.isEmpty(arrPrivileges) ){ return res.json({});}
                else if( arrPrivileges.length < dataTypesId.length ||
                    (arrPrivileges.length === dataTypesId.length && _.find(arrPrivileges, { privilegeLevel: VIEW_OVERVIEW }))) {

                    // check for each datum if operator has the privilege to view details. If not metadata object is cleaned
                    let index = 0, arrDtPrivId = arrPrivileges.map(function(e) { return e.dataType; });
                    for ( let i = data.length - 1; i >= 0; i-- ) {
                        let idDataType = _.isObject(data[i].type) ? data[i].type.id : data[i].type;
                        index = arrDtPrivId.indexOf(idDataType);
                        if( index < 0 ){ data.splice(i,1); }
                        else if (arrPrivileges[index].privilegeLevel === VIEW_OVERVIEW) { data[i].metadata = {}; }
                    }
                }
                if( operator.canAccessSensitiveData ){ return res.json(data); }
                  //filter Out Sensitive Info if operator can not access to Sensitive Data
                DataService.filterOutSensitiveInfo(data, operator.canAccessSensitiveData).then(function(dataFiltered) {
                    console.log(dataFiltered);
                    return res.json(dataFiltered);
                });

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
        console.log(data);
        const co = new ControllerOut(res);
        const operator = TokenService.getToken(req);

        DataService.hasDataSensitive(data.id, DATA).then(function(result) {

            if (result.hasDataSensitive && !operator.canAccessSensitiveData) {
                return co.forbidden();
            }
        //retrieve dataType id
            const idDataType = _.isObject(data.type) ? data.type.id : data.type;
            DataTypeService.getDataTypePrivilegeLevel(operator.id, idDataType).then(function(dataTypePrivilege) {

                if (!dataTypePrivilege || dataTypePrivilege.privilegeLevel != EDIT) {
                    return co.forbidden();
                }

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
                })
                  .then(function(result) {
                      sails.log(result);
                      return res.json(result);
                  })
                    .catch(function(error) {
                        sails.log.error(error.message);
                        return co.error(error);
                    });
            });
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

        if (!id) {
            return co.badRequest({ message: 'Missing data ID on DELETE request' });
        }

        Data.findOne({ id: id })

        .then(function(result) {
            if(!result){ return res.json(200, { deleted: 0 }); }
          //retrieve dataType id
            const idDataType = _.isObject(result.type) ? result.type.id : result.type;

            DataTypeService.getDataTypePrivilegeLevel(operator.id, idDataType).then(function(dataTypePrivilege) {

                if (!dataTypePrivilege || dataTypePrivilege.privilegeLevel != EDIT) {
                    return co.forbidden();
                }
                sails.log.info(`Data to be deleted:  ${result.data}`);

                return crudManager.deleteData(id)

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
   * @description retrieve all required information to create an EditData form
   */

    edit: function(req, res) {
        const co = new ControllerOut(res);
        const params = req.allParams();
        const operator = TokenService.getToken(req);

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
            .then(function(results) {
                if(results.data){
                    const idDataTypes = _.isObject(results.data.type) ? results.data.type.id : results.data.type;

                    DataService.hasDataSensitive(results.data.id, DATA).then(function(r) {
                      //if operator has not access to Sensitive Data and dataType has Data Sensitive, or
                      // operator has not the privilege to EDIT datatype, then return forbidden
                        if ((r.hasDataSensitive && !operator.canAccessSensitiveData)
                          || _.isEmpty(results.dataTypes) || !_.find(results.dataTypes, {name : results.data.type.name})  ){
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
