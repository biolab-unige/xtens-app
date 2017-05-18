/**
 * PersonalData.js
 * @author      :: Massimiliano Izzo
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */

module.exports = {
    tableName: 'personal_details',
    attributes: {

        givenName: {
            type: 'string',
            required: true,
            max: 64,
            alpha: true,
            columnName: 'given_name'
        },

        surname: {
            type: 'string',
            required: true,
            max: 64,
            alpha: true,
            columnName: 'surname'
        },

        birthDate: {
            // type: 'date',
            type: 'string',
            date: true,
            columnName: 'birth_date'
        },
        /*
        subject: {
            model: 'subject',
            required: true,
            via: 'personalInfo',
            dominant: true,
            columnName: 'subject'
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
