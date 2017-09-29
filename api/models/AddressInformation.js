/**
 * ContactInformation.js
 *
 * @description :: Contact Information according to the MIABIS format
 */

module.exports = {

    tableName: 'address_information',

    attributes: {
        // MIABIS-07C
        office: {
            type: 'string',
            required: true
        },
        phone: {
            type: 'string',
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
