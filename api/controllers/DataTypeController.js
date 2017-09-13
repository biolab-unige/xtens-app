/**
* DataTypeController
*
* @description :: Server-side logic for managing datatypes
* @help        :: See http://links.sailsjs.org/docs/controllers
*/
/* jshint node: true */
/* globals _, sails, DataType, DataTypeService, TokenService, Group, Project, SuperTypeService */
"use strict";
const ControllerOut = require("xtens-utils").ControllerOut, ValidationError = require('xtens-utils').Errors.ValidationError;
const PrivilegesError = require('xtens-utils').Errors.PrivilegesError;
const crudManager = sails.hooks.persistence.crudManager;
const actionUtil = require('sails/lib/hooks/blueprints/actionUtil');
const BluebirdPromise = require('bluebird');

const coroutines = {

    /**
    * @method
    * @name coroutines.find
    * @param{Request} req
    * @param{Response} res
    * @description coroutine for retrieval of a list of Data Types
    */
    find: BluebirdPromise.coroutine(function *(req, res) {
        const operator = TokenService.getToken(req);
        let query = DataType.find()
        .where(actionUtil.parseCriteria(req))
        .limit(actionUtil.parseLimit(req))
        .skip(actionUtil.parseSkip(req))
        .sort(actionUtil.parseSort(req));
        if (!req.param('limit')) {
            query.limit(1000);  // default limit for dataTypes
        }
        if (!req.param('populate')) {
            query.populate(['parents', 'superType']);  // by default populate only with 'parents' dataTypes and 'superType'
        }
        else {
            query = actionUtil.populateRequest(query, req);
        }
        //populateRequest does not support array params on integer attribute so if there is project param and it is an array, it is parsed "manually"
        query = DataTypeService.parseProject(query);
        let dataTypes = yield BluebirdPromise.resolve(query);

        let groups = yield Group.find(operator.groups);
        let privilegeLevelGroups = _.uniq(_.flatten(_.map(groups, 'privilegeLevel')));
        if(_.indexOf(privilegeLevelGroups, 'wheel') < 0){
            dataTypes = yield DataTypeService.filterDataTypes(operator.groups, dataTypes);
        }

        return res.json(dataTypes);
    }),

    /**
    * @method
    * @name coroutines.create
    * @param{Request} req
    * @param{Response} res
    * @description coroutine for new DataType creation
    */
    create: BluebirdPromise.coroutine(function *(req, res) {
        const operator = TokenService.getToken(req);
        let dataType = req.allParams();
      //if user tries to create a datatype in a project where is not ADMIN it will throw a Privilege error
        let adminGroups = yield Group.find(operator.adminGroups).populate('projects');
        const adminProjects = _.uniq(_.flatten(_.map(_.flatten(_.map(adminGroups, 'projects')), 'id')));
        if (!operator.isWheel && !_.find(adminProjects, function(dt){ return dt === _.parseInt(dataType.project);})) {
            throw new PrivilegesError('User has not privilege as Admin on this project');
        }

        if (!dataType.name) dataType.name = dataType.schema && dataType.schema.name;
        if (!dataType.model) dataType.model = dataType.schema && dataType.schema.model;
        if(dataType.parents){
            const idParents = _.isObject(dataType.parents[0]) ? _.map(dataType.parents,'id') : dataType.parents;
            const idProject = _.isObject(dataType.project) ? dataType.project.id : dataType.project;
            const parents = yield DataType.find({ id:idParents });
            const forbiddenParents = _.filter(parents, function (p) {
                return p.project !== idProject;
            });
            if (forbiddenParents.length > 0 ) {
                let dataTypesName = _.map(forbiddenParents,'name').join(", "), dataTypesId = _.map(forbiddenParents,'id').join(", ");
                let error = 'ValidationError - Cannot set ' + dataTypesName +' ( id: ['+ dataTypesId +'] ) as parents - different projects';
                throw new ValidationError(error);
            }
        }
        const validationRes = DataTypeService.validate(dataType, true);

        if (validationRes.error) {
            throw new ValidationError(validationRes.error);
        }

        dataType = yield crudManager.createDataType(dataType);

        //add edit privileges for manager and wheel groups of operator
        // let projectGroups= yield GroupService.getGroupsByProject(dataType.project);
        // let wheelGroups = _.map(_.where(projectGroups,{privilegeLevel:"wheel"}),'id');
        // projectGroups = _.map(projectGroups, 'id');
        // let adminValidGroups = _.intersection(projectGroups, operator.adminGroups);
        // let validGroups = _.union(adminValidGroups, wheelGroups);
        // for (let id of validGroups) {
        //     yield DataTypePrivileges.create({privilegeLevel:'edit', group: id, dataType: dataType.id });
        // }

        res.set('Location', `${req.baseUrl}${req.url}/${dataType.id}`);
        return res.json(201, dataType);
    }),

    /**
    * @method
    * @name coroutines.update
    * @param{Request} req
    * @param{Response} res
    * @description coroutine for existing DataType update
    */
    update: BluebirdPromise.coroutine(function *(req, res) {
        let dataType = req.allParams();
        const operator = TokenService.getToken(req);
      //if user tries to update a datatype in a project where is not ADMIN it will throw a Privilege error
        let adminGroups = yield Group.find(operator.adminGroups).populate('projects');
        const adminProjects = _.uniq(_.flatten(_.map(_.flatten(_.map(adminGroups, 'projects')), 'id')));
        let adminDataTypes = yield DataType.find({project:adminProjects});

        if (!operator.isWheel && !_.find(adminDataTypes, function(dt){ return dt.id === _.parseInt(dataType.id);})) {
            throw new PrivilegesError('User has not privilege as Admin on this project');
        }

        // Validate data type (schema included)
        const validationRes = DataTypeService.validate(dataType, true);
        if(dataType.parents){
            const idParents = _.isObject(dataType.parents[0]) ? _.map(dataType.parents,'id') : dataType.parents;
            const idProject = _.isObject(dataType.project) ? dataType.project.id : dataType.project;
            const parents = yield DataType.find({ id:idParents });
            const forbiddenParents = _.filter(parents, function (p) {
                return p.project !== idProject;
            });
            if (forbiddenParents.length > 0 ) {
                let dataTypesName = _.map(forbiddenParents,'name').join(", "), dataTypesId = _.map(forbiddenParents,'id').join(", ");
                let error = 'ValidationError - Cannot set ' + dataTypesName +' ( id: ['+ dataTypesId +'] ) as parents - different projects';
                throw new ValidationError(error);
            }
        }
        if (validationRes.error) {
            throw new ValidationError(validationRes.error);
        }
        dataType = yield crudManager.updateDataType(dataType);
        sails.log(dataType);
        return res.json(dataType);
    }),

    edit: BluebirdPromise.coroutine(function *(req, res) {
        const operator = TokenService.getToken(req);
        const params = req.allParams();
        let isMultiProject, resObject = {};
        sails.log.info("DataTypeController.edit - Decoded ID is: " + operator.id);

        const projects = yield Project.find().sort('id ASC');

        const dataTypes= yield DataType.find({ project:_.map(projects,'id') }).populate(['project','parents','superType']).sort('id ASC');
        if (params.id) {
            const dataType = _.find(dataTypes,{'id': parseInt(params.id)});
            isMultiProject = yield SuperTypeService.isMultiProject(dataType.superType);
            resObject.isMultiProject = isMultiProject;
        }
        resObject.params = params;
        resObject.dataTypes = dataTypes;
        return res.json(resObject);
    }),

    destroy: BluebirdPromise.coroutine(function *(req, res, co) {
        const id = req.param('id');
        if (!id) {
            return co.badRequest({message: 'Missing dataType ID on DELETE request'});
        }
      //if user tries to destroy a datatype in a project where is not ADMIN it will throw a Privilege error
        const operator = TokenService.getToken(req);
        sails.log.info("DataTypeController.destroy - Decoded ID is: " + operator.id);
        let adminGroups = yield Group.find(operator.adminGroups).populate('projects');
        const adminProjects = _.uniq(_.flatten(_.map(_.flatten(_.map(adminGroups, 'projects')), 'id')));
        let adminDataTypes = yield DataType.find({project:adminProjects});

        if (!operator.isWheel && !_.find(adminDataTypes, function(dt){ return dt.id === _.parseInt(id);})) {
            throw new PrivilegesError('User has not privilege as Admin on this project');
        }

        const deleted = yield crudManager.deleteDataType(id);
        return res.json({deleted: deleted});
    })
};



