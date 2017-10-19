/**
 * Development environment settings
 *
 * This file can include shared settings for a development team,
 * such as API keys or remote database passwords.  If you're using
 * a version control solution for your Sails app, this file will
 * be committed to your repository unless you add it to your .gitignore
 * file.  If your repository will be publicly viewable, don't add
 * any private information to this file!
 *
 */
"use strict";

// ES6 Map for customised data management
let customisedDataMap = new Map();
customisedDataMap.set('CGH', '../migrate-utils/createCGH.js');
customisedDataMap.set('CBINFO', '../migrate-utils/updateCBInfo.js');
customisedDataMap.set('VCF', '../migrate-utils/createVCF.js');

module.exports = {

  /***************************************************************************
   * Set the default database connection for models in the development       *
   * environment (see config/connections.js and config/models.js )           *
   ***************************************************************************/

    //  models: {
    //      connection: 'pgigg',
    //      migrate: 'safe'
    //  },

    blueprints: {
        action: false,
        rest: true,
        shortcuts: true
    },

    /**
     *  @description XTENS configuration parameters
     */
    xtens: {

        customisedDataMap: customisedDataMap

    }
};
