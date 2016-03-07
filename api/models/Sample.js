/**
 * Sample.js
 * @author      :: Massimiliano Izzo
 * @description :: This is the SAILS model describing a sample stored within a Biobank
 * @docs        :: http://sailsjs.org/#!documentation/models
 */

module.exports = {

    attributes: {

        biobankCode: {
            type: 'string',
            columnName: 'biobank_code',
            required: true
        },

        type: {
            model: 'dataType',
            columnName: 'type'
        },

        biobank: {
            model: 'biobank'
        },

        donor: {
            model: 'subject',
            columnName: 'parent_subject'
        },

        parentSample: {
            model: 'sample',
            columnName: 'parent_sample'
        },

        metadata: {
            type: 'json',
            required: true
        },

        tags: {
            type: 'json'
        },

        notes: {
            type: 'text'
        },

        // many-to-many association to files
        files: {
            collection: 'dataFile',
            via: 'samples',
            dominant: true
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
