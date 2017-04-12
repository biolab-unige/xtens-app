/**
 * ProjectController
 *
 * @description :: Server-side logic for managing projects
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */
 /* jshint node: true */
 /* globals _, sails, Project, ProjectService, GroupService, TokenService, Group */


"use strict";

const BluebirdPromise = require('bluebird');
const ControllerOut = require("xtens-utils").ControllerOut;
const actionUtil = require('sails/lib/hooks/blueprints/actionUtil');
const __ = require('lodash');

const coroutines = {

    find: BluebirdPromise.coroutine(function *(req, res) {
        const operator = TokenService.getToken(req);
        let query = Project.find()
        .where(actionUtil.parseCriteria(req))
        .limit(actionUtil.parseLimit(req))
        .skip(actionUtil.parseSkip(req))
        .sort(actionUtil.parseSort(req));

        query = actionUtil.populateRequest(query, req);

        let projects = yield BluebirdPromise.resolve(query);

        if(!operator.isWheel){
            let groups = yield Group.find(operator.groups).populate('projects');
            let projectsGroups = _.map(groups, function (g) { return g.projects; });
            projectsGroups = _.uniq(_.flatten(projectsGroups));
            projects = __.intersectionBy(projects, projectsGroups, 'id');
        }

        sails.log(projects);
        return res.json(projects);
    }),
    edit: BluebirdPromise.coroutine(function *(req, res) {
        const operator = TokenService.getToken(req);
        const params = req.allParams();
        sails.log.info("ProjectController.edit - Decoded ID is: " + operator.id);
        const payload = yield BluebirdPromise.props({
            project: ProjectService.getOneAsync(params.id),
            // dataTypes: DataTypeService.getDataTypesToEditProject(),
            groups: GroupService.getGroupsToEditProject(params.id)
        });

        return res.json(payload);
    })
};


module.exports = {


  /**
   * @method
   * @name find
   * @description retrieve an array of projects
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
   * @method
   * @name edit
   * @description retrieve all required information to create an EditData form
   */

    edit: function(req, res) {
        const co = new ControllerOut(res);
        coroutines.edit(req, res)
            .catch(err => {
                sails.log.error(err);
                return co.error(err);
            });

    }

};
