/**
* EavLoop.js
* 
* @author Massimiliano Izzo
* @description ::  Metadata Loop model for the EAV catalogue (mostly for testing/development)
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  tableName: 'eav_loop',

  attributes: {

      name: {
        type: 'string',
        minLength: 2,
        maxLength: 32
      }

  }
};

