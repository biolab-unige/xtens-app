/**
 * AuthController
 *
 * @description :: Server-side logic for managing authentication (and authorisation)
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

var AuthController = {


    /**
     * @method
     * @name callback
     * @param {Object} req
     * @param {Object} res
     * @mutuated from 
     */

    login: function(req, res) {
        console.log("AuthController - here we are");

        var protocol = req.param("protocol") || 'local';

        PassportService.callback(req, res, function (err, operator) {
            // If an error was thrown, return the JSON content of the error
            if (err) {
                sails.log.verbose('Authentication error thrown');
                sails.log.verbose(err);
                return res.json(500, err);
            }
            // if no user was found return 401 - user not authenticated
            if (!operator) {
                sails.log.verbose('User authentication failed');
                return res.json(401, {'message':'User authentication failed'});
            }
            else {
                // Upon successful login, send back user data and JWT token
                // sails.services.logger.login(user, req);
                 
                console.log("AuthController - successfully logged in");
                return res.json(200, {
                    user: operator,
                    token: TokenService.issue(_.isObject(operator.id) ? JSON.stringify(operator.id) : operator.id)
                });
               
                /*
                Passport.findOne({ protocol: protocol, user: operator.id})
                
            
                .then(function(passport) {
                    passport.accessToken = TokenService.issue(_.isObject(operator.id) ? JSON.stringify(operator.id) : operator.id);
                    return Passport.update(passport);
                }) 

                .then(function(passport) {
                    return res.json(200, {
                        user: operator,
                        token: TokenService.issue(_.isObject(operator.id) ? JSON.stringify(operator.id) : operator.id)
                    });

                })
                
                .catch(function(err) {
                    return res.serverError("Error while authenticating. Please try again later.");
                }); */
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
        
        var protocol = req.param("protocol") || 'local';
        var user = req.user;

        Passport.findOne({protocol: protocol, user: user.id})

        .then(function(passport) {
            delete passport.accessToken;
            return Passport.update(passport);
        })

        .then(function(passport) {
            return res.ok("User successfully logged out.");
        })
        
        .catch(function(err) {
            return res.serverError("Caught some error while disconnecting the user");
        });
    }

};

module.exports = AuthController;
