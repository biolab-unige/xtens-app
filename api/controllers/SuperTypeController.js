/**
* SuperTypeController
*
* @description :: Server-side logic for managing supertypes
* @help        :: See http://links.sailsjs.org/docs/controllers
*/
/* jshint node: true */
/* globals _, sails, SuperType, SuperTypeService, TokenService, Group, Project */
"use strict";

const ControllerOut = require("xtens-utils").ControllerOut, ValidationError = require('xtens-utils').Errors.ValidationError;
const PrivilegesError = require('xtens-utils').Errors.PrivilegesError;
const crudManager = sails.hooks.persistence.crudManager;
const actionUtil = require('sails/lib/hooks/blueprints/actionUtil');
const BluebirdPromise = require('bluebird');

const coroutines = {


};



const SuperTypeController = {




};

module.exports = SuperTypeController;
