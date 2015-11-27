/**
* DataTypePrivileges.js
*
* @description :: TODO: Many-to-maty through association DataType-Group with privilegeLevel
*/

var DataTypePrivileges = {

  tableName: 'datatype_privilege',
  //schema:true,

  attributes:{

    dataType:{
      model:'dataType',
      columnName:'data_type'
    },

    group:{
      model:'group',
      columnName:'xtens_group'
        },

    privilegeLevel:{
      type:'string',
      required: true,
      defaultsTo: sails.config.xtens.constants.DataGroupPrivilegeLevels.VIEW,
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
