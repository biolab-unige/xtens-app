/**
 *  @author Massimiliano Izzo
 */
var BiobankService = {
    
    get: function(next, params) {
        var criteriaObj = {};
        if (params.idBiobanks) {
            var ids = params.idBiobanks.split(",");
            criteriaObj.id = ids;
        }
        Biobank.find(criteriaObj).exec(next);
    }

};



module.exports = BiobankService;
