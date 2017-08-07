/**
 *  @module
 *  @name OperatorService
 *  @author Nicolò Zanardi
 */

/* jshint esnext: true */
/* jshint node: true */
/* globals _, sails , GroupService */

const BluebirdPromise = require('bluebird');

const coroutines = {

    getOwners: BluebirdPromise.coroutine(function *(datum) {

        if (!datum || !datum.type) {
            return [];
        }
        let idProject = _.isObject(datum.type.project) ? datum.type.project.id : datum.type.project;
        // _.isObject(datum.type.project);
        let groups = yield GroupService.getGroupsByProject(idProject);

        let operators = _.uniq(_.flatten(_.map(groups,'members')));
        return operators;

    })
};



var OperatorService = BluebirdPromise.promisifyAll({

    /**
     * @method
     * @name getOwners
     * @param{object} data object
     * @description find a list of Operators
     * @return {Array} - list of elegible Operators to owner a specific datum
     */
    getOwners: function(datum) {
        return coroutines.getOwners(datum)
        .catch((err) => {
            sails.log(err);
            return err;
        });
    }
});

module.exports = OperatorService;
