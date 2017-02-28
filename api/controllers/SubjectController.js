/**
 * SubjectController
 * @author      :: Massimiliano Izzo
 * @description :: Server-side logic for managing subjects
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */
/* jshint node: true */
/* globals _, sails, Project, DataTypePrivileges, Subject, DataType, SubjectService, TokenService, QueryService, DataService, DataTypeService */
"use strict";

const ControllerOut = require("xtens-utils").ControllerOut;
const crudManager = sails.hooks.persistence.crudManager;
const BluebirdPromise = require('bluebird');
const ValidationError = require('xtens-utils').Errors.ValidationError;
const PrivilegesError = require('xtens-utils').Errors.PrivilegesError;
const NonexistentResourceError = require('xtens-utils').Errors.NonexistentResourceError;
const xtensConf = global.sails.config.xtens;
const SUBJECT = xtensConf.constants.DataTypeClasses.SUBJECT;
const VIEW_OVERVIEW = xtensConf.constants.DataTypePrivilegeLevels.VIEW_OVERVIEW;
const EDIT = xtensConf.constants.DataTypePrivilegeLevels.EDIT;
const actionUtil = require('sails/lib/hooks/blueprints/actionUtil');
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
        query = actionUtil.populateRequest(query, req, { blacklist:  ['personalInfo']});

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
        let subjects = [], dataTypesId, allPrivileges;

        return DataTypePrivileges.find({group:operator.groups[0]}).then(results =>{
            allPrivileges = results;
            let query = QueryService.composeFind(req, { blacklist: ['personalInfo'] }, allPrivileges);
            if (operator.canAccessPersonalData) {
                query.populate('personalInfo');
            }
            return query;
        })
        .then(results => {
            // if (!results || _.isEmpty(results)) {
            //     return [];
            // }
            subjects = results;

            //retrieve dataTypes id and Privileges id
            dataTypesId = !_.isEmpty(subjects) ? _.isObject(subjects[0].type) ? _.uniq(_.map(_.map(subjects, 'type'), 'id')) : _.uniq(_.map(subjects, 'type')) : [];

            let arrDtPrivId = allPrivileges.map(el => el.dataType);
            let pagePrivileges = _.intersection(arrDtPrivId, dataTypesId);
        //     return DataTypeService.getDataTypePrivilegeLevel(operator.id, dataTypesId);
        //
        // }).then(pagePrivileges => {

            return BluebirdPromise.all([
                DataService.filterListByPrivileges(subjects, dataTypesId, pagePrivileges, operator.canAccessSensitiveData),
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
                throw new PrivilegesError(`Authenticated user is not allowed to modify sensitive data`);
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

            //if operator has not the privilege to EDIT datatype, then return forbidden
            if (_.isEmpty(results.dataTypes)) {
                throw new PrivilegesError(`Authenticated user does not have edit privileges on any subject type`);
            }

            if (results.subject) {
                // const idDataTypes = _.isObject(results.subject.type) ? results.subject.type.id : results.subject.type;
                return DataService.hasDataSensitive(results.subject.id, SUBJECT);
            }

        })
        .then(sensitiveRes => {

            // sails.log.info(sensitiveRes);
            // operator has not the privilege to EDIT datatype, then throw Privileges Error
            if (payload.subject && (_.isEmpty(payload.dataTypes) || !_.find(payload.dataTypes, {id : payload.subject.type.id}))) {
                throw new PrivilegesError(`Authenticated user does not have edit privileges on the subject type`);
            }
            // if operator has not access to Sensitive Data and dataType has sensitive data, then return forbidden
            if (sensitiveRes && ((sensitiveRes.hasDataSensitive && !operator.canAccessSensitiveData))) {
                throw new PrivilegesError("Authenticated user is not allowed to edit sensitive data");
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
        const fetchSubjectDataTree = sails.hooks['persistence'].getDatabaseManager().recursiveQueries.fetchSubjectDataTree;
        const operator = TokenService.getToken(req);
        let dataTypePrivileges;

        return DataTypePrivileges.find({ group: operator.groups[0] }).populate('dataType')
        .then(results => {

            dataTypePrivileges = results;
            // operator has not the privilege to EDIT datatype, then throw Privileges Error
            if (_.isEmpty(dataTypePrivileges)) {
                throw new PrivilegesError(`Authenticated user does not have privileges`);
            }
            return fetchSubjectDataTree(idSubject, subjectTreeCb);

        })
        .catch(err => {
            sails.log.error(err);
            return co.error(err);
        });

        function subjectTreeCb(err, resp) {
          /*istanbul ignore if*/
            if (err){
                sails.log.error(err);
                return co.error(err);
            }

            else {
                let links = [];

                BluebirdPromise.map(resp.rows, function(row) {
                    let privilege;
                    if(_.find(dataTypePrivileges, function (d) {
                        privilege = d;
                        return privilege.dataType.name === row.type;
                    })){
                        if(privilege.privilegeLevel === VIEW_OVERVIEW){ row.metadata = {};}
                        if (row.parent_data !== null) {
                            return {'source':row.parent_data,'target':row.id,'name':row.id,'type':row.type,'metadata':row.metadata};
                        }
                        else if(row.parent_sample !== null) {
                            return {'source':row.parent_sample,'target':row.id,'name':row.id,'type':row.type,'metadata':row.metadata};
                        }
                        else {
                            return {'source':'Patient','target':row.id,'name':row.id,'type':row.type,'metadata':row.metadata};
                        }
                    }

                })
                .then(function(link){

                    links = _.reject(link, function(l){ return l === undefined; });
                    let json = {'links':links};
                    return res.json(json);
                })
                .catch(function(err){
                    sails.log(err);
                    return co.error(err);
                });
            }
        }


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
        const co = new ControllerOut(res);
        const fetchSubjectDataTreeSimple = sails.hooks['persistence'].getDatabaseManager().recursiveQueries.fetchSubjectDataTreeSimple;
        const idSubject = req.param("idPatient");
        const operator = TokenService.getToken(req);
        let dataTypePrivileges;

        return DataTypePrivileges.find({ group: operator.groups[0] }).populate('dataType')
        .then(results => {

            dataTypePrivileges = results;
            // operator has not the privilege to EDIT datatype, then throw Privileges Error
            if (_.isEmpty(dataTypePrivileges)) {
                throw new PrivilegesError(`Authenticated user does not have privileges`);
            }
            return fetchSubjectDataTreeSimple(idSubject, subjectTreeSimpleCb);

        })
        .catch(err => {
            sails.log.error(err);
            return co.error(err);
        });

        function subjectTreeSimpleCb(err,resp) {

            let children = [], links = [];

            sails.log(resp);
            /*istanbul ignore if*/
            if (resp.rows.length === 0) {
                links = [{
                    'source': 'Patient',
                    'target': null
                }];

                return res.json({links: links});
            }

            for(let i = 0; i<resp.rows.length; i++) {
                children.push(resp.rows[i].id);
            }

            sails.log(children);

            BluebirdPromise.map(children,function(child){
                let privilege, childName;

                return DataType.findOne(child).then(function(dataType){
                    childName = dataType.name;
                    if(_.find(dataTypePrivileges, function (d) {
                        privilege = d;
                        return privilege.dataType.name === childName;
                    })){
                        return {'source':'Patient','target':childName};
                    }
                });
            })
            .then(function(link){
                links = _.reject(link, function(l){ return l === undefined; });
                let json = {'links':links};
                return res.json(json);
            })
            .catch(function(err){
                sails.log.error(err);
                return co.error(err);
            });

        }

    }

};
