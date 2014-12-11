/**
 *  @author Massimiliano Izzo
 */
var DataTypeService = {
    
    getChildrenRecursive: function(parents) {
        parents.forEach(function(parent, index) {
            DataType.find({parent: parent.id}).populate('children').then(function(children) {
                parent.children = children;
                DataTypeService.getChildrenRecursive(children);
            }).catch(function(err) {
                if (err) console.log(err);
            });
        });
    },

    getAsync: function(next, params) {
        var criteriaObj = { classTemplate: params.classTemplate };
        if (params.idDataTypes) {
            var ids = params.idDataTypes.split(",");
            criteriaObj.id = ids;
        }
        DataType.find(criteriaObj).populateAll().exec(next); // do we need populateAll here?
    }

};
module.exports = DataTypeService;
