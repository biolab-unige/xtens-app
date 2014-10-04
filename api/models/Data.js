/**
 * Data.js
 * 
 * @author      :: Massimiliano Izzo
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */

var Data = {

    attributes: {

        type: {
            model: 'dataType'
        },
        date: {
            type: 'date',
            columnName: 'acquisition_date'
        },
        tags: {
            type: 'json',
            columnName: 'tags'
        },
        notes: {
            type: 'text',
            columnName: 'notes'
        },
        metadata: {
            type: 'json',
            required: true,
            columnName: 'metadata'
        },
        createdAt: {
            columnName: 'created_at'
        },
        updatedAt: {
            columnName: 'updated_at'
        }

    }
};
module.exports = Data;
