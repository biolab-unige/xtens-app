module.exports = function(grunt) {
    
    grunt.config.set('sass', {
        
        dev: {
            files: [{
                expand: true,
                cwd: 'assets/dependencies/datatables-buttons/sass',
                src: ['buttons.bootstrap.scss'],
                dest: 'assets/dependencies/datatables-buttons/styles/',
                rename: function(dest, src) {
                    var fileName  = src.substring(src.lastIndexOf('/'), src.length);
                    fileName = fileName.substring(0, src.lastIndexOf("."));
                    return dest + fileName + '.css';
                }
            }]
        }

    });

    grunt.loadNpmTasks('grunt-contrib-sass');

};
