var Group = {
    tableName: 'xtens_group',
    schema:true,

    attributes: {

        name: {
            type: 'string',
            required: true,
            unique:true,
            columnName: 'name'
        },

        // there are three permission levels for user groups:
        // 1) wheel: superusers/superadmins
        // 2) admin: manager
        // 3) standard: basic privileges
        privilegeLevel: {
            type: 'string',
            required: true,
            defaultsTo: sails.config.xtens.constants.GroupPrivilegeLevels.STANDARD,
            enum: _.values(sails.config.xtens.constants.GroupPrivilegeLevels),
            columnName: 'privilege_level'
        },

        canAccessPersonalData: {
            type: 'boolean',
            defaultsTo: false,
            required: true,
            columnName: 'personal_data_access'
        },

        canAccessSensitiveData: {
            type: 'boolean',
            defaultsTo: false,
            required: true,
            columnName: 'sensitive_data_access'
        },

        createdAt: {
            type:'datetime',
            columnName: 'created_at'
        },

        updatedAt: {
            type:'datetime',
            columnName: 'updated_at'
        },

        members: {
            collection:'operator',
            via:'groups'
        },

        projects:{
            collection:'project',
            via:'groups'
        },

        dataTypes: {
            collection: 'dataType',
            via: 'groups',
            through:'datatypeprivileges'
        }

    }
};
module.exports = Group;
