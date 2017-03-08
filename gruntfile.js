module.exports = function(grunt) {
  grunt.initConfig({
    uglify: {
      options: {
        report: 'gzip'
      },
      my_target: {
        files: {
        './build/js/main.min.js': ['./public/js/main.js']
        }
      }
    },

    cssmin: {
      ship: {
        options: {
          report: 'gzip'
        },
        files: {
          './build/css/main.min.css': './public/css/uswds.css'
        }
      },
  },

});

grunt.loadNpmTasks('grunt-contrib-uglify');
grunt.loadNpmTasks('grunt-contrib-cssmin');

grunt.registerTask('build', ['uglify', 'cssmin']);
};
