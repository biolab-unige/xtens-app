/**
 * @author Massimiliano Izzo
 */
var pg = require("pg");

var PostgresJSONQueryService = {

    getConnString: function() {
        var connection = sails.config.connections.postgresql;
        if (!connection) {
            return;
        }
        return "postgres://"+connection.user+":"+connection.password+"@"+connection.host+":"+connection.port+"/"+connection.database;
    },

    testJSONQuery: function() {
        var connString = this.getConnString();
        pg.connect(connString, function(err, client, done) {
            if(err) {
                return console.error('error fetching client from pool', err);
            }
            client.query("SELECT metadata FROM data WHERE (metadata->$1->'value'->>0)::float > 650", 
                         ["Radius"], function(err, result) {
                done();
                if(err) {
                    return console.error('error running query', err);
                }
                result.rows.forEach(function(row) {
                    console.log(row.metadata);
                });
            });
        });
    }

};
module.exports = PostgresJSONQueryService;
