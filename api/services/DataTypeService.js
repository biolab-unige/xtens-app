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
    
    /**
     * @method
     * @name get
     * @return {Array} - list of found DataType entities
     */

    get: function(next, params) {
        var criteriaObj = { classTemplate: params.classTemplate };
        if (params.idDataTypes) {
            var ids = params.idDataTypes.split(",");
            criteriaObj.id = ids;
        }
        DataType.find(criteriaObj).populateAll().exec(next); // do we need populateAll here?
    },

    /**
     * @method
     * @name getByOperator
     * @param idOperator
     * @param next - a callback
     * @return {Array} - list of found DataType entities
     * @description find the list of allowed DataTypes for a specific Operator, through its Groups
     */

    getByOperator: function(idOperator, params, next) {
        DataType.query({
            name: 'findDataTypeByOperator',
            text: ['SELECT d.id, d.name, d.schema FROM data_type d ',
                'INNER JOIN datatype_groups__group_datatypes dggd ON d.id = dggd.datatype_groups ',
                'INNER JOIN xtens_group g ON g.id = dggd."group_dataTypes" ',
                'INNER JOIN group_members__operator_groups gmog ON g.id = gmog.group_members ',
                'INNER JOIN operator o ON o.id = gmog.operator_groups ',
                'WHERE o.id = $1 AND d.class_template = $2;'
            ].join(""),
            values: [idOperator, params.classTemplate]
        }, function(err, result) {
            if (err) {
                next(err);
            }
            else {
                next(null, result.rows);
            }
        });
    }

};
module.exports = DataTypeService;
