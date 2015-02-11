var QueryBuilder = require('xtens-query').QueryBuilder;
var IrodsRestStrategy = require('xtens-fs').IrodsRestStrategy;
var FileSystemManager = require('xtens-fs').FileSystemManager;
var TransactionHandler = require('xtens-transact').TransactionHandler;
var connections = require('./local.js').connections;
var fileSystemConnections = require('./local.js').fileSystemConnections;

/**
 *  @description XTENS configuration parameters
 */
module.exports.xtens = {

    name: 'xtens',

    queryBuilder: new QueryBuilder(),

    fileSystemManager: new FileSystemManager(fileSystemConnections[fileSystemConnections.default]),

    transactionHandler: new TransactionHandler(null, connections[connections.default], fileSystemConnections[fileSystemConnections.default]),

    fileSystemConnection: fileSystemConnections[fileSystemConnections.default],

    /***
     * constants of the XTENS platform
     */
    constants: {

        SexOptions: {
            MALE: 'M',
            FEMALE: 'F',
            UNKNOWN: 'N.A.',
            UNDIFFERENTIATED: 'N.D'
        },

        DataTypeClasses: {
            SUBJECT: 'Subject',
            SAMPLE: 'Sample',
            GENERIC: 'Generic'
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
        
        // min and max values for PopulateService tests
        TEST_MIN: -1000.0,
        TEST_MAX: 1000.0

    }

};
