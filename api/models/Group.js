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
            type:'datetime'
           
        },
        updatedAt: {
            type:'datetime'  
        },
        
        members:
            {
            collection:'operator',
            via:'groups',
           
        }
           }
};
module.exports = Group;
