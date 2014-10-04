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
            required:true,
            columnName: 'schema'
        },
        createdAt: {
            columnName: 'created_at'
        },
        updatedAt: {
            columnName: 'updated_at'
        },
        operators:{
           collection:'operator',
           via:'datatypes'
},
        // reference to Data
        datas: {
            collection: 'data',
            via: 'type'
        }
    }
};
module.exports = DataType;
