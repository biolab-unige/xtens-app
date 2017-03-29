/**
 *  @module
 *  @name GroupService
 *  @author Nicolò Zanardi
 */
 /* jshint node: true */
 /* globals _, sails, Project */
var BluebirdPromise = require('bluebird');


var ProjectService = BluebirdPromise.promisifyAll({

     /**
      * @method
      * @name getOne
      * @description return a Project instance, given its id and populate all its associations
      * @param {integer} id
      * @param {function} next - callaback function
      */
    getOne: function(id, next) {
        if (!id) {
            next(null, null);
        }
        else {
            Project.findOne(_.parseInt(id)).populateAll().exec(next);
        }
    }

});



module.exports = ProjectService;
