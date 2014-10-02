var bcrypt = require('bcrypt');

var Group = {
    connection:'postgresql',
    tableName: 'group',
    schema:true,
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
           
        }
           }
};
module.exports = Group;
