/* globals module */
module.exports = function(grunt) {
  grunt.loadNpmTasks('grunt-aws-s3');
  grunt.initConfig({
    aws_s3: {
      options: {
        access: 'private',
        params: {
          CacheControl: 'max-age=600, s-maxage=300'
        },
        differential: true,
        region: 'us-east-1'
      },
      dev: {
        options: {
          bucket: 'case-consulting-expense-app-dev'
        },
        files: [
          {
            expand: true,
            cwd: 'dist/',
            src: ['**'],
            dest: '/'
          }
        ]
      },
      test: {
        options: {
          bucket: 'case-consulting-expense-app-test'
        },
        files: [
          {
            expand: true,
            cwd: 'dist/',
            src: ['**'],
            dest: '/'
          }
        ]
      },
      prod: {
        options: {
          bucket: 'case-consulting-expense-app-prod'
        },
        files: [
          {
            expand: true,
            cwd: 'dist/',
            src: ['**'],
            dest: '/'
          }
        ]
      }
    }
  });
  grunt.registerTask('deploy:dev', 'aws_s3:dev');
  grunt.registerTask('deploy:test', 'aws_s3:test');
  grunt.registerTask('deploy:prod', 'aws_s3:prod');
};