const DataTypeController = {

    /**
    * GET /dataType
    * GET /dataType/find
    *
    * @method
    * @name find
    * @description Find dataTypes based on criteria
    */
    find: function(req, res) {
        const co = new ControllerOut(res);
        coroutines.find(req, res)
        .catch(err => {
            sails.log.error(err);
            return co.error(err);
        });
    },

    /**
    * POST /dataType
    * @method
    * @name create
    */
    create: function(req, res) {
        const co = new ControllerOut(res);
        coroutines.create(req, res)
        .catch(err => {
            sails.log.error(err);
            return co.error(err);
        });
    },

    /**
    * PUT /dataType/:id
    * @method
    * @name update
    */
    update: function(req, res) {
        const co = new ControllerOut(res);
        coroutines.update(req, res)
        .catch(err => {
            sails.log.error(err);
            return co.error(err);
        });
    },

    /**
    * @method
    * @name destroy
    * @description DELETE /dataType/:id
    */
    destroy: function(req, res) {

        let co = new ControllerOut(res);
        coroutines.destroy(req,res,co)
        .catch(function(err) {
            sails.log(err);
            return co.error(err);
        });

    },

    /**
    * @method
    * @name edit
    * @description return all the info required for a datatype edit
    */
    edit: function(req, res) {
        let co = new ControllerOut(res);
        coroutines.edit(req,res)
        .catch(function(err) {
            sails.log(err);
            return co.error(err);
        });

    },

    /**
    * @method
    * @name buildGraph
    * @description generate and visualize the datatype graph given a root datatype.
    */

    buildGraph : function(req,res) {
        const idGroups = TokenService.getToken(req).groups;
        const idDataType = req.param("idDataType");
        const fetchDataTypeTree = sails.hooks['persistence'].getDatabaseManager().recursiveQueries.fetchDataTypeTree;
        sails.log(req.param("idDataType"));

        return Group.find({id:idGroups}).populate('projects').then(function (groups) {

            let projectsGroups = _.map(groups, function (g) { return _.map(g.projects,'id'); });
            projectsGroups = _.uniq(_.flatten(projectsGroups));

            return DataType.findOne({id: idDataType, project: projectsGroups});
        })
        .then(function(result) {
            const id = result.id;
            const name = result.name;

            const template = result.model;

            // This query returns the parent-child associations among the datatypes
            function dataTypeTreeCb (err, resp) {

                var links= [],loops = [];

                // if there aren't children do not print any link
                if(resp.rows.length === 0) {
                    links.push({
                        'source': name,
                        'depth': 0,
                        'target': null,
                        'source_template': template,
                        'target_template': null
                    });
                }
                // populate the links array
                for(let i =0; i<resp.rows.length; i++) {

                    if(resp.rows[i].cycle === false){
                        links.push({
                            'source':resp.rows[i].parentname,
                            'target':resp.rows[i].childname,
                            'depth':resp.rows[i].depth,
                            'source_template':resp.rows[i].parenttemplate,
                            'target_template':resp.rows[i].childtemplate,
                            'cycle':resp.rows[i].cycle
                        });
                    }
                    else {
                        loops.push({
                            'source':resp.rows[i].parentname,
                            'target':resp.rows[i].childname,
                            'depth':resp.rows[i].depth,
                            'source_template':resp.rows[i].parenttemplate,
                            'target_template':resp.rows[i].childtemplate,
                            'cycle':resp.rows[i].cycle
                        });
                    }
                }

                const json = {
                    'links': links,
                    'loops': loops
                };
                sails.log(json);
                return res.json(json);
            }

            fetchDataTypeTree(id, dataTypeTreeCb);
        });
    }


};

module.exports = DataTypeController;
