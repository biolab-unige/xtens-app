/**
* GroupsOperator.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

var GroupsOperator = {
    table_name : 'groupsoperator',

    attributes:{

        id_group:
            {
            type:'int',
            columnName:'id_group'
        },

        id_operator:
            {
            type:'int',
            columnName:'id_operator'
        },

        createdAt: {
            columnName: 'created_at'
        },
        updatedAt: {
            columnName: 'updated_at'

        }
    }
};

module.exports = GroupsOperator;

