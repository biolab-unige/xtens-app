/**
 * Subject.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */

var Subject= {

    attributes: {

        code: {
            type:'string',
            required: true,
            unique: true
            //alphanumeric: true
        },

        sex: {
            type: 'string',
            required: true,
            enum: _.values(sails.config.xtens.constants.SexOptions)
        },

        // one-way association to PersonalDetails model
        personalInfo: {
            model: 'personalDetails',
            columnName: 'personal_info'
        },

        // one-way association to DataType model
        type: {
            model: 'dataType'
        },

        samples: {
            collection: 'sample',
            via: 'donor'
        },

        childrenData: {
            collection: 'data',
            via: 'parentSubject'
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
            required: false
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
module.exports = Subject;
