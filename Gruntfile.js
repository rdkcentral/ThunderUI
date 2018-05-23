/*
 *  WPE Framework UI task runner
 *  Creates the build (cleans the directory, copy's static files, concats the js and runs an uglification)
 */

var wfuiscripts = [],
    fs = require('fs'),
    path = require('path'),
    shell = require('shelljs');

module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        clean: {
            build: ['build/img', 'build/css', 'build/js' ],
            main: 'js/main.js'
        },
        concat: {
            options: {
                separator: ';'
            },
            build: {
                src: '<%= wfuiscripts %>',
                dest: 'build/js/main.js'
            }
        },
        copy: {
            images: {
                expand: true,
                cwd: 'src/img/',
                src: '**',
                dest: 'build/img/'
            },
            css: {
                expand: true,
                cwd: 'src/css/',
                src: '**',
                dest: 'build/css/'
            },
            html: {
                src: 'src/index.html',
                dest: 'build/index.html'
            }
        },
        jshint: {
            files: ['Gruntfile.js', 'src/js/*.js', 'src/js/plugins/*.js'],
            options: {
                ignores: 'src/js/main.js',
                'esversion': 6
            }
        },
        uglify: {
            scripts: {
                files: {
                    'build/js/main.js': ['<%= concat.build.dest %>']
                }
            }
        },
        watch: {
            base : {
                files: ['src/js/*.js'],
                tasks: ['compile']
            },
            plugins : {
                files: ['src/js/plugins/*.js'],
                tasks: ['compile']
            }
        }
    });

    //custom task to load the NUKE files from config_NUKE.js
    grunt.task.registerTask('loadScripts', 'Loads the required files for all plugins', function() {

        //reset our globals
        var cwd = process.cwd();
        var jsDir = path.join( cwd, 'src', 'js');
        var coreDir = path.join(jsDir, 'core');
        var pluginDir = path.join(jsDir, 'plugins');
        var layoutDir = path.join(jsDir, 'layout');
        var scripts = [];

        // add conf
        scripts.push('js/conf.js');

        shell.cd(coreDir);
        shell.ls('*.js').forEach( function(p) {
            scripts.push('js/core/' + p);
        });

        shell.cd(layoutDir);
        shell.ls('*.js').forEach( function(p) {
            scripts.push('js/layout/' + p);
        });

        shell.cd(pluginDir);
        shell.ls('*.js').forEach( function(js) {
            scripts.push(path.join('js/plugins/', js));
        });

        shell.cd(cwd);

        console.log('Found scripts: \n ', JSON.stringify(scripts, null, 4));

        // write debug scripts.json
        var scriptsJson = path.join(jsDir, 'scripts.json');
        console.log('Writing to debug json: ', scriptsJson);
        grunt.file.write( scriptsJson, JSON.stringify(scripts, null, 4) );

        //set the files we just read
        var gruntScripts = [];
        for (var i=0; i<scripts.length; i++) {
            gruntScripts.push('src/' + scripts[i]);
        }

        grunt.config.set('wfuiscripts', gruntScripts);
    });

    //grunt contrib packages
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-concat');

    grunt.registerTask('help', function() {
        console.log('Please provide the tast to run to the grunt');
        console.log('test - to run jshint');
        console.log('compile - to compile the plugins to a concated file');
        console.log('release - to build the source and create the build output');
    });

    //add the tasks
    grunt.registerTask('test', ['jshint']); //just runs jshint to validate all the javascript
    grunt.registerTask('compile', ['loadScripts', 'test']);
    // FIXME: uglify has been turned off because it doesnt support ES6
    grunt.registerTask('release', ['loadScripts', 'test', 'compile', 'clean', 'copy', 'concat']); //generates the build

    grunt.registerTask('default', ['compile']);
};
