/**
* DataFile.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {
    
    tableName: 'data_file',

  attributes: {

        uri: {
            type: 'text',
            required: true,
            unique: true,
            columnName: 'uri'
        },

        details: {
            type: 'json'
        },
        
        // many-to-many association with Data
        data: {
            collection: 'data',
            via: 'files'
        },

        // many-to-many association with Sample
        samples: {
            collection: 'sample',
            via: 'files'
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

