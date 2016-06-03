/**
 * @method
 * @description login helper function for supertest
 */
module.exports.login = function(request, done) {
    const admin = fixtures.operator[0];
    const passport = _.find(fixtures.passport, {
        'user': admin.id,
        'protocol': 'local'
    });

    sails.log("DataController.test - admin and local passport is: ");
    sails.log(admin);
    sails.log(passport);

    request(sails.hooks.http.app)
    .post('/login')
    .send({identifier: admin.login, password: passport.password})
    .end(function(err, res) {
        if (err) {
            sails.log.error("DataController.test - login failed");
            sails.log.error(err.message);
            done(err);
        }
        console.log(res.body);
        token = res.body && res.body.token;
        sails.log("Bearer token is: " + token);
        done(token);
    });
};
