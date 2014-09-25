module.exports = function(grunt) {

	'use strict';

	// Load all our npm tasks
	grunt.loadNpmTasks('grunt-benchmark');

	// Configure tasks
	grunt.initConfig({

		benchmark: {
			all: {
				src: 'benchmark/**/*.js'
			}
		}

	});


};
