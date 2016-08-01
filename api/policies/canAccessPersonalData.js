/* globals, sails, TokenService */

/**
 * isWheel
 *
 * @module      :: Policy
 * @description :: Allow any user to manage PersonalData
 *
 * @docs        :: http://sailsjs.org/#!documentation/policies
 *
 */
module.exports = function(req, res, next) {

    var payload= TokenService.getToken(req);

    console.log("Called canAccessPersonalData Policy", payload);
    // User is allowed, proceed to the next policy,
    // or if this is the last policy, the controller
    if (payload.canAccessPersonalData) {
        return next();
    }

    // User is not allowed
    // (default res.forbidden() behavior can be overridden in `config/403.js`)

    // return next();
    return res.forbidden();

};
