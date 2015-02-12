/**
 * EavValueFloatSubject.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */

module.exports = {

    tableName: 'eav_value_float_subject',

    attributes: {

        entity: {
            model: 'subject',
            required: true,
        },

        attribute: {
            model: 'eavAttribute',
            required: true
        },

        value: {
            type: 'float',
            required: true
        },

        unit: {
            type: 'string'
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

