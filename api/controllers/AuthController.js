/**
 * AuthController
 *
 * @description :: Server-side logic for managing authentication (and authorisation)
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */
/* jshint esnext:true */
/* jshint node:true */
/* globals _, sails, PassportService, TokenService, Passport */

"use strict";
let AuthController = {


    /**
     * @method
     * @name callback
     * @param {Object} req
     * @param {Object} res
     * @mutuated from
     */

    login: function(req, res) {
        console.log("AuthController - here we are");

        let protocol = req.param("protocol") || 'local';

        PassportService.callback(req, res, function (err, results) {
            // If an error was thrown, return the JSON content of the error
            /* istanbul ignore if */
            if (err) {
                // sails.log.verbose('Authentication error thrown');
                sails.log.verbose(err);
                return res.json(err.code, err);
            }
            // if (err && err.code === 400) {
            //     sails.log.verbose('Missing identifier or password parameter');
            //     sails.log.verbose(err);
            //     return res.json(400, err);
            // }
            // // if no user was found return 401 - user not authenticated
            // if (!operator && err && err.code === 401) {
            //     sails.log.verbose('User authentication failed');
            //     return res.json(401, {'message':'User authentication failed'});
            // }
            else {
                // Upon successful login, send back user data and JWT token
                // sails.services.logger.login(user, req);
                let operator = results.user;
                let payload = operator.formatForTokenPayload();
                operator = operator.toJSON();
                operator.groups = results.groups;
                console.log("AuthController - successfully logged in");
                return res.json(200, {
                    user: operator,
                    token: TokenService.issue(_.isObject(payload) ? JSON.stringify(payload) : payload)
                });

            }
        });
    },

    /**
     * @method
     * @name logout
     * @param {Object} req
     * @param {Object} res
     * @mutuated from
     */
    logout: function(req, res) {

        let protocol = req.param("protocol") || 'local';
        let user = req.param("user");

        Passport.findOne({protocol: protocol, user: user.id})

        .then(function(passport) {
            if (!passport) {
                return passport;
            }

            passport.accessToken = null;
            return Passport.update({id:passport.id},passport);


        })

        .then(function(passport) {
            if (!passport) {
                return res.json(400,"User not logged");
            }
            return res.ok("User successfully logged out.");
        })

        .catch(/* istanbul ignore next */ function(err) {
            sails.log.error(err);
            return res.serverError("Caught some error while disconnecting the user");
        });
    }

};

module.exports = AuthController;
