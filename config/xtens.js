var QueryBuilder = require('xtens-query').QueryBuilder;

module.exports.xtens = {
    
    name: 'xtens',
    queryBuilder: new QueryBuilder(),

    irods: {
        irodsRest: 'http://130.251.10.60:8080/irods-rest-4.0.2.1-SNAPSHOT/rest',
        irodsHome: '/biolabZone/home/superbiorods',
        repoColl: 'xtens-repo',
        landingColl: 'landing',
        username: 'superbiorods',
        password: 'superbio05!'
    }
    
};
