/**
 * DataType.js
 */
var DataType = {
    tableName: 'data_type',
    attributes: {
        name: {
            type: 'string',
            minLength: 3,
            maxLength: 32,
            required: true,
            columnName: 'name'
        },
        schema: {
            type: 'json',
            required: true,
            columnName: 'schema'
        },
        classTemplate: {
            type: 'string',
            required: true,
            enum: ['Subject', 'Sample', 'Generic'],
            defaultsTo: 'Generic',
            columnName: 'class_template'
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
        // many-to-may association with Group
        groups: {
            collection: 'group',
            via: 'dataTypes'
        }
    }
};
module.exports = DataType;
