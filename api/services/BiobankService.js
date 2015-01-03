/**
 *  @author Massimiliano Izzo
 */
var BluebirdPromise = require('bluebird');

var BiobankService = BluebirdPromise.promisifyAll({
    
    /**
     * @description find a list of Biobanks
     * @return {Array} - list of found Biobanks
     */   
    get: function(params, next) {
        var criteriaObj = {};
        if (params.idBiobanks) {
            var ids = params.idBiobanks.split(",");
            criteriaObj.id = ids;
        }
        Biobank.find(criteriaObj).exec(next);
    }

});



module.exports = BiobankService;
