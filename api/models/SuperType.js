/**
 * SuperType.js
 */
var SuperType = {
    tableName: 'super_type',
    attributes: {
        name: {
            type: 'text',
            required: true,
            columnName: 'name'
        },
        uri: {
            type: 'text',
            required: true,
            columnName: 'uri'
        },
        schema: {
            type: 'json',
            required: true,
            columnName: 'schema'
        },
        createdAt: {
            type: 'datetime',
            columnName: 'created_at'
        },
        updatedAt: {
            type: 'datetime',
            columnName: 'updated_at'
        }
    }
};

module.exports = SuperType;
