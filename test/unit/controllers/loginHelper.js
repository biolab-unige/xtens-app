"use strict";
/**
 * @method
 * @description login helper function for supertest
 */
module.exports.loginSuperAdmin = function(request, done) {
    const admin = fixtures.operator[0];
    const passport = _.find(fixtures.passport, {
        'user': admin.id,
        'protocol': 'local'
    });

    sails.log("Xtens.test - superadmin and local passport is: ");
    sails.log(admin);
    sails.log(passport);

    request(sails.hooks.http.app)
    .post('/login')
    .send({identifier: admin.login, password: passport.password})
    .end(function(err, res) {
        if (err) {
            sails.log.error("Xtens.test - login failed");
            sails.log.error(err.message);
            done(err);
        }
        var token =  res.body && res.body.token;
        sails.log("Bearer token is: " + token);
        done(token);
        return;
    });
};

module.exports.loginAdminUser = function(request, done) {
    const admin = fixtures.operator[1];
    const passport = _.find(fixtures.passport, {
        'user': admin.id,
        'protocol': 'local'
    });

    sails.log("Xtens.test - admin and local passport is: ");
    sails.log(admin);
    sails.log(passport);

    request(sails.hooks.http.app)
    .post('/login')
    .send({identifier: admin.login, password: passport.password})
    .end(function(err, res) {
        if (err) {
            sails.log.error("Xtens.test - login failed");
            sails.log.error(err.message);
            done(err);
        }
        var token =  res.body && res.body.token;
        sails.log("Bearer token is: " + token);
        done(token);
        return;
    });
};


module.exports.loginStandardUser = function(request, done) {
    const demouser = fixtures.operator[2];
    const passport = _.find(fixtures.passport, {
        'user': demouser.id,
        'protocol': 'local'
    });

    sails.log("Xtens.test - demouser and local passport is: ");
    sails.log(demouser);
    sails.log(passport);

    request(sails.hooks.http.app)
    .post('/login')
    .send({identifier: demouser.login, password: passport.password})
    .end(function(err, res) {
        if (err) {
            sails.log.error("Xtens.test - login failed");
            sails.log.error(err.message);
            done(err);
        }
        var token =  res.body && res.body.token;
        sails.log("Bearer token is: " + token);
        done(token);
        return;
    });
};

module.exports.loginAnotherStandardUser = function(request, done) {
    const demouser = fixtures.operator[3];
    const passport = _.find(fixtures.passport, {
        'user': demouser.id,
        'protocol': 'local'
    });

    sails.log("Xtens.test - demouser and local passport is: ");
    sails.log(demouser);
    sails.log(passport);

    request(sails.hooks.http.app)
    .post('/login')
    .send({identifier: demouser.login, password: passport.password})
    .end(function(err, res) {
        if (err) {
            sails.log.error("Xtens.test - login failed");
            sails.log.error(err.message);
            done(err);
        }
        var token =  res.body && res.body.token;
        sails.log("Bearer token is: " + token);
        done(token);
        return;
    });
};

module.exports.loginAnotherStandardUserNoDataSens = function(request, done) {
    const demouser = fixtures.operator[4];
    const passport = _.find(fixtures.passport, {
        'user': demouser.id,
        'protocol': 'local'
    });
    sails.log("Xtens.test - demouser and local passport is: ");
    sails.log(demouser);
    sails.log(passport);

    request(sails.hooks.http.app)
    .post('/login')
    .send({identifier: demouser.login, password: passport.password})
    .end(function(err, res) {
        if (err) {
            sails.log.error("Xtens.test - login failed");
            sails.log.error(err.message);
            done(err);
        }
        var token =  res.body && res.body.token;
        sails.log("Bearer token is: " + token);
        done(token);
        return;
    });
};

module.exports.loginUserNoPrivileges = function(request, done) {
    const user = fixtures.operator[7];
    const passport = _.find(fixtures.passport, {
        'user': user.id,
        'protocol': 'local'
    });

    sails.log("Xtens.test - user and local passport is: ");
    sails.log(user);
    sails.log(passport);

    request(sails.hooks.http.app)
    .post('/login')
    .send({identifier: user.login, password: passport.password})
    .end(function(err, res) {
        if (err) {
            sails.log.error("Xtens.test - login failed");
            sails.log.error(err.message);
            done(err);
        }
        var token =  res.body && res.body.token;
        sails.log("Bearer token is: " + token);
        done(token);
        return;
    });
};
