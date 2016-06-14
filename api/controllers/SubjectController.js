/**
 * SubjectController
 * @author      :: Massimiliano Izzo
 * @description :: Server-side logic for managing subjects
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */
/* jshint node: true */
/* globals _, __filename__, sails, Project, Subject, Data, DataType, SubjectService, TokenService, QueryService, DataService */
"use strict";

const ControllerOut = require("xtens-utils").ControllerOut;
const crudManager = sails.hooks.persistence.crudManager;
const BluebirdPromise = require('bluebird');
const ValidationError = require('xtens-utils').Errors.ValidationError;
const SUBJECT = sails.config.xtens.constants.DataTypeClasses.SUBJECT;

module.exports = {

    /**
     *  POST /subject
     *  @method
     *  @name create
     *  @description:  create a new subject; transaction-safe implementation
     */
    create: function(req, res) {
        const co = new ControllerOut(res);
        // let subject = req.body;
        let subject = req.allParams();
        console.log(subject);
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
        /*
        .then(function(idSubject) {
            console.log("SubjectController.create - created subject : " + idSubject);
            return Subject.findOne(idSubject).populate('personalInfo');
        }) */
        .then(function(result) {
            console.log(result);
            res.set('Location', req.baseUrl + req.url + '/'  + result.id);
            return res.json(201, result);
        })
        .catch(function(error) {
            console.log("SubjectController.create: " + error.message);
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
        let query = Subject.findOne(id);
        const operator = TokenService.getToken(req);

        query = QueryService.populateRequest(query, req, { blacklist: ['personalInfo'] });

        // TODO replace true in IF condition with check on getting personal details
        if (operator.canAccessPersonalData) {
            query.populate('personalInfo');
        }

        query.then(function(result) {
            return res.json(result);
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

        let query = Subject.find(QueryService.parseSelect(req))
        .where(QueryService.parseCriteria(req))
        .limit(QueryService.parseLimit(req))
        .skip(QueryService.parseSkip(req))
        .sort(QueryService.parseSort(req));

        query = QueryService.populateRequest(query, req, { blacklist: ['personalInfo'] });

        if (operator.canAccessPersonalData) {
            query.populate('personalInfo');
        }

        query.then(function(subject) {
            res.json(subject);
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
        const co = new ControllerOut(res);
        let subject = req.allParams();
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
        /*
        .then(function(idSubject) {
            console.log(idSubject);
            return Subject.findOne(idSubject).populate('personalInfo');
        }) */
        .then(function(result) {
            console.log(result);
            res.set('Location', req.baseUrl + req.url + '/'  + result.id);
            return res.json(result);
        })
        .catch(function(error) {
            console.log(error.message);
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
        const idOperator = TokenService.getToken(req).id;

        if (!id) {
            return co.badRequest({message: 'Missing subject ID on DELETE request'});
        }

        return BluebirdPromise.props({
            subject: Subject.findOne({id: id}),
            dataTypes: crudManager.getDataTypesByRolePrivileges({
                idOperator: idOperator,
                model: SUBJECT
            })
        })
        .then(function(result) {
            const allowedDataTypes = _.pluck(result.dataTypes, 'id');
            // if subject does not exist return 0 rows deleted
            if (!result.subject) {
                return BluebirdPromise.resolve(0);
            }
            if (allowedDataTypes.indexOf(result.subject.type) > -1) {
                return crudManager.deleteSubject(id);
            }
        })

        .then(function(deleted) {
            if (deleted === undefined) {
                return co.forbidden({message: 'User nor authorized to delete Subject with ID: ' + id});
            }
            return res.json({
                deleted: deleted
            });
        })

        .catch(function(err) {
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

        console.log("SubjectController.edit - Decoded ID is: " + operator.id);

        return BluebirdPromise.props({
            projects: Project.find(),
            subject: SubjectService.getOneAsync(id, code),
            dataTypes: crudManager.getDataTypesByRolePrivileges({
                idOperator: operator.id,
                model: SUBJECT
            }),
        })
        .then(function(results) {
          if(!operator.canAccessPersonalData){
            delete results['personalInfo'];
          }
            return res.json(results);
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
