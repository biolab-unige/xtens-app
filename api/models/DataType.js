/**
 * DataType.js
 */
var DataType = {
    attributes: {
        id: {
            type: 'INTEGER',
            required: true
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
