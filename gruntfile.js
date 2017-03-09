module.exports = function(grunt) {
  grunt.initConfig({
    uglify: {
      options: {
        report: 'gzip'
      },
      my_target: {
        files: {
        './public/js/main.min.js': ['./public/js/main.js']
        }
      }
    },

    cssmin: {
      ship: {
        options: {
          report: 'gzip' // --verbose to see the gzip value
        },
        files: {
          './public/css/main.min.css': './public/css/main.css'
        }
      },
  },

});

grunt.loadNpmTasks('grunt-contrib-uglify');
grunt.loadNpmTasks('grunt-contrib-cssmin');

grunt.registerTask('build', ['uglify', 'cssmin']);
};
