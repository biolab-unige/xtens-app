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
const PrivilegesError = require('xtens-utils').Errors.PrivilegesError;
const NonexistentResourceError = require('xtens-utils').Errors.NonexistentResourceError;
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

        DataTypeService.getDataTypePrivilegeLevel(operator.id, subject.type).then(dataTypePrivilege => {

            if (!dataTypePrivilege || _.isEmpty(dataTypePrivilege) || dataTypePrivilege.privilegeLevel != EDIT) {
                throw new PrivilegesError(`Authenticated user does not have edit privileges on the subject type ${subject.type}`);
            } else {
                return DataType.findOne(subject.type);
            }
        })
        .then(subjectType => {
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
        let subject;
        query = QueryService.populateRequest(query, req, { blacklist: ['personalInfo'] });

        if (operator.canAccessPersonalData) {
            query.populate('personalInfo');
        }

        query.then(result => {
            if (!result) {
                return {};
            }
            subject = result;
            const idDataType = _.isObject(subject.type) ? subject.type.id : subject.type;

            //retrieve dataTypePrivilege
            return DataTypeService.getDataTypePrivilegeLevel(operator.id, idDataType);
        })
        .then(dataTypePrivilege => {
            //filter Out Metadata if operator has not the privilege
            if (!dataTypePrivilege || _.isEmpty(dataTypePrivilege)){ return {};}
            else if( dataTypePrivilege.privilegeLevel === VIEW_OVERVIEW) { subject.metadata = {}; }

            if( operator.canAccessSensitiveData || _.isEmpty(subject.metadata) ){ return subject; }
            //filter Out Sensitive Info if operator can not access to Sensitive Data
            return DataService.filterOutSensitiveInfo(subject, operator.canAccessSensitiveData);
        })
        .then(filteredSubject => {
            return res.json(filteredSubject);
        })
        .catch(error => {
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
        let subjects = [], arrPrivileges = [], dataTypesId;
        let query = Subject.find(QueryService.parseSelect(req))
        .where(QueryService.parseCriteria(req))
        .limit(QueryService.parseLimit(req))
        .skip(QueryService.parseSkip(req))
        .sort(QueryService.parseSort(req));

        query = QueryService.populateRequest(query, req, { blacklist: ['personalInfo'] });

        if (operator.canAccessPersonalData) {
            query.populate('personalInfo');
        }

        query.then(results => {
            if (!results || _.isEmpty(results)) {
                return [];
            }
            subjects = results;

          //retrieve dataType id
            dataTypesId = _.isObject(subjects[0].type) ? _.uniq(_.pluck(_.pluck(subjects, 'type'), 'id')) : _.uniq(_.pluck(subjects, 'type'));

            return DataTypeService.getDataTypePrivilegeLevel(operator.id, dataTypesId);

        }).then(privileges => {

            _.isArray(privileges) ? arrPrivileges = privileges : arrPrivileges[0] = privileges;
            //filter Out Metadata if operator has not at least a privilege on Data or exists at least a VIEW_OVERVIEW privilege level
            if (!arrPrivileges || _.isEmpty(arrPrivileges) ) {
                return [];
            }
            else if( arrPrivileges.length < dataTypesId.length ||
                  (arrPrivileges.length === dataTypesId.length && _.find(arrPrivileges, { privilegeLevel: VIEW_OVERVIEW }))) {

                  // check for each datum if operator has the privilege to view details. If not metadata object is cleaned
                let index = 0, arrDtPrivId = arrPrivileges.map(e => { return e.dataType; });
                for ( let i = subjects.length - 1; i >= 0; i-- ) {
                    const idDataType = _.isObject(subjects[i].type) ? subjects[i].type.id : subjects[i].type;
                    index = arrDtPrivId.indexOf(idDataType);
                    if( index < 0 ){ subjects.splice(i, 1); }
                    else if (arrPrivileges[index].privilegeLevel === VIEW_OVERVIEW) { subjects[i].metadata = {}; }
                }
            }
            if( operator.canAccessSensitiveData ) { return subjects; }

                  //filter Out Sensitive Info if operator can not access to Sensitive Data
            return DataService.filterOutSensitiveInfo(subjects, operator.canAccessSensitiveData);

        }).then(data => {
            return res.json(data);
        })
        .catch(err => {
            sails.log.error(err);
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
        DataService.hasDataSensitive(subject.id, SUBJECT).then(result => {

            if (result.hasDataSensitive && !operator.canAccessSensitiveData) {
                throw new PrivilegesError(`"Authenticated user is not allowed to modify sensitive data"`);
            }
            //retrieve dataType id
            const idDataType = _.isObject(subject.type) ? subject.type.id : subject.type;
            return DataTypeService.getDataTypePrivilegeLevel(operator.id, idDataType);

        })
        .then(dataTypePrivilege => {

            if (!dataTypePrivilege || dataTypePrivilege.privilegeLevel != EDIT) {
                throw new PrivilegesError(`Authenticated user does not have edit privileges on the subject type ${subject.type}`);
            }
            SubjectService.simplify(subject);

            return DataType.findOne(subject.type);

        })
        .then(dataType => {
            const validationRes = SubjectService.validate(subject, true, dataType);
            if (validationRes.error === null) {
                subject = validationRes.value;
                return crudManager.updateSubject(subject, dataType.name);
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
     * DELETE /subject/:id
     * @method
     * @name destroy
     * @description
     */
    destroy: function(req, res) {
        const co = new ControllerOut(res);
        const id = req.param('id');
        const operator = TokenService.getToken(req);
        let subject;

        if (!id) {
            return co.badRequest({message: 'Missing subject ID on DELETE request'});
        }

        Subject.findOne({ id: id }).then(result => {
            if (!result) {
                throw new NonexistentResourceError("Missing Resource");
            }
            subject = result;
            //retrieve dataType id
            const idDataType = _.isObject(subject.type) ? subject.type.id : subject.type;

            return DataTypeService.getDataTypePrivilegeLevel(operator.id, idDataType);
        })
        .then(dataTypePrivilege => {

            if (!dataTypePrivilege || dataTypePrivilege.privilegeLevel != EDIT) {
                throw new PrivilegesError(`Authenticated user does not have edit privileges on the subject type ${subject.type}`);
            }

            sails.log.info(`Subject to be deleted:  ${subject.data}`);

            return crudManager.deleteSubject(id);
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
     * @description retrieve all required models for editing/creating a Subject via client web-form
     */
    edit: function(req, res) {
        const co = new ControllerOut(res);
        const id = req.param("id"), code = req.param("code");
        const operator = TokenService.getToken(req);
        let payload;

        sails.log.info("SubjectController.edit - Decoded ID is: " + operator.id);

        return BluebirdPromise.props({
            projects: Project.find(),
            subject: SubjectService.getOneAsync(id, code),
            dataTypes: crudManager.getDataTypesByRolePrivileges({
                idOperator: operator.id,
                model: SUBJECT,
                privilegeLevel: EDIT
            })
        })
        .then(results => {
            payload = results;
            // sails.log.info(payload);

            if (results.subject) {
                const idDataTypes = _.isObject(results.subject.type) ? results.subject.type.id : results.subject.type;
                return DataService.hasDataSensitive(results.subject.id, SUBJECT);
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
            if (payload.subject && (_.isEmpty(payload.dataTypes) || !_.find(payload.dataTypes, {id : payload.subject.type.id}))) {
                throw new PrivilegesError(`Authenticated user does not have edit privileges on the subject type`);
            }
            return res.json(payload);

        })
        .catch(err => {
            sails.log.error(err);
            return co.error(err);
        });

    },


    /**
     * @method
     * @name createGraph
     * @description generate and visualize the (nested/multi level) data graph for a given subject.
     *              Note: The current limit for the number of instances is 100.
     */
    createGraph:function(req,res) {
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
