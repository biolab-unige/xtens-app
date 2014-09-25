/**
 * GroupsDataType.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */

var GroupsDataType = {
    table_name : 'groupsdatatype',

    attributes:{

        id_group:
            {
            type:'int',
            columnName:'id_group'
        },

        id_datatype:
            {
            type:'int',
            columnName:'id_datatype'
        },

        createdAt: {
            columnName: 'created_at'
        },
        updatedAt: {
            columnName: 'updated_at'

        }
    }
};

module.exports = GroupsDataType;

