/**
 * PersonalData.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */

module.exports = {

    attributes: {
        firstName: {
            type: 'STRING',
            required: true,
            max: 64
        },
        lastName: {
            type: 'STRING',
            required: true,
            max: 64
        },
        birthDate: {
            type: 'DATE'
        },
        sex: {
            type: 'STRING',
            enum: ['M', 'F', 'N.A.']
        }
    }
};

