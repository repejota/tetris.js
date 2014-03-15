//
// BEGIN LICENSE BLOCK
//
// The MIT License (MIT)
//
// Copyright (c) 2014 Raül Pérez
//
// Permission is hereby granted, free of charge, to any person obtaining a copy of
// this software and associated documentation files (the 'Software'), to deal in
// the Software without restriction, including without limitation the rights to
// use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
// the Software, and to permit persons to whom the Software is furnished to do so,
// subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
// FOR A PARTICULAR PURPOSE AND NON INFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
// COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
// IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
// CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
//
// END LICENSE BLOCK
//

module.exports = function (grunt) {
    'use strict';

    // load all grunt tasks
    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

    // Configuration tasks
    grunt.initConfig({

        pkg: grunt.file.readJSON('package.json'),

        jshint: {
            options: {
                jshintrc: '.jshintrc',
                reporter: require('jshint-stylish')
            },
            build: {
                files: {
                    src: ['src/js/**/*.js', 'Gruntfile.js']
                }
            }
        },

        csslint: {
            options: {
                csslintrc: '.csslintrc'
            },
            build: {
                src: ['src/css/**/*.css']
            }
        },

        sass: {
            options: {
                sourcemap: true
            },
            build: {
                options: {
                    style: 'expand'
                },
                files: {
                    'src/css/tetris.css': 'src/sass/main.scss'
                }
            },
            dist: {
                options: {
                    style: 'compressed'
                },
                files: {
                    'src/css/tetris.css': 'src/sass/main.scss'
                }
            }
        },

        clean: {
            build: {
                files: [
                    {
                        dot: true,
                        src: ['./src/css', '.sass-cache', 'build']
                    }
                ]
            },
            dist: {
                files: [
                    {
                        dot: true,
                        src: ['./src/css', '.sass-cache', 'dist']
                    }
                ]
            }
        },

        copy: {
            build: {
                files: [
                    {
                        expand: true,
                        cwd: 'src/',
                        src: ['**', '!sass/**', '!js/**'],
                        dest: 'build/'
                    }
                ]
            },
            dist: {
                files: [
                    {
                        expand: true,
                        cwd: 'src/',
                        src: ['**', '!sass/**', '!js/**'],
                        dest: 'dist/'
                    }
                ]
            }
        },

        uglify: {
            options: {
                sourceMap: true
            },
            build: {
                options: {
                    mangle: false,
                    beautify: true,
                    width: 80
                },
                files: {
                    'build/js/tetris.js': ['src/js/**/*.js']
                }
            },
            dist: {
                options: {
                    mangle: true,
                    beautify: false
                },
                files: {
                    'dist/js/tetris.js': ['src/js/**/*.js']
                }
            }
        },

        watch: {
            js: {
                files: ['src/js/**/*.js', 'Gruntfile.js'],
                tasks: ['jshint:build', 'uglify:build', 'copy:build'],
                options: {
                    interrupt: true
                }
            },
            sass: {
                files: ['src/sass/**/*.scss'],
                tasks: ['sass:build', 'csslint:build', 'copy:build'],
                options: {
                    interrupt: true
                }
            }
        }

    });

    // Dist task
    grunt.registerTask('dist', [
        'clean:dist',
        'sass:dist',
        'uglify:dist',
        'copy:dist'
    ]);

    // Build task
    grunt.registerTask('build', [
        'clean:build',
        'jshint:build',
        'sass:build',
        'csslint:build',
        'uglify:build',
        'copy:build'
    ]);

    // Default task
    grunt.registerTask('default', ['build']);

};
