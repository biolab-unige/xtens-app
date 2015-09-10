/** 
 *  @module
 *  @author Massimiliano Izzo
 */
var Constants = sails.config.xtens.constants;
var transactionHandler = sails.config.xtens.transactionHandler;

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
        var criteriaObj = { model: params.model };
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
                'WHERE o.id = $1 AND d.model = $2;'
            ].join(""),
            values: [idOperator, params.model]
        }, function(err, result) {
            if (err) {
                next(err);
            }
            else {
                next(null, result.rows);
            }
        });
    },


    /**
     * @method
     * @name getByOperatorAndParentDataType
     * @param idOperator
     * @param params {Object} contains the model name and the parent DataType ID
     * @param next - a callback
     * @return {Array} - list of found DataType entities
     * @description find the list of allowed DataTypes for a specific Operator, through its Groups
     */

    getByOperatorAndParentDataType: function(idOperator, params, next) {
        DataType.query({
            name: 'findDataTypeByOperator',
            text: ['SELECT d.id, d.name, d.schema FROM data_type d ',
                'INNER JOIN datatype_groups__group_datatypes dggd ON d.id = dggd.datatype_groups ',
                'INNER JOIN xtens_group g ON g.id = dggd."group_dataTypes" ',
                'INNER JOIN group_members__operator_groups gmog ON g.id = gmog.group_members ',
                'INNER JOIN operator o ON o.id = gmog.operator_groups ',
                'INNER JOIN datatype_children__datatype_parents dcdp ON d.id = dcdp.datatype_parents ',
                'WHERE o.id = $1 AND d.model = $2 AND dcdp.datatype_children = $3;'
            ].join(""),
            values: [idOperator, params.model, params.idDataType]
        }, function(err, result) {
            if (err) {
                next(err);
            }
            else {
                next(null, result.rows);
            }
        });
    },

    /**
     * @method
     * @name getFlattenedFields
     * @description flattens the metadata schema returning a 1D array containing all the metadata fields
     * @param {DataType} dataType - the DataType record whose schema is to flatten
     * @param {boolean} skipFieldsWithinLoops - if true skips all the metadatafields that are contained within metadata loops
     */

    getFlattenedFields: function(dataType, skipFieldsWithinLoops) {
        var flattened = [];
        var body = dataType.schema && dataType.schema.body;

        // if no body return an empty array
        if (!body) return flattened;

        // iterate through all groups within the body
        for (var i=0, len=body.length; i<len; i++) {
            var groupContent = body[i] && body[i].content;

            // iterate through all the fields/loops
            for (var j=0, l=groupContent.length; j<l; j++) {
                if (groupContent[j].label === Constants.METADATA_FIELD) {
                    flattened.push(groupContent[j]);
                }
                else if (groupContent[j].label === Constants.METADATA_LOOP && !skipFieldsWithinLoops) {
                    var loopContent = groupContent[j] && groupContent[j].content;
                    for (var k=0; k<loopContent.length; k++) {
                        if (loopContent[k].label === Constants.METADATA_FIELD) {
                            
                            // add to the field a private flag that specifies its belonging to a loop
                            flattened.push(_.extend(loopContent[k], {_loop: true}));                         
                        
                        }
                    }
                }

            }
        }
        return flattened;
    },
    
    /**
     * @method
     * @name putMetadataFieldIntoEAV
     * @description extract the Metadata Fields from the JSON schema and stores each one in a dedicated 
     *              ATTRIBUTE table, for use in an EAV catalogue
     * @param {Integer} dataType - the id of the DataType
     */
    putMetadataFieldsIntoEAV: function(dataType) {
        
        // check whether the dataType effectively exists
        return DataType.findOne(dataType)
        
        // extract and store all metadata fields
        .then(function(foundType) {
            console.log("DataTypeService.putMetadataFieldsIntoEAV - found type" + foundType);
            var fields = DataTypeService.getFlattenedFields(foundType, false);
            return transactionHandler.putMetadataFieldsIntoEAV(foundType.id, fields);
        })
        .then(function(inserted) {
            console.log("new EavAttributes inserted: " + inserted);
        })
        .catch(function(err) {
            console.log("DataTypeService.putMetadataFieldsIntoEAV - error caught");
        });
    
    },


};
module.exports = DataTypeService;
