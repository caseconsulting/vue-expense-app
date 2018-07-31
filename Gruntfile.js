module.exports = function(grunt) {
  grunt.loadNpmTasks('grunt-aws-s3');
  var aws = grunt.file.readJSON('aws-keys.json');
  console.log(grunt);
  grunt.initConfig({
    // copies app to S3 bucket

    aws_s3: {
      options: {
        access: 'Private',
        accessKeyId: aws.AWSAccessKeyId,
        secretAccessKey: aws.AWSSecretKey,
        differential: true,
        region: 'us-east-1'
      },
      application: {
        options: {
          bucket: 'case-consulting-vue-expense-app'
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
  grunt.registerTask('prod', 'aws_s3:application');
};
