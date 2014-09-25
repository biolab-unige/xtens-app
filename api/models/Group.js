var bcrypt = require('bcrypt');

var Group = {
    connection:'postgresql',
    tableName: 'groups',
    attributes: {
        name: {
            type: 'string',
            required: true,
            columnName: 'name'
        },
        createdAt: {
            columnName: 'created_at'
        },
        updatedAt: {
            columnName: 'updated_at'
        },
        
       data_type:{
             type:'text',
             columnName:'data_type'
},

        operators:{
            collection:'operator',
            via:'groups'
        }
    }
};
module.exports = Group;
