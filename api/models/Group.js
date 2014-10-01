var bcrypt = require('bcrypt');

var Group = {
    connection:'postgresql',
    tableName: 'groups',
    attributes: {
        name: {
            type: 'string',
            required: true,
            unique:true,
            columnName: 'name'
        },
        createdAt: {
            columnName: 'created_at'
        },
        updatedAt: {
            columnName: 'updated_at'
        },
        
        operators:
            {
            collection:'operator',
            via:'groups',
            dominant:true
        }
           }
};
module.exports = Group;
