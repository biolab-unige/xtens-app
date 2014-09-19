/**
 * grunt/pipeline.js
 *
 * The order in which your css, javascript, and template files should be
 * compiled and linked from your views and static HTML files.
 *
 * (Note that you can take advantage of Grunt-style wildcard/glob/splat expressions
 * for matching multiple files.)
 */



// CSS files to inject in order
//
// (if you're using LESS with the built-in default config, you'll want
//  to change `assets/styles/importer.less` instead.)
var cssFilesToInject = [
    'styles/**/*.css',
    'dependencies/select2/select2.css',
    'dependencies/**/*.css'
];


// Client-side javascript files to inject in order
// (uses Grunt-style wildcard/glob/splat expressions)
var jsFilesToInject = [

    // Dependencies like sails.io.js, jQuery, or Angular
    // are brought in here
    'js/dependencies/sail.io.js',
    'dependencies/**/jquery.min.js',
    'dependencies/**/underscore.js',
    'dependencies/**/backbone.js',
    'dependencies/**/select2.js',

    // Customised client-side js files
    'js/application/utils.js',
    'js/application/xtens.js',
    'js/application/Router.js',
    'js/modules/i18n.js',
    'js/modules/XtensConstants.js',
    'js/modules/MetadataComponent.js',
    'js/modules/MetadataField.js',
    'js/modules/MetadataLoop.js',
    'js/modules/MetadataGroup.js',
    'js/modules/DataType.js',
    'js/modules/Operator.js',
    'js/modules/Group.js',
    'js/modules/Association.js'

    // All of the rest of your client-side js files
    // will be injected here in no particular order.
];


// Client-side HTML templates are injected using the sources below
// The ordering of these templates shouldn't matter.
// (uses Grunt-style wildcard/glob/splat expressions)
//
// By default, Sails uses JST templates and precompiles them into
// functions for you.  If you want to use jade, handlebars, dust, etc.,
// with the linker, no problem-- you'll just want to make sure the precompiled
// templates get spit out to the same file.  Be sure and check out `tasks/README.md`
// for information on customizing and installing new tasks.
var templateFilesToInject = [
    'templates/**/*.html',
    'templates/**/*.ejs'
];



// Prefix relative paths to source files so they point to the proper locations
// (i.e. where the other Grunt tasks spit them out, or in some cases, where
// they reside in the first place)
module.exports.cssFilesToInject = cssFilesToInject.map(function(path) {
    return '.tmp/public/' + path;
});
module.exports.jsFilesToInject = jsFilesToInject.map(function(path) {
    return '.tmp/public/' + path;
});
module.exports.templateFilesToInject = templateFilesToInject.map(function(path) {
    return 'views/' + path;
});
