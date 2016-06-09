/* globals, sails, TokenService */

/**
 * isWheel
 *
 * @module      :: Policy
 * @description :: Allow any Admin user to access
 *
 * @docs        :: http://sailsjs.org/#!documentation/policies
 *
 */
module.exports = function(req, res, next) {

    var payload= TokenService.getToken(req);

    // User is allowed, proceed to the next policy,
    // or if this is the last policy, the controller
    if (payload.isAdmin) {
        return next();
    }

    // User is not allowed
    // (default res.forbidden() behavior can be overridden in `config/403.js`)

    // return next();
    return res.forbidden();

};
