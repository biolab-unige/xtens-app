/**
* EavValueDateData.js
*
* @author Massimiliano Izzo
* @description :: EAV Value Table for Date metadata fields
* @docs        :: 
*/

module.exports = {
    
    tableName: 'eav_value_date_data',

    attributes: {
        
        entity: {
            model: 'data',
            required: true
        },

        attribute: {
            model: 'eavAttribute',
            required: true
        },

        value: {
            type: 'date',
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

