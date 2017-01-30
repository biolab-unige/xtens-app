"use strict";
const dbConnectionMap = new Map([
    ['sails-postgresql', 'xtens-pg'],
    ['sails-memory', 'xtens-waterline']
]);

module.exports = function persistence(sails) {

    this.crudManager = null;
    this.fileSystemManager = null;
    this.fileSystemConnections =  null;
    this.recursiveQueries = null;
    this.queryBuilder = null;

    return {

        defaults: {

        },

        configure: function() {

            const connection = sails.config.connections[sails.config.models.connection];
            const adapter = connection.adapter;
            this.fileSystemConnections =  sails.config.fileSystemConnections;
            const FileSystemManager = require('xtens-fs').FileSystemManager;
            this.fileSystemManager = new FileSystemManager(this.fileSystemConnections[this.fileSystemConnections.default]);

            const databaseManager = require(dbConnectionMap.get(adapter));
            this.crudManager = new databaseManager.CrudManager(null, connection, this.fileSystemConnections[this.fileSystemConnections.default]);
            this.queryBuilder = new databaseManager.QueryBuilder();
            this.recursiveQueries = databaseManager.recursiveQueries;
        },

        getDatabaseManager: function() {
            return {crudManager: this.crudManager, queryBuilder: this.queryBuilder, recursiveQueries: this.recursiveQueries};
        },

        getFileSystem: function() {
            return { manager: this.fileSystemManager, defaultConnection: this.fileSystemConnections[this.fileSystemConnections.default] };
        }

    };

};
