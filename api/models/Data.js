/**
 * Data.js
 * 
 * @author      :: Massimiliano Izzo
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */

var Data = {

    attributes: {
        // type one-way association to DataType
        type: {
            model: 'dataType'
        },
        date: {
            type: 'date',
            columnName: 'acquisition_date'
        },
        tags: {
            type: 'json',
            columnName: 'tags',
            array: true
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
        // if the parent is a patient
        parentSubject: {
            model: 'subject',
            columnName: 'parent_subject'
        },
        // if the "parent" is a sample
        parentSample: {
            model: 'sample',
            columnName: 'parent_sample'
        },
        // if the "parent" is a generic data
        parentData: {
            model: 'data',
            columnName: 'parent_data'
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
module.exports = Data;
