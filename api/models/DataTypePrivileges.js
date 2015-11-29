/**
 * DataTypePrivileges.js
 *
 * @description :: TODO: Many-to-maty through association DataType-Group with privilegeLevel
 */

var DataTypePrivileges = {

    tableName: 'datatype_privileges',
    //schema:true,

    attributes:{

        dataType: {
            model:'dataType',
            required: true,
            columnName:'data_type'
        },

        group: {
            model:'group',
            required: true,
            columnName:'xtens_group'
        },

        privilegeLevel: {
            type:'string',
            required: true,
            defaultsTo: sails.config.xtens.constants.DataGroupPrivilegeLevels.VIEW_OVERVIEW,
            enum: _.values(sails.config.xtens.constants.DataGroupPrivilegeLevels),
            columnName: 'privilege_level'
        },

        createdAt: {
            type: 'datetime',
            columnName: 'created_at'
        },

        updatedAt: {
            type: 'datetime',
            columnName: 'updated_at'
        }
    }
};

module.exports = DataTypePrivileges;
