"use strict";
const dbConnectionMap = new Map([
    ['sails-postgresql', 'xtens-pg'],
    ['sails-memory', 'xtens-waterline']
]);

module.exports = function persistence(sails) {

    this.crudManager = null;
    this.fileSystemManager = null;
    this.fileSystemConnections =  null;
    return {

        defaults: {

        },

        configure: function() {
            const connection = sails.config.connections[sails.config.models.connection];
            const adapter = connection.adapter;
            this.fileSystemConnections =  sails.config.xtens.fileSystemConnections;
            const FileSystemManager = require('xtens-fs').FileSystemManager;
            // sails.log.debug(adapter);
            const databaseManager = require(dbConnectionMap.get(adapter));
            // sails.log.debug(databaseManager);
            this.crudManager = new databaseManager.CrudManager(null, connection, this.fileSystemConnections[this.fileSystemConnections.default]);
            this.fileSystemManager = new FileSystemManager(this.fileSystemConnections[this.fileSystemConnections.default]);
            // sails.log.debug(this.crudManager);
        },

        getCrudManager: function() {
            return this.crudManager;
        },

        getFileSystem: function() {
            return { manager: this.fileSystemManager, defaultConnection: this.fileSystemConnections[this.fileSystemConnections.default] };
        }

    };

};
