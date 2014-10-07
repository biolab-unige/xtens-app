/**
 * PersonalData.js
 * @author      :: Massimiliano Izzo
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */

module.exports = {
    tableName: 'personal_details',
    attributes: {
        firstName: {
            type: 'string',
            required: true,
            max: 64,
            alpha: true,
            columnName: 'first_name',
        },
        lastName: {
            type: 'string',
            required: true,
            max: 64,
            alpha: true,
            columnName: 'last_name'
        },
        birthDate: {
            type: 'date',
            columnName: 'birth_date'
        },
        sex: {
            type: 'string',
            required: true,
            enum: ['M', 'F', 'N.A.']
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
