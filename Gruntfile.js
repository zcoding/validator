module.exports = function(grunt) {

  grunt.initConfig({

    pkg: grunt.file.readJSON('package.json'),

    uglify: {
      options: {
        compress: {
          drop_console: true
        },
        mangle: {
          except: ['require', 'exports', 'module']
        },
        banner: '/* spa-public-validator by zcoding <%= grunt.template.today("yyyy-mm-dd") %> version: <%= pkg.version %> */',
        sourceMap: true,
        sourceMapName: 'build/spa-public-validator.min.map',
      },
      "validator": {
        files: {
          "build/spa-public-validator.min.js": ["<%= concat.validator.dest %>"]
        }
      }
    },

    concat: {
      options: {
        separator: '',
        banner: '/* spa-public-validator by <%= pkg.author %>, <%= pkg.license %> license, <%= grunt.template.today("yyyy-mm-dd") %> version: <%= pkg.version %> */'
      },
      "validator": {
        src: ['src/intro.js', 'src/utils.js', 'src/validator.js', 'src/outro.js'],
        dest: 'build/spa-public-validator.js'
      }
    },

    watch: {
      options: {
        spawn: false
      },
      "validator": {
        files: ['src/*.js'],
        tasks: ['concat:validator', 'uglify:validator']
      }
    }

  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('default', ['concat:validator', 'uglify:validator', 'watch:validator']);
  grunt.registerTask('build', ['concat:validator', 'uglify:validator']);

};