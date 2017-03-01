module.exports = function (grunt) {
    grunt.registerTask('prod', [
        'compileAssets',
        'concat',
        'uglify',
        'cssmin',
        'copy:fonts',
        'assets_versioning',
        'sails-linker:prodJs',
        'sails-linker:prodStyles',
        'sails-linker:prodTpl',
        'sails-linker:prodJsJade',
        'sails-linker:prodStylesJade',
        'sails-linker:prodTplJade'
    ]);
};
