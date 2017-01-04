/**
 * @author Massimiliano Izzo
 */
/* jshint node: true */
"use strict";

/**
 *  @description XTENS configuration parameters
 */
module.exports.xtens = {

    name: 'xtens',

    /***
     * constants of the XTENS platform
     */
    constants: {

        /**
         * @description available sex options
         */
        SexOptions: {
            MALE: 'M',
            FEMALE: 'F',
            UNAVAILABLE: 'N.A.',
            UNKNOWN: 'N.D.',
            UNDIFFERENTIATED: 'UNDIFFERENTIATED'
        },

        /**
         * @description available Group privilege statuses
         */
        GroupPrivilegeLevels: {
            WHEEL: 'wheel', // superusers
            ADMIN: 'admin', // can edit DataTypes/Biobanks and so on
            STANDARD: 'standard'
        },

        /**
         * @description available Datatype-Group privilege statuses
         */
        DataTypePrivilegeLevels: {
            VIEW_OVERVIEW: 'view_overview', // level 0
            VIEW_DETAILS: 'view_details', // level 1
            DOWNLOAD: 'download', // level 2
            EDIT: 'edit' // level 3
        },

        /**
         * @description available DataType models (i.e. classes/relations/collections in the database)
         */
        DataTypeClasses: {
            SUBJECT: 'Subject',
            SAMPLE: 'Sample',
            DATA: 'Data'
        },

        FieldTypes: {
            TEXT: 'Text',
            INTEGER: 'Integer',
            FLOAT: 'Float',
            BOOLEAN: 'Boolean',
            DATE: 'Date'
        },

        EavValueTableMap: {
            'Text': 'eav_value_text',
            'Integer': 'eav_value_integer',
            'Float': 'eav_value_float',
            'Boolean': 'eav_value_boolean',
            'Date': 'eav_value_date'
        },

        DATA: 'DATA',
        DATA_TYPE: 'DATA TYPE',
        METADATA_FIELD: 'METADATA FIELD',
        METADATA_LOOP: 'METADATA LOOP',
        METADATA_GROUP: 'METADATA GROUP',
        STRING: 'string',
        PERSONAL_DETAILS: 'Personal Details',
        SUBJECT_PROPERTIES: ['code', 'sex'],
        SAMPLE_PROPERTIES: ['biobankCode'],

        PATH_SEPARATOR: '/',        // UNIX/Unix-like path separator

        // min and max values for PopulateService tests
        TEST_MIN: 0.0,
        TEST_MAX: 100.0,

        DEFAULT_LOCAL_STORAGE: 'assets/dataFiles'
        // DEFAULT_LOCAL_STORAGE: '/var/xtens/dataFiles'

    }

};

Object.defineProperty(global, '__stack', {
    get: function() {
        let orig = Error.prepareStackTrace;

        Error.prepareStackTrace = function(_, stack) {
            return stack;
        };

        let err = new Error();

        Error.captureStackTrace(err, err.constructor);

        let stack = err.stack;

        Error.prepareStackTrace = orig;

        return stack;
    }
});

Object.defineProperty(global, '__line', {
    get: function() {
        return global.__stack && global.__stack[1] && global.__stack[1].getLineNumber();
    }
});

Object.defineProperty(global, '__function', {
    get: /*istanbul ignore next*/ function() {
        return global.__stack && global.__stack[1] && global.__stack[1].getFunctionName();
    }
});
