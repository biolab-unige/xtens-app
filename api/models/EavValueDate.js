/**
* EavValueDate.js
*
* @author Massimiliano Izzo
* @description :: EAV Value Table for Date metadata fields
* @docs        :: 
*/

module.exports = {
    
    tableName: 'eav_value_date',

    attributes: {
        
        entityTable: {
            type: 'string',
            required: true,
            enum: ['subject', 'sample', 'data']
        },

        entityId: {
            type: 'integer',
            required: true
        },

        attribute: {
            model: 'eavAttribute',
            required: true
        },

        value: {
            type: 'date',
            required: true
        }

    }
};

