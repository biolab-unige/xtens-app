/**
 * ContactInformation.js
 *
 * @description :: Contact Information according to the MIABIS format
 */

module.exports = {

    tableName: 'contact_information',

    attributes: {
        // MIABIS-07A
        givenName: {
            type: 'string',
            required: true,
            max: 64,
            alpha: true,
            columnName: 'given_name',
        },
        // MIABIS-07B
        surname: {
            type: 'string',
            required: true,
            max: 64,
            alpha: true,
            columnName: 'surname'
        },
        // MIABIS-07C
        phone: {
            type: 'string',
            required: true
        },
        // MIABIS-07D
        email: {
            type: 'email',
            required: true
        },
        // MIABIS-07E
        address: {
            type: 'text',
            required: true
        },
        // MIABIS-07F
        zip: {
            type: 'string',
            required: true
        },
        // MIABIS-07G
        city: {
            type: 'string',
            alpha: true,
            required: true
        },
        // MIABIS-07H
        country: {
            type: 'string',
            alpha: true,
            required: true,
            minLength: 2,
            maxLength: 2
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

