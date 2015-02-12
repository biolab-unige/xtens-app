/**
 * EavValueText.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */

module.exports = {

    tableName: 'eav_value_text',

    attributes: {

        entityTable: {
            type: 'string',
            required: true,
            enum: ['subject', 'sample', 'data'],
            columnName: 'entity_table'
        },

        entityId: {
            type: 'integer',
            required: true,
            columnName: 'entity_id'
        },

        attribute: {
            model: 'eavAttribute',
            required: true
        },

        value: {
            type: 'string',
            required: true
        },
        /*
        unit: {
            type: 'string'
        }, */

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

