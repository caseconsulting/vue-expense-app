module.exports = function(grunt) {
  grunt.loadNpmTasks('grunt-aws-s3');
  var aws = grunt.file.readJSON('aws-keys.json');
  grunt.initConfig({
    aws_s3: {
      options: {
        access: 'private',
        params: {
          CacheControl: 'max-age=600, s-maxage=300'
        },
        accessKeyId: aws.AWSAccessKeyId,
        secretAccessKey: aws.AWSSecretKey,
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
      }
    }
  });
  grunt.registerTask('dev', 'aws_s3:dev');
};
