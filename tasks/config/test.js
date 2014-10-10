module.exports = function(grunt) {

    grunt.config.set('mochaTest', {
        test: {
            options: {
                reporter: 'dot'
            },
            src: ['test/**/*.test.js']
        }
    });

    grunt.loadNpmTasks('grunt-mocha-test');
};
