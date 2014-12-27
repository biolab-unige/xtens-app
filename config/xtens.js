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
    
    irods: fileSystemConnections[fileSystemConnections.default],

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
        }
    
    }
    
};
