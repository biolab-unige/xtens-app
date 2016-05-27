/* jshint node: true */
/* globals _, __filename__, sails, Project, Subject, Data, isEmail, Operator,Passport, DataType, SubjectService, TokenService, QueryService, DataService */
'use strict';
var validator = require('validator');
var crypto = require('crypto');
var ValidationError = require('xtens-utils').Errors.ValidationError;
let BluebirdPromise = require('bluebird');
/**
 * Local Authentication Protocol
 *
 * The most widely used way for websites to authenticate users is via a username
 * and/or email as well as a password. This module provides functions both for
 * registering entirely new users, assigning passwords to already registered
 * users and validating login requesting.
 *
 * For more information on local authentication in Passport.js, check out:
 * http://passportjs.org/guide/username-password/
 */


exports.register = function(user, next) {
    exports.createUser(user, next);
};

/**
 * Register a new user
 *
 * This method creates a new user from a specified email, username and password
 * and assign the newly created user a local Passport.
 *
 * @param {Object}   _user
 * @param {Function} next
 */
exports.createUser = function(_user, next) {

    var password = _user.password;
    delete _user.password;
    console.log(password);
  /*
     if (!email) {
     req.flash('error', 'Error.Passport.Email.Missing');
     return next(new Error('No email was entered.'));
     }

     if (!username) {
     req.flash('error', 'Error.Passport.Username.Missing');
     return next(new Error('No username was entered.'));
     }

     if (!password) {
     req.flash('error', 'Error.Passport.Password.Missing');
     return next(new Error('No password was entered.'));
     } */

    Operator.create(_user, function(err, operator) {
        if (err) {
            if (err.code === 'E_VALIDATION') {

                sails.log(err);

                if (err.invalidAttributes.email) {
                    return next(new Error('Error.Passport.Email.Exists'));
                } else {
                    return next(new Error('Error.Passport.User.Exists'));
                }
            }

            return next(err);
        }

    // Generating accessToken for API authentication
    // var token = crypto.randomBytes(48).toString('base64');
        var payload = operator.formatForTokenPayload(operator);
        var token = TokenService.issue(_.isObject(payload) ? JSON.stringify(payload) : payload); // modified by Massi

        Passport.create({
            protocol: 'local',
            password: password,
            user: operator.id,
            accessToken: token
        }, function(err, passport) {
            if (err) {
                if (err.code === 'E_VALIDATION') {
                    err = new Error('Error.Passport.Password.Invalid');
                }

                return operator.destroy(function(destroyErr) {
                    next(destroyErr || err);
                });
            }

            next(null, operator);
        });

    });

};

/**
 * Assign local Passport to user
 *
 * This function can be used to assign a local Passport to a user who doens't
 * have one already. This would be the case if the user registered using a
 * third-party service and therefore never set a password.
 *
 * @param {Object}   req
 * @param {Object}   res
 * @param {Function} next
 */
exports.connect = function(req, res, next) {
    var user = req.user,
        password = req.param('password');

    Passport.findOne({
        protocol: 'local',
        user: user.id
    }, function(err, passport) {
        if (err) {
            return next(err);
        }

        if (!passport) {
            Passport.create({
                protocol: 'local',
                password: password,
                user: user.id
            }, function(err, passport) {
                next(err, user);
            });
        } else {
            next(null, user);
        }
    });
};

/**
 * Validate a login request
 *
 * Looks up a user using the supplied identifier (email or username) and then
 * attempts to find a local Passport associated with the user. If a Passport is
 * found, its password is checked against the password supplied in the form.
 *
 * @param {Object}   req
 * @param {string}   identifier
 * @param {string}   password
 * @param {Function} next
 */
exports.login = function(req, identifier, password, next) {
    var isEmail = validator.isEmail(identifier),
        query = {};

    if (isEmail) {
        query.email = identifier;
    } else {
        query.login = identifier;
    }

    Operator.findOne(query).populate('groups').exec(function(err, user) {
        if (err) {
            return next(err);
        }

        if (!user) {
            if (isEmail) {
                err = new Error('Error.Passport.Email.NotFound');
            } else {
                err = new Error('Error.Passport.Username.NotFound');
            }

            return next(null, false);
        }

        Passport.findOne({
            protocol: 'local',
            user: user.id
        }, function(err, passport) {
            if (passport) {
                passport.validatePassword(password, function(err, res) {
                    if (err) {
                        return next(err);
                    }

                    if (!res) {
                        err = new Error('Error.Passport.Password.Wrong');
                        return next(null, false);
                    } else {
                        return next(null, user);
                    }
                });
            } else {
        // next line commented out by Massi
        // req.flash('error', 'Error.Passport.Password.NotSet');
                return next(null, false);
            }
        });
    });
};

/**
 * Modify a user Password
 *
 * Attempts to find a local Passport associated with the user. If a Passport is
 * found, its password is checked against the password supplied in the form,
 * then is checked the new password with the confirm new password. If
 * matching then update passport with the new password.
 *
 * @param {Object}   param
 * @param {integer}  idOperator
 * @param {Function} next
 */
/*eslint no-unreachable: 0*/
exports.updatePassword = function(param, idOperator, next) {

    var password = param.oldPass;
    var newPass = param.newPass;
    var cnewPass = param.cnewPass;

    Passport.findOne({
        protocol: 'local',
        user: idOperator
    })
    .then(function(passport) {
        var passValidatePassword = BluebirdPromise.promisify(passport.validatePassword, passport);

      //Validate the old password inserted by user
        return passValidatePassword(password).then(function(res) {
            console.log("IDPASSPORT: " + passport.id + " PASSPORT: " + JSON.stringify(passport));

            if (!res) {
                var err = new ValidationError('Old Password do Not Match');
                console.log(next(err,false));
                return next(err, false);
            }
        // control if newPass and confirmNewPass match
            if (newPass !== cnewPass) {
                var errn = new ValidationError('New Passwords do Not Match');
                return next(errn, false);
            }
        //If New Passwords match, update passport with the new password
            passport.password = newPass;
            return Passport.update({
                id: passport.id
            }, passport)

            .then(function(passport) {
                console.log(next(null,passport));
                return next(null, passport);
            }).catch(function(err) {
                return next(err, false);
            });
        }).catch(function(err) {
            return next(err, false);
        });

    }).catch(function(err) {
        err = next(new Error('Passport not found'));
        return next(null, false);
    });

};
