/**
 * SubjectController
 * @author      :: Massimiliano Izzo
 * @description :: Server-side logic for managing subjects
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */
/* jshint node: true */
/* globals _, __filename__, sails, Project, Subject, Data, DataType, SubjectService, TokenService, QueryService, DataService, DataTypeService, SampleService */
"use strict";

const ControllerOut = require("xtens-utils").ControllerOut;
const crudManager = sails.hooks.persistence.crudManager;
const BluebirdPromise = require('bluebird');
const ValidationError = require('xtens-utils').Errors.ValidationError;
const xtensConf = global.sails.config.xtens;
const SUBJECT = xtensConf.constants.DataTypeClasses.SUBJECT;
const DATA = xtensConf.constants.DataTypeClasses.DATA;
const VIEW_OVERVIEW = xtensConf.constants.DataTypePrivilegeLevels.VIEW_OVERVIEW;
const EDIT = xtensConf.constants.DataTypePrivilegeLevels.EDIT;
module.exports = {

    /**
     *  POST /subject
     *  @method
     *  @name create
     *  @description:  create a new subject; transaction-safe implementation
     */
    create: function(req, res) {
        let subject = req.allParams();
        const co = new ControllerOut(res);
        const operator = TokenService.getToken(req);

        DataTypeService.getDataTypePrivilegeLevel(operator.id, subject.type).then(function(dataTypePrivilege) {

            if (!dataTypePrivilege || _.isEmpty(dataTypePrivilege) || dataTypePrivilege.privilegeLevel != EDIT) {
                return co.forbidden();
            } else {
                DataType.findOne(subject.type)
        .then(function(subjectType) {
            let validationRes = SubjectService.validate(subject, true, subjectType);
            if (validationRes.error === null) {
                subject = validationRes.value;
                const subjectTypeName = subjectType && subjectType.name;
                return crudManager.createSubject(subject, subjectTypeName);
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
            console.log("SubjectController.create: " + error.message);
            return co.error(error);
        });
            }
        });
    },

    /**
     * GET /subject/:id
     * @method
     * @name findOne
     * @description - retrieve an existing subject
     */
    findOne: function(req, res) {
        const co = new ControllerOut(res);
        const id = req.param('id');
        const operator = TokenService.getToken(req);
        let query = Subject.findOne(id);
        let subject = {};
        query = QueryService.populateRequest(query, req, { blacklist: ['personalInfo'] });

        if (operator.canAccessPersonalData) {
            query.populate('personalInfo');
        }

        query.then(function(result) {
            subject = result;
            const idDataType = _.isObject(subject.type) ? subject.type.id : subject.type;
          //retrieve dataTypePrivilege
            DataTypeService.getDataTypePrivilegeLevel(operator.id, idDataType).then(function(dataTypePrivilege) {

            //filter Out Metadata if operator has not the privilege
                if (!dataTypePrivilege || _.isEmpty(dataTypePrivilege)){ return res.json({});}
                else if( dataTypePrivilege.privilegeLevel === VIEW_OVERVIEW) { subject.metadata = {}; }

                if( operator.canAccessSensitiveData || _.isEmpty(subject.metadata) ){ return res.json(subject); }
                DataService.filterOutSensitiveInfo(subject, operator.canAccessSensitiveData).then(function(subjectFiltered) {
                    return res.json(subjectFiltered);
                });

            });
        })
        .catch(function(error) {
            return co.error(error);
        });

    },

    /**
     * GET /subject
     * GET /subject/find
     *
     * @method
     * @name find
     * @description Find samples based on criteria provided in the request
     */
    find: function(req, res) {
        const co = new ControllerOut(res);
        const operator = TokenService.getToken(req);
        let subjects = [], arrPrivileges = [];
        let query = Subject.find(QueryService.parseSelect(req))
        .where(QueryService.parseCriteria(req))
        .limit(QueryService.parseLimit(req))
        .skip(QueryService.parseSkip(req))
        .sort(QueryService.parseSort(req));

        query = QueryService.populateRequest(query, req, { blacklist: ['personalInfo'] });

        if (operator.canAccessPersonalData) {
            query.populate('personalInfo');
        }

        query.then(function(results) {
            subjects = results;

          //retrieve dataType id
            const dataTypesId = _.isObject(subjects.type) ? _.uniq(_.pluck(_.pluck(subjects, 'type'), 'id')) : _.uniq(_.pluck(subjects, 'type'));

            DataTypeService.getDataTypePrivilegeLevel(operator.id, dataTypesId).then(function(privileges) {

                _.isArray(privileges) ? arrPrivileges = privileges : arrPrivileges[0] = privileges;
            //filter Out Metadata if operator has not at least a privilege on Data or exists at least a VIEW_OVERVIEW privilege level
                if (!arrPrivileges || _.isEmpty(arrPrivileges) ){ return res.json({});}
                else if( arrPrivileges.length < dataTypesId.length ||
                  (arrPrivileges.length === dataTypesId.length && _.find(arrPrivileges, { privilegeLevel: VIEW_OVERVIEW }))) {

                  // check for each datum if operator has the privilege to view details. If not metadata object is cleaned
                    let index = 0, arrDtPrivId = arrPrivileges.map(function(e) { return e.dataType; });
                    for ( let i = subjects.length - 1; i >= 0; i-- ) {
                        let idDataType = _.isObject(subjects[i].type) ? subjects[i].type.id : subjects[i].type;
                        index = arrDtPrivId.indexOf(idDataType);
                        if( index < 0 ){ subjects.splice(i,1); }
                        else if (arrPrivileges[index].privilegeLevel === VIEW_OVERVIEW) { subjects[i].metadata = {}; }
                    }
                }
                if( operator.canAccessSensitiveData ) { return res.json(subjects); }
                  //filter Out Sensitive Info if operator can not access to Sensitive Data
                DataService.filterOutSensitiveInfo(subjects, operator.canAccessSensitiveData).then(function(data) {
                    return res.json(data);
                });
            });
        })
        .catch(function(err) {
            return co.error(err);
        });
    },

    /**
     * PUT /subject/:id
     * @method
     * @name update
     * @description - update an existing subject.
     *              Transaction-safe implementation
     */
    update: function(req, res) {
        let subject = req.allParams();
        const co = new ControllerOut(res);
        const operator = TokenService.getToken(req);
        DataService.hasDataSensitive(subject.id, SUBJECT).then(function(result) {

            if (result.hasDataSensitive && !operator.canAccessSensitiveData) {
                return co.forbidden();
            }
        //retrieve dataType id
            const idDataType = _.isObject(subject.type) ? subject.type.id : subject.type;
            DataTypeService.getDataTypePrivilegeLevel(operator.id, idDataType).then(function(dataTypePrivilege) {

                if (!dataTypePrivilege || dataTypePrivilege.privilegeLevel != EDIT) {
                    return co.forbidden();
                }
                SubjectService.simplify(subject);

                DataType.findOne(subject.type).then(function(dataType) {
                    const validationRes = SubjectService.validate(subject, true, dataType);
                    if (validationRes.error === null) {
                        subject = validationRes.value;
                        return crudManager.updateSubject(subject, dataType.name);
                    }
                    else {
                        throw new ValidationError(validationRes.error);
                    }
                })
                  .then(function(result) {
                      console.log(result);
                      res.set('Location', req.baseUrl + req.url + '/'  + result.id);
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
     * DELETE /subject/:id
     * @method
     * @name destroy
     * @description
     */
    destroy: function(req, res) {
        const co = new ControllerOut(res);
        const id = req.param('id');
        const operator = TokenService.getToken(req);

        if (!id) {
            return co.badRequest({message: 'Missing subject ID on DELETE request'});
        }

        Subject.findOne({ id: id })

        .then(function(result) {
            if(!result){ return res.json(200, { deleted: 0 }); }
          //retrieve dataType id
            const idDataType = _.isObject(result.type) ? result.type.id : result.type;

            DataTypeService.getDataTypePrivilegeLevel(operator.id, idDataType).then(function(dataTypePrivilege) {

                if (!dataTypePrivilege || dataTypePrivilege.privilegeLevel != EDIT) {
                    return co.forbidden();
                }

                sails.log.info(`Subject to be deleted:  ${result.data}`);

                return crudManager.deleteSubject(id)

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
     * @description retrieve all required models for editing/creating a Subject via client web-form
     */
    edit: function(req, res) {
        const co = new ControllerOut(res);
        const id = req.param("id"), code = req.param("code");
        const operator = TokenService.getToken(req);

        console.log("SubjectController.edit - Decoded ID is: " + operator.id);

        return BluebirdPromise.props({
            projects: Project.find(),
            subject: SubjectService.getOneAsync(id, code),
            dataTypes: crudManager.getDataTypesByRolePrivileges({
                idOperator: operator.id,
                model: SUBJECT,
                privilegeLevel: EDIT
            })
        })
      .then(function(results) {
          if(results.subject){
              const idDataTypes = _.isObject(results.subject.type) ? results.subject.type.id : results.subject.type;

              DataService.hasDataSensitive(results.subject.id, SUBJECT).then(function(r) {
                //if operator has not access to Sensitive Data and dataType has Data Sensitive, or
                // operator has not the privilege to EDIT datatype, then return forbidden
                  if ((r.dataSensitive.hasDataSensitive && !operator.canAccessSensitiveData)
                    || _.isEmpty(results.dataTypes) || !_.find(results.dataTypes, {name : results.subject.name})  ){
                      return co.forbidden();
                  }
                  return res.json(results);
              });}
          else {
            //if operator has not the privilege to EDIT datatype, then return forbidden
              if (_.isEmpty(results.dataTypes)){ return co.forbidden(); }
              return res.json(results); }
      })
      .catch(function(err) {
          return co.error(err);
      });

    },


    /**
     * @method
     * @name createGraph
     * @description generate and visualize the (nested/multi level) data graph for a given subject.
     *              Note: The current limit for the number of instances is 100.
     */
    createGraph:function(req,res){
        const co = new ControllerOut(res);
        const idSubject = req.param("idPatient");
        const fetchSubjectDataTree = sails.config.xtens.databaseManager.recursiveQueries.fetchSubjectDataTree;

        function subjectTreeCb(err, resp) {

            if (err){
                console.log(err);
            }

            else {
                console.log(resp.rows);
                let links = [];
                BluebirdPromise.map(resp.rows, function(row) {

                    if (row.parent_data !== null) {
                        return {'source':row.parent_data,'target':row.id,'name':row.id,'type':row.type,'metadata':row.metadata};
                    }
                    else if(row.parent_sample !== null) {
                        return {'source':row.parent_sample,'target':row.id,'name':row.id,'type':row.type,'metadata':row.metadata};
                    }
                    else {
                        return {'source':'Patient','target':row.id,'name':row.id,'type':row.type,'metadata':row.metadata};
                    }

                })
                .then(function(link){

                    console.log(link);
                    links = link;
                    let json = {'links':links};
                    return res.json(json);


                })
                .catch(function(err){
                    console.log(err);
                    return co.error(err);
                });
            }
        }

        fetchSubjectDataTree(idSubject, subjectTreeCb);

    },
    /**
     * @method
     * @name createGraphSimple
     * @description generate and visualize the patient's data graph. All the descendant data are shown as children.
     *              Only one data instance per datatype is shown.
     * @deprecated
     *
     */
    createGraphSimple: function(req,res){
        let co = new ControllerOut(res);
        let fetchSubjectDataTreeSimple = sails.config.xtens.databaseManager.recursiveQueries.fetchSubjectDataTreeSimple;
        let idSubject = req.param("idPatient");
        console.log(idSubject);

        function subjectTreeSimpleCb(err,resp) {

            let children = [], child, links = [];

            console.log(resp);

            if (resp.rows.length === 0) {
                links = [{
                    'source': 'Patient',
                    'target': null
                }];
                // let json = {'links':links};
                return res.json({links: links});
            }

            for(let i = 0; i<resp.rows.length; i++) {
                children.push(resp.rows[i].id);
            }

            console.log(children);

            BluebirdPromise.map(children,function(child){

                let childName;
                return DataType.findOne(child).then(function(dataType){
                    childName = dataType.name;
                    console.log(childName);
                    return {'source':'Patient','target':childName};
                });

            })

            .then(function(link){
                console.log(link);
                links = link;
                let json = {'links':links};
                console.log(json);
                return res.json(json);

            })

            .catch(function(err){
                return co.error(err);
            });

        }

        fetchSubjectDataTreeSimple(idSubject, subjectTreeSimpleCb);
    }
};
