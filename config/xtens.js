var QueryBuilder = require('xtens-query').QueryBuilder;

module.exports.xtens = {
    
    name: 'xtens',
    queryBuilder: new QueryBuilder(),

    irods: {
        irodsRest: {
            hostname: '130.251.10.60',
            port: 8080,
            path: '/irods-rest-4.0.2.1-SNAPSHOT/rest'
        },
        irodsHome: '/biolabZone/home/superbiorods',
        repoColl: 'xtens-repo',
        landingColl: 'landing',
        username: 'superbiorods',
        password: 'superbio05!'
    }
    
};
