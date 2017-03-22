/**
 * SubjectController
 * @author      :: Massimiliano Izzo
 * @description :: Server-side logic for managing subjects
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */
/* jshint node: true */
/* globals _, sails, DataTypePrivileges, Subject, DataType, SubjectService, TokenService, QueryService, DataService, DataTypeService */
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

const coroutines = {

    /**
     * @method
     * @name create
     * @param{Request} req
     * @param{Response} res
     * @description coroutine for new Subject instance creation
     */
    create: BluebirdPromise.coroutine(function *(req, res) {
        let subject = req.allParams();
        const operator = TokenService.getToken(req);
        const dataTypePrivilege = yield DataTypeService.getDataTypePrivilegeLevel(operator.groups, subject.type);
        if (!dataTypePrivilege || _.isEmpty(dataTypePrivilege || dataTypePrivilege.privilegeLevel != EDIT)) {
            throw new PrivilegesError(`Authenticated user does not have edit privileges on the subject type ${subject.type}`);
        }
        SubjectService.simplify(subject);
        const dataType = yield DataType.findOne(subject.type);

        const validationRes = SubjectService.validate(subject, true, dataType);
        if (validationRes.error !== null) {
            throw new ValidationError(validationRes.error);
        }
        subject = validationRes.value;
        const dataTypeName = dataType && dataType.name;
        const result = yield crudManager.createSubject(subject, dataTypeName);
        sails.log.info(result);
        res.set('Location', `${req.baseUrl}${req.url}/${result.id}`);
        return res.json(201, result);
    }),

    findOne: BluebirdPromise.coroutine(function *(req, res) {
        const id = req.param('id');
        const operator = TokenService.getToken(req);

        let query = Subject.findOne(id);
        query = actionUtil.populateRequest(query, req);

        let subject = yield BluebirdPromise.resolve(query);
        const idSubjectType = subject ? _.isObject(subject.type) ? subject.type.id :  subject.type : undefined;
        const dataTypePrivilege = yield DataTypeService.getDataTypePrivilegeLevel(operator.groups, idSubjectType);

              //filter Out Metadata if operator has not the privilege
        if (!dataTypePrivilege || _.isEmpty(dataTypePrivilege)){ subject = {}; }
        else if( dataTypePrivilege.privilegeLevel === VIEW_OVERVIEW) { subject.metadata = {}; }

        if( !operator.canAccessSensitiveData && !_.isEmpty(subject.metadata) ){
            subject = yield DataService.filterOutSensitiveInfo(subject, operator.canAccessSensitiveData);
        }
        return res.json(subject);

    }),

    find: BluebirdPromise.coroutine(function *(req, res) {

        const operator = TokenService.getToken(req);
        let allPrivileges = yield DataTypePrivileges.find({group:operator.groups});
        allPrivileges = operator.groups.length > 1 ? DataTypeService.getHigherPrivileges(allPrivileges) : allPrivileges;
        let query = QueryService.composeFind(req, null, allPrivileges);

        let subjects = yield BluebirdPromise.resolve(query);
        const dataTypesId = !_.isEmpty(subjects) ? _.isObject(subjects[0].type) ? _.uniq(_.map(_.map(subjects, 'type'), 'id')) : _.uniq(_.map(subjects, 'type')) : [];
        const pagePrivileges = allPrivileges.filter( obj => {
            return _.find(dataTypesId, id =>{ return id === obj.dataType;});
        });

        const [payload, headerInfo]  = yield BluebirdPromise.all([
            DataService.filterListByPrivileges(subjects, dataTypesId, pagePrivileges, operator.canAccessSensitiveData),
            QueryService.composeHeaderInfo(req, allPrivileges)
        ]);
        return DataService.prepareAndSendResponse(res, payload, headerInfo);

    }),

    update: BluebirdPromise.coroutine(function *(req, res) {
        let subject = req.allParams();
        const operator = TokenService.getToken(req);

        let result = yield DataService.hasDataSensitive(subject.id, SUBJECT);
        if (result.hasDataSensitive && !operator.canAccessSensitiveData) {
            throw new PrivilegesError("Authenticated user is not allowed to modify sensitive data");
        }

        const idSubjectType = _.isObject(subject.type) ? subject.type.id : subject.type;
        const dataTypePrivilege = yield DataTypeService.getDataTypePrivilegeLevel(operator.groups, idSubjectType);
        if (!dataTypePrivilege || dataTypePrivilege.privilegeLevel != EDIT) {
            throw new PrivilegesError(`Authenticated user does not have edit privileges on the subject type ${subject.type}`);
        }
        SubjectService.simplify(subject);

        const dataType = yield DataType.findOne(idSubjectType);
        const validationRes = SubjectService.validate(subject, true, dataType);
        if (validationRes.error !== null) {
            throw new ValidationError(validationRes.error);
        }
        const dataTypeName = dataType && dataType.name;
        subject = validationRes.value;
        const updatedSubject = yield crudManager.updateSubject(subject, dataTypeName);

        return res.json(updatedSubject);
    }),

    destroy: BluebirdPromise.coroutine(function *(req, res, co) {
        const id = req.param('id');
        const operator = TokenService.getToken(req);

        if (!id) {
            return co.badRequest({ message: 'Missing subject ID on DELETE request' });
        }

        const subject = yield Subject.findOne({ id: id });
        if (!subject) {
            throw new NonexistentResourceError("Missing Resource");
        }
            //retrieve dataType id
        const idSubjectType = _.isObject(subject.type) ? subject.type.id : subject.type;

        const dataTypePrivilege = yield DataTypeService.getDataTypePrivilegeLevel(operator.groups, idSubjectType);
        if (!dataTypePrivilege || dataTypePrivilege.privilegeLevel != EDIT) {
            throw new PrivilegesError(`Authenticated user does not have edit privileges on the subject type ${subject.type}`);
        }
        sails.log.info(`Subject to be deleted:  ${subject.id}`);

        const deleted = yield crudManager.deleteSubject(id);
        return res.json(200, { deleted: deleted });

    }),

    edit: BluebirdPromise.coroutine(function *(req, res) {
        const operator = TokenService.getToken(req);
        const id = req.param("id"), code = req.param("code");
        sails.log.info("SubjectController.edit - Decoded ID is: " + operator.id);

        const payload = yield BluebirdPromise.props({
            subject: SubjectService.getOneAsync(id, code),
            dataTypes: crudManager.getDataTypesByRolePrivileges({
                idOperator: operator.id,
                model: SUBJECT,
                privilegeLevel: EDIT
            })
        });
        if(!payload.subject){ throw new ValidationError('No subject found with id: ${params.id}'); }
              //if operator has not the privilege to EDIT datatype, then return forbidden
        if (_.isEmpty(payload.dataTypes)){ throw new PrivilegesError(`Authenticated user does not have edit privileges on any subject type`); }

        const sensitiveRes = yield DataService.hasDataSensitive(payload.subject.id, SUBJECT);

            // if operator has not access to Sensitive Data and dataType has sensitive data, then return forbidden
        if (sensitiveRes && ((sensitiveRes.hasDataSensitive && !operator.canAccessSensitiveData))) {
            throw new PrivilegesError("Authenticated user is not allowed to edit sensitive data");
        }
              // if edit subject exists and operator has not the privilege to EDIT datatype, then throw Privileges Error
        if (payload.subject && (_.isEmpty(payload.dataTypes) || !_.find(payload.dataTypes, {id : payload.subject.type.id}))) {
            throw new PrivilegesError(`Authenticated user does not have edit privileges on the subject type`);
        }
        return res.json(payload);


    })


};

module.exports = {

    /**
     *  POST /subject
     *  @method
     *  @name create
     *  @description:  create a new subject; transaction-safe implementation
     */
    create: function(req, res) {
        const co = new ControllerOut(res);
        coroutines.create(req,res)
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
        coroutines.findOne(req,res)
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
        coroutines.find(req,res)
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
        const co = new ControllerOut(res);
        coroutines.update(req,res)
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
     * @description retrieve all required models for editing/creating a Subject via client web-form
     */
    edit: function(req, res) {
        const co = new ControllerOut(res);
        coroutines.edit(req,res)
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
