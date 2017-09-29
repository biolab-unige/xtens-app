/**
 * DataType.js
 */
var DataType = {
    tableName: 'data_type',
    attributes: {
        name: {
            type: 'string',
            minLength: 2,
            maxLength: 32,
            required: true,
            columnName: 'name'
        },
        superType: {
            model:'superType',
            columnName: 'super_type'
        },
        model: {
            type: 'string',
            required: true,
            enum: _.values(sails.config.xtens.constants.DataTypeClasses),
            defaultsTo: 'Data',
            columnName: 'model'
        },
        createdAt: {
            type: 'datetime',
            columnName: 'created_at'
        },
        updatedAt: {
            type: 'datetime',
            columnName: 'updated_at'
        },
        // reference to Data
        datas: {
            collection: 'data',
            via: 'type'
        },
        // self-reference to parent DataType(s)
        parents: {
            collection: 'dataType',
            via: 'children'
        },
        // self-reference to children DataType(s)
        children: {
            collection: 'dataType',
            via: 'parents'
        },
        // many-to-many association with Group
        groups: {
            collection: 'group',
            via: 'dataTypes',
            through:'datatypeprivileges'
        },

        project: {
            model: 'project',
            columnName: 'project'
            // via:'dataTypes'
        }
    },

        /**
         * @method
         * @name getFlattenedFields
         * @description flattens the metadata schema returning a 1D array containing all the metadata fields
         * @param {boolean} skipFieldsWithinLoops - if true skips all the metadatafields that are contained within metadata loops
         */
    getFlattenedFields: /*istanbul ignore next*/ function(skipFieldsWithinLoops) {
        var flattened = [];
        var body = _.isObject(this.superType) && this.superType.schema && this.superType.schema.body;

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
                            flattened.push(loopContent[k]);
                        }
                    }
                }

            }
        }
        return flattened;
    }


};
module.exports = DataType;
