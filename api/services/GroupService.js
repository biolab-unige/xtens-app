/**
 *  @module
 *  @name GroupService
 *  @author Nicolò Zanardi
 */
/* jshint esnext: true */
/* jshint node: true */
/* globals _, sails , Group */
"use strict";

let BluebirdPromise = require("bluebird");


const coroutines = {

    getGroupsToEditProject: BluebirdPromise.coroutine(function *(idProject) {
        let groups = yield Group.find().populate('projects');

        for (var i = groups.length - 1; i >= 0; i--) {
            if(_.indexOf(_.map(groups[i].projects,'id'), _.parseInt(idProject))>=0){
                groups.splice(i, 1);
            }
        }

        return groups;

    }),

    getGroupsByProject: BluebirdPromise.coroutine(function *(idProject) {
        let groups = yield Group.find().populate(['projects','members']);

        for (var i = groups.length - 1; i >= 0; i--) {
            if(groups[i].privilegeLevel !== "wheel" && _.indexOf(_.map(groups[i].projects,'id'), _.parseInt(idProject))<0){
                groups.splice(i, 1);
            }
        }

        return groups;
    })
};



var GroupService = BluebirdPromise.promisifyAll({
      /**
       * @method
       * @name getGroupsToEditProject
       * @param{ineger} id Project
       * @description return an array containing groups do not yet associate with project
       * @return {Array} - Datatypes not yet associated with a project
       */
    getGroupsToEditProject: function(idProject) {
        return coroutines.getGroupsToEditProject(idProject)
          .catch(/* istanbul ignore next */ function(err) {
              sails.log.error(err);
              return err;
          });

    },

    /**
     * @method
     * @name getGroupsByProject
     * @param{ineger} id Project
     * @description return array containing groups associate with project
     * @return {Array} - Datatypes not yet associated with a project
     */
    getGroupsByProject: function(idProject) {
        return coroutines.getGroupsByProject(idProject)
        .catch(/* istanbul ignore next */ function(err) {
            sails.log.error(err);
            return err;
        });
    },

    /**
     * @description find a list of Groups
     * @return {Array} - list of found Groups
     */
    get: function(idGroups, next) {
        var criteriaObj = {};
        if (idGroups) {
            criteriaObj.id = idGroups;
        }
        Group.find(criteriaObj).populate('projects').exec(next);
    }

});


module.exports = GroupService;
