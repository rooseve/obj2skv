module.exports = function(grunt) {

	var gconf = {
		pkg : grunt.file.readJSON('package.json'),
		jshint : {
			files : [ 'Gruntfile.js', 'js/**/*.js' ],
			options : {
				smarttabs : true,
				'-W099' : true,
				globals : {
					jQuery : true,
					console : true,
					module : true,
					document : true,
				}
			}
		}
	};

	grunt.initConfig(gconf);

	grunt.loadNpmTasks('grunt-contrib-jshint');

	grunt.registerTask('default', [ 'jshint' ]);

};