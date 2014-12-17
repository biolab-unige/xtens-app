var QueryBuilder = require('xtens-query').QueryBuilder;
var IrodsRestStrategy = require('xtens-fs').IrodsRestStrategy;
var FileSystemManager = require('xtens-fs').FileSystemManager;
var irodsConf = require('./local.js').irodsConf;

/**
 *  @description XTENS configuration parameters
 */

module.exports.xtens = {
    
    name: 'xtens',
    
    queryBuilder: new QueryBuilder(),
    
    fileSystemManager: new FileSystemManager(new IrodsRestStrategy(irodsConf)),
    
    irods: irodsConf,

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
