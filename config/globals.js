/**
 * Global Variable Configuration
 * (sails.config.globals)
 *
 * Configure which global variables which will be exposed
 * automatically by Sails.
 *
 * For more information on configuration, check out:
 * http://links.sailsjs.org/docs/config/globals
 */

var _ = require('lodash');
module.exports.globals = {
    _: _,
    async: true,
    sails: true,
    services: true,
    models: true
};
