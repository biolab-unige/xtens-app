/**
* Production environment settings
 *
 * This file can include shared settings for a production environment,
 * such as API keys or remote database passwords.  If you're using
 * a version control solution for your Sails app, this file will
 * be committed to your repository unless you add it to your .gitignore
 * file.  If your repository will be publicly viewable, don't add
 * any private information to this file!
 *
 */
 "use strict";

 let dbConnectionMap = new Map([
     ['sails-postgresql', 'xtens-pg']
 ]);
 let IrodsRestStrategy = require('xtens-fs').IrodsRestStrategy;
 let FileSystemManager = require('xtens-fs').FileSystemManager;

 let databaseConnections = require('../../local.js').connections;
 let connName = require('../../models.js').models.connection;

 let databaseManager = require(dbConnectionMap.get(databaseConnections[connName].adapter));
 let fileSystemConnections = require('../../local.js').fileSystemConnections;

// ES6 Map for customised data management
 let customisedDataMap = new Map();
 customisedDataMap.set('CGH', '../migrate-utils/createCGH.js');
 customisedDataMap.set('CBINFO', '../migrate-utils/updateCBInfo.js');

 module.exports = {

  /***************************************************************************
   * Set the default database connection for models in the production        *
   * environment (see config/connections.js and config/models.js )           *
   ***************************************************************************/

    //  models: {
    //      connection: 'connection',
    //      migrate: 'safe'
    //  },

  /***************************************************************************
   * Set the port in the production environment to 80                        *
   ***************************************************************************/

  // port: 80,

  /***************************************************************************
   * Set the log level in production environment to "silent"                 *
   ***************************************************************************/

  // log: {
  //   level: "silent"
  // }

     blueprints: {
         action: false,
         rest: true,
         shortcuts: false
     },

     /**
      *  @description XTENS configuration parameters
      */
     xtens: {

         fileSystemManager: new FileSystemManager(fileSystemConnections[fileSystemConnections.default]),

         fileSystemConnection: fileSystemConnections[fileSystemConnections.default],

         databaseManager: databaseManager,

         crudManager: new databaseManager.CrudManager(null, databaseConnections[connName], fileSystemConnections[fileSystemConnections.default]),

         queryBuilder: new databaseManager.QueryBuilder()
     }

 };
