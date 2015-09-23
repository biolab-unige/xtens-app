/** 
 *  @module
 *  @name DataTypeService
 *  @author Massimiliano Izzo
 */
var Joi = require("joi");
var constants = sails.config.xtens.constants;
var transactionHandler = sails.config.xtens.transactionHandler;

var DataTypeService = {

    /**
     * @method
     * @name validateMetadataField
     */
    validateMetadataField: function(field) {
        var metadataFieldValidationSchema = Joi.object().keys({
                name: Joi.string().required(),
                formattedName: Joi.string().required(),
                fieldType: Joi.string().required().valid(_.values(constants.FieldTypes)),
                label: Joi.string().required().valid(constants.METADATA_FIELD),
                isList: Joi.boolean().required(),
                possibleValues: Joi.array().allow(null),
                hasUnit: Joi.boolean().required(),
                possibleUnits: Joi.array().allow(null),
                required: Joi.boolean().required(),
                sensitive: Joi.boolean().default(false),
                visible: Joi.boolean().default(true),
                hasRange: Joi.boolean().required(),
                min: Joi.number().allow(null),
                max: Joi.number().allow(null),
                step: Joi.number().allow(null),
                customValue: Joi.any().allow(null),
                ontologyUri: Joi.string().allow(null),
                _loop: Joi.boolean()     // optional boolean field that specifies whether the current field belongs to a metadata loop
        });
        return Joi.validate(field, metadataFieldValidationSchema);
    },

    /**
     * @method
     * @name validate
     * @description validata a DataType, especially its schema
     * @param{Object} dataType - the data type to be validated
     * @param{boolean} performSchemaValidation - if true perform also DataType schema validation
     * @return {Object} - the result object contains two properties:
     *                      - error: null if the DataType is validated, an Error object otherwise
     *                      - value: the validated DataType object if no error is returned
     */
    validate: function(dataType, performSchemaValidation) {

        var validationSchema = {
            id: Joi.number().integer().positive(),
            name: Joi.string().required(),
            model: Joi.string().required().valid(_.values(constants.DataTypeClasses)),
            schema: Joi.object().required(),
            parents: Joi.array().allow(null),
            children: Joi.array().allow(null),
            data: Joi.array().allow(null),
            createdAt: Joi.date(),
            updatedAt: Joi.date()
        };

        if (performSchemaValidation) {

            var metadataFieldValidationSchema = Joi.object().keys({
                name: Joi.string().required(),
                formattedName: Joi.string().required(),
                fieldType: Joi.string().required().valid(_.values(constants.FieldTypes)),
                label: Joi.string().required().valid(constants.METADATA_FIELD),
                isList: Joi.boolean().required(),
                possibleValues: Joi.array().allow(null),
                hasUnit: Joi.boolean().required(),
                possibleUnits: Joi.array().allow(null),
                required: Joi.boolean().required(),
                sensitive: Joi.boolean().default(false),
                visible: Joi.boolean().default(true),
                hasRange: Joi.boolean().required(),
                min: Joi.number().allow(null),
                max: Joi.number().allow(null),
                step: Joi.number().allow(null),
                customValue: Joi.any().allow(null),
                ontologyUri: Joi.string().allow(null),
                _loop: Joi.boolean()     // optional boolean field that specifies whether the current field belongs to a metadata loop
            });

            var metadataLoopValidationSchema = Joi.object().keys({
                name: Joi.string().required(),
                label: Joi.string().required().valid(constants.METADATA_LOOP),
                content: Joi.array().required().items(metadataFieldValidationSchema)
            });

            var metadataGroupValidationSchema = Joi.object().keys({
                name: Joi.string().required(),
                label: Joi.string().required().valid(constants.METADATA_GROUP),
                content: Joi.array().required().items(metadataLoopValidationSchema, metadataFieldValidationSchema)
            });

            var metadataHeaderValidationSchema = Joi.object().keys({
                name: Joi.string().required(),
                description: Joi.string().required(),
                model: Joi.string().valid(_.values(constants.DataTypeClasses)),
                fileUpload: Joi.boolean().required(),
                version: Joi.string().allow(""),
                ontology: Joi.string().allow("")
            });

            validationSchema.schema = Joi.object().required().keys({
                header: metadataHeaderValidationSchema,
                body: Joi.array().required().items(metadataGroupValidationSchema)
            });


        }

        validationSchema = Joi.object().keys(validationSchema);
        return Joi.validate(dataType, validationSchema);

    },

    /**
     * @method
     * @name getChildrenRecursive
     * @description given a list (array) of DataType find recursively all the children data types
     * @param{Array} parents - an array of DataType whose children are to be sought
     * @return{Array} an array of children data types
     */

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
        var statement = ['SELECT d.id, d.name, d.schema FROM data_type d ',
                'INNER JOIN datatype_groups__group_datatypes dggd ON d.id = dggd.datatype_groups ',
                'INNER JOIN xtens_group g ON g.id = dggd."group_dataTypes" ',
                'INNER JOIN group_members__operator_groups gmog ON g.id = gmog.group_members ',
                'INNER JOIN operator o ON o.id = gmog.operator_groups '].join("");
        var whereClause = 'WHERE o.id = $1 AND d.model = $2';
        var vals = [idOperator, params.model];

        if (params.idDataType) {
            statement = [statement, 'INNER JOIN datatype_children__datatype_parents dcdp ON dcdp.datatype_parents = d.id ',
                'INNER JOIN data_type dp ON dp.id = dcdp.datatype_children '].join();
            whereClause = whereClause + ' AND dp.id = $3';
            vals.push(params.idDataType);
        }
        else if (params.idDataTypes) {
            var idDataTypes = params.idDataTypes.split(',').map(function(val) {return _.parseInt(val);});
            var fragments = [];
            for (var i=0; i<idDataTypes.length; i++) {
                fragments.push('$' + (vals.length + i + 1));
            } 
            whereClause += ' AND d.id IN (' + fragments.join(",") + ')';
            vals.push(idDataTypes);
            vals = _.flatten(vals);
        }
        
        DataType.query({
            // name: 'findDataTypeByOperator',
            text: [statement, whereClause, ';'].join(""),
            /*
            text: ['SELECT d.id, d.name, d.schema FROM data_type d ',
                'INNER JOIN datatype_groups__group_datatypes dggd ON d.id = dggd.datatype_groups ',
                'INNER JOIN xtens_group g ON g.id = dggd."group_dataTypes" ',
                'INNER JOIN group_members__operator_groups gmog ON g.id = gmog.group_members ',
                'INNER JOIN operator o ON o.id = gmog.operator_groups ',
                'WHERE o.id = $1 AND d.model = $2;'
            ].join(""), */
            values: vals
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
                if (groupContent[j].label === constants.METADATA_FIELD) {
                    flattened.push(groupContent[j]);
                }
                else if (groupContent[j].label === constants.METADATA_LOOP && !skipFieldsWithinLoops) {
                    var loopContent = groupContent[j] && groupContent[j].content;
                    for (var k=0; k<loopContent.length; k++) {
                        if (loopContent[k].label === constants.METADATA_FIELD) {

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
            return transactionHandler.putMetadataFieldsIntoEAV(foundType.id, fields, true);
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
