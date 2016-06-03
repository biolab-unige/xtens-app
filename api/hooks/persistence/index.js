const dbConnectionMap = new Map([
    ['sails-postgresql', 'xtens-pg'],
    ['sails-memory', 'xtens-waterline']
]);

module.exports = function persistence() {

    this.crudManager = null;

    return {

        defaults: {

        },

        configure: function() {
            const connection = sails.config.connections[sails.config.models.connection];
            const adapter = connection.adapter;
            const fileSystemConnections =  sails.config.fileSystemConnections;
            sails.log.debug(adapter);
            const databaseManager = require(dbConnectionMap.get(adapter));
            sails.log.debug(databaseManager);
            this.crudManager = new databaseManager.CrudManager(null, connection, fileSystemConnections[fileSystemConnections.default]);
            sails.log.debug(this.crudManager);
        },

        getCrudManager: function() {
            return crudManager;
        }

    };

};
