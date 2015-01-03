/**
 *  @author Massimiliano Izzo
 */
var BluebirdPromise = require('bluebird');

var SampleService = BluebirdPromise.promisifyAll({

    /**
     * @method
     * @name simplify
     * @description removes all associated Objects if present keeping only their primary keys (i.e. IDs)
     */
    simplify: function(sample) {
        ["type", "donor", "parentSample", "biobank"].forEach(function(elem) {
            if (sample[elem]) {
                sample[elem] = sample[elem].id || sample[elem];
            }
        });
    },
    
    /**
     * @description get a Sample model from the ID if an ID is provided
     */
    getOne: function(id, next) {
        if (!id) {
            next(null, null);
        }
        else {
            Sample.findOne(_.parseInt(id)).populateAll().exec(next);
        }
    }

});
module.exports = SampleService;
