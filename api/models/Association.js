/**
* Association.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

var bcrypt = require('bcrypt');

var Association = {
    connection:'postgresql',
    tableName: 'association',
    attributes: {
        groups: {
            type: 'string',
            required: true,
            columnName: 'groups'
        },
       

        id_operator:{
            type:'int',
            columnName:'id_operator'
        },
createdAt: {
            columnName: 'created_at'
        },

        updatedAt: { 
            type: 'datetime', 
            defaultsTo: function (){ return new Date(); },
            columnName: 'updated_at'
        },
    }
};
module.exports = Association;

