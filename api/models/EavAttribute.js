/**
* EavAttribute.js
*
* @author Massimiliano Izzo
* @description :: Metadata Field model for the EAV catalogue (mostly for testing/development)
* @docs        :: TODO
*/

module.exports = {

    tableName: 'eav_attribute',

    attributes: {

        name: {
            type: 'string',
            minLength: 2,
            maxLength: 32,
            required: true
        },

        dataType: {
            model: 'dataType',
            columnName: 'data_type'
        },

        loop: {
            model: 'eavLoop'
        },

        fieldType: {
            type: 'string',
            required: true,
            enum: _.values(sails.config.xtens.constants.FieldTypes),
            columnName: 'field_type'
        },

        hasUnit: {
            type: 'boolean',
            required: true,
            defaultsTo: false,
            columnName: 'has_unit'
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
