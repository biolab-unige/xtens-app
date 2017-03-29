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
    'styles/importer.css',
    'dependencies/bootstrap-select/css/bootstrap-select.css',
    'dependencies/font-awesome/styles/font-awesome.css',
    'dependencies/select2/select2.css',
    'dependencies/datatables/styles/jquery.dataTables.css',
    'dependencies/datatables-plugins/integration-bootstrap/styles/dataTables.bootstrap.css',
    'dependencies/datatables-plugins/integration-fontAwesome/styles/dataTables.fontAwesome.css',
    'dependencies/datatables-buttons/styles/buttons.bootstrap.css',
    'dependencies/**/*.css',
    'styles/xtens.css'
];


// Client-side javascript files to inject in order
// (uses Grunt-style wildcard/glob/splat expressions)
var jsFilesToInject = [

    // Dependencies like sails.io.js, jQuery, or Angular
    // are brought in here
    'js/dependencies/sail.io.js',
    'dependencies/**/jquery.js',
    'dependencies/**/es6-promise.js',
    'dependencies/**/fetch.js',
    'dependencies/http/http.js',
    // 'dependencies/**/underscore.js',
    'dependencies/**/bootstrap.js',
    'dependencies/**/lodash.js',
    'dependencies/**/backbone.js',
    'dependencies/**/backbone.stickit.js',
    'dependencies/**/select2.js',
    'dependencies/**/parsley.js',
    'dependencies/**/moment-with-locales.js',
    'dependencies/**/pikaday.js',
    'dependencies/**/dropzone.js',
    'dependencies/**/jquery.dataTables.js',
    'dependencies/**/dataTables.bootstrap.js',
    'dependencies/**/dataTables.buttons.js',
    'dependencies/**/dataTables.fixedColumns.js',
    'dependencies/**/buttons.bootstrap.js',
    'dependencies/**/buttons.html5.js',
    'dependencies/**/jszip.js',
    'dependencies/**/buttons.colvis.js',
    'dependencies/**/async.js',
    'dependencies/**/d3.js',
    'dependencies/**/Sortable.js',
    '/dependencies/**/bootstrap-select.js',
    // Customised client-side js files

    'js/application/xtens.js',
    'js/modules/i18n.js',
    'js/modules/XtensBootstrap.js',
    'js/application/utils.js',
    'js/application/Router.js',
    'js/modules/XtensConstants.js',
    'js/modules/Utils.js',
    'js/modules/Session.js',
    'js/modules/DataTypePrivileges.js',
    'js/modules/MetadataComponent.js',
    'js/modules/MetadataField.js',
    'js/modules/MetadataLoop.js',
    'js/modules/MetadataGroup.js',
    'js/modules/DataType.js',
    'js/modules/XtensTable.js',
    'js/modules/Operator.js',
    'js/modules/Group.js',
    'js/modules/GroupsDataType.js',
    'js/modules/GroupsOperator.js',
    'js/modules/PersonalDetails.js',
    'js/modules/FileManager.js',
    'js/modules/ContactInformation.js',
    'js/modules/Biobank.js',
    'js/modules/Data.js',
    'js/modules/DataFile.js',
    'js/modules/Subject.js',
    'js/modules/Project.js',
    'js/modules/Sample.js',
    'js/modules/AdminAssociation.js',
    // 'js/modules/QueryStrategy.js',
    'js/modules/Query.js'

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
