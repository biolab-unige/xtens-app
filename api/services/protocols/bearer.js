/*
 * Bearer Authentication Protocol
 *
 * Bearer Authentication is for authorizing API requests. Once
 * a user is created, a token is also generated for that user
 * in its passport. This token can be used to authenticate
 * API requests.
 *
 */
var BluebirdPromise = require("bluebird");
var verifyTokenAsync = BluebirdPromise.promisify(require("../TokenService.js").verify);

exports.authorize = function(token, done) {
  /*
  Passport.findOne({ accessToken: token }, function(err, passport) {
    if (err) { return done(err); }
    if (!passport) { return done(null, false); }
    Operator.findOneById(passport.user, function(err, user) {
      if (err) { return done(err); }
      if (!user) { return done(null, false); }
      return done(null, user, { scope: 'all' });
    });
  }); */

    // verify that the token is valid and has not been tampered with
    verifyTokenAsync(token)

    // pass the payload to the next action
    .then(function(payload) {
        sails.log.verbose(payload);
        return done(null, payload, {scope: 'all'});
    })

    .catch(/* istanbul ignore next */ function(err) {
        sails.log.error(err);
        return done(err);
    });

};
