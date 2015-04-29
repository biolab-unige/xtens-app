/**
 Route Mappings
 * (sails.config.routes)
 *
 * Your routes map URLs to views and controllers.
 *
 * If Sails receives a URL that doesn't match any of the routes below,
 * it will check for matching files (images, scripts, stylesheets, etc.)
 * in your assets directory.  e.g. `http://localhost:1337/images/foo.jpg`
 * might match an image file: `/assets/images/foo.jpg`
 *
 * Finally, if those don't match either, the default 404 handler is triggered.
 * See `config/404.js` to adjust your app's 404 logic.
 *
 * Note: Sails doesn't ACTUALLY serve stuff from `assets`-- the default Gruntfile in Sails copies
 * flat files from `assets` to `.tmp/public`.  This allows you to do things like compile LESS or
 * CoffeeScript for the front-end.
 *
 * For more information on routes, check out:
 * http://links.sailsjs.org/docs/config/routes
 */

module.exports.routes = {


    // Make the view located at `views/homepage.ejs` (or `views/homepage.jade`, etc. depending on your
    // default view engine) your home page.
    //
    // (Alternatively, remove this and add an `index.html` file in your `assets` directory)
    'GET /': {controller: 'home'},
    'POST /login':{controller:'main',
        action:'login'
    },

    'POST /graph':{controller:'dataType',action:'buildGraph'},

    'POST /subjectGraph':{controller:'subject',action:'createGraph'},
    
    // 'GET /populateEAV': {controller: 'main', action: 'populateEAV'},
    //
    'POST /populateDB': {controller: 'main', action: 'populateDB'},

    '/upload-file':{controller:'dataFile',action:'upload'},
    
    'POST /download-file':{controller:'dataFile',action:'download'},
    
    '/groupOperator/associate':{controller:'group', action:'addOperator'},
    
    '/groupOperator/dissociate':{controller:'group', action:'removeOperator'},
    
    '/groupDatatype/associate':{controller:'group', action:'addDatatype'},
    
    '/groupDatatype/dissociate':{controller:'group',action:'removeDatatype'},

    'GET /fileManager': {controller: 'main', action: 'getFileSystemStrategy'},
       
    // REST API for subject (with personal info)
    // 'GET /subjectWithPersonalDetails': {controller: 'subject', action: 'findWithPersonalDetails'},
    // 'GET /subjectWithPersonalDetails/:id': {controller: 'subject', action: 'findOneWithPersonalDetails'},
    // 'PUT /subjectWithPersonalDetails': {controller: 'subject', action: 'updateWithPersonalDetails'},
    // 'POST /subjectWithPersonalDetails': {controller: 'subject', action: 'createWithPersonalDetails'},
    // 'DELETE /subjectWithPersonalDetails': {controller: 'subject', action: 'deleteWithPersonalDetails'},

    // Advanced Search API
    'POST /query/dataSearch': {controller: 'query', action: 'dataSearch'}

   
    
    /*,
    'GET /dataType': {controller: 'DataType', action: 'find'} 
    
    
    
   '/dataTypes/new': {
        controller: 'dataType',
        action: 'insertnew'
   } */

    // If a request to a URL doesn't match any of the custom routes above,
    // it is matched against Sails route blueprints.  See `config/blueprints.js`
    // for configuration options and examples.

};
