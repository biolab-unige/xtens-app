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
            column_name: 'biobank_code'
        },

        materialType: {
            model: 'dataType',
            columnName: 'material_type'  
        },

        donor: {
            model: 'subject',
        },

        parentSample: {
            model: 'sample',
            columnName: 'parent_sample'
        },

        metadata: {
            type: 'json',
            required: true
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

