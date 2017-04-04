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
        console.log("getGroupsToEditProject",groups);
        for (var i = groups.length - 1; i >= 0; i--) {
            if(_.indexOf(_.map(groups[i].projects,'id'), _.parseInt(idProject))>=0){
                groups.splice(i, 1);
            }
        }

        return groups;
    })
};


var GroupService = BluebirdPromise.promisifyAll({
      /**
       * @method
       * @name getDataTypesToEditProject
       * @param{ineger} id Project
       * @description return the higher privileges in array
       * @return {Array} - Datatypes not yet associated with a project
       */
    getGroupsToEditProject: function(idProject) {
        return coroutines.getGroupsToEditProject(idProject)
          .catch((err) => {
              sails.log(err);
              return err;
          });
    }

});


module.exports = GroupService;
