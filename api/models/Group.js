var bcrypt = require('bcrypt');

var Group = {
    tableName: 'groups',
    attributes: {
        name: {
            type: 'string',
            required: true,
            columnName: 'name'
        },
        createdAt: {
	    type: 'datetime',
            defaultsTo: function (){ return new Date(); },
            columnName: 'created_at'
        },
        updatedAt: {
            columnName: 'updated_at'
        }
    }
};
module.exports = Group;
