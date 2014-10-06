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
            columnName: 'created_at'
        },
        updatedAt: {
            columnName: 'updated_at'
        },
        // reference to Data
        datas: {
            collection: 'data',
            via: 'type'
        },
        // self-reference to parent DataType
        parent: {
            model: 'DataType'
        },
        children: {
            collection: 'DataType',
            via: 'parent'
        }
    }
};
module.exports = DataType;
