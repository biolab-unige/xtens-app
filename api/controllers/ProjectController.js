/**
 * ProjectController
 *
 * @description :: Server-side logic for managing projects
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */
 /* jshint node: true */
 /* globals _, sails, ProjectService, GroupService, DataTypeService, TokenService */


"use strict";

const BluebirdPromise = require('bluebird');
const ControllerOut = require("xtens-utils").ControllerOut;

const coroutines = {

    edit: BluebirdPromise.coroutine(function *(req, res) {
        const operator = TokenService.getToken(req);
        const params = req.allParams();
        sails.log.info("ProjectController.edit - Decoded ID is: " + operator.id);

        const payload = yield BluebirdPromise.props({
            project: ProjectService.getOneAsync(params.id),
            dataTypes: DataTypeService.getDataTypesToEditProject(),
            groups: GroupService.getGroupsToEditProject(params.id)
        });

        return res.json(payload);
    })
};


module.exports = {

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
