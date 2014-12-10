/**
 * Biobank.js
 *
 * @description :: Biobank Model according to the MIABIS format
 */

module.exports = {

    attributes: {
        // MIABIS-01
        biobankID: {
            columnName: 'biobank_id',
            type: 'string'
        },
        // MIABIS-02
        acronym: {
            columnName: 'acronym',
            type: 'string',
        },
        // MIABIS-03
        name: {
            columnName: 'name',
            type: 'string',
            required: true
        },
        // MIABIS-04
        url: {
            columnName: 'url',
            type: 'string',
            url: true
        },
        // MIABIS-05
        juristicPerson: {
            columnName: 'juristic_person',
            type: 'string'
        },
        // MIABIS-06
        country: {
            columnName: 'country',
            type: 'string',
            minLength: 2,
            maxLength: 2
        },
        // MIABIS-07
        contactInformation: {
            columnName: 'contact_information',
            model: 'contactInformation'
        },
        // MIABIS-08
        description: {
            type: 'text'
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

