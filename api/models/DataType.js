/**
 * DataType.js
 */
var DataType = {
    tableName: 'data_type',
    attributes: {
        name: {
            type: 'string',
            minLength: 4,
            maxLength: 32,
            required: true,
            columnName: 'name'
        },
        schema: {
            type: 'json',
            required:true,
            columnName: 'schema'
        },
        createdAt: {
            columnName: 'created_at'
        },
        updatedAt: {
            columnName: 'updated_at'
        }
    }
};
module.exports = DataType;
