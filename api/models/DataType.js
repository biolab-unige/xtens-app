/**
 * DataType.js
 */
var DataType = {
    tableName: 'data_type',
    attributes: {
        id: {
            type: 'INTEGER',
            required: true,
            autoIncrement: true,
            primaryKey: true,
            unique: true
            
        },
        name: {
            type: 'STRING',
            minLength: 4,
            maxLength: 32,
            required: true
        },
        schema: {
            type: 'JSON',
            required:true
        }
    }
};
