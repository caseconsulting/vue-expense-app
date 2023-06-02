const _ = require('lodash');
const fs = require('fs');

// Returns bucket name for specified stage
function _getBucketName(stage) {
  return stage === 'prod' ? `case-consulting-expense-app-${stage}` : `case-expense-app-${stage}`;
}

// Returns true if path references a file
function _isFile(path) {
  return fs.statSync(`dist/${path}`).isFile();
}

module.exports = (grunt) => {
  grunt.loadNpmTasks('grunt-shell');
  grunt.initConfig({
    shell: {
      deploy: {
        command: (stage) => {
          // Get S3 bucket name
          const bucket = _getBucketName(stage);

          // Define source and destination paths
          let paths = {
            'appleTouchIcon.png': 'appleTouchIcon.png',
            css: 'css',
            'favicon.ico': 'favicon.ico',
            img: 'img',
            'index.html': 'index.html',
            js: 'js',
            'navlogo.png': 'navlogo.png'
          };

          // Add remove commands
          let commands = [];
          commands.push(`aws s3 rm s3://${bucket}/ --recursive`);

          // Add copy commands
          const recursive = '--recursive --exclude "*.map"';
          const security = '--acl private';
          const cacheControl = 'max-age=600,s-maxage=300';
          const metadata = `--metadata-directive REPLACE --cache-control ${cacheControl}`;
          _.each(paths, (source, destination) => {
            commands.push(
              _.compact([
                `aws s3 cp dist/${source} s3://${bucket}/${destination}`,
                _isFile(source) ? '' : recursive,
                security,
                metadata
              ]).join(' ')
            );
          });

          // Return one really long command
          return commands.join(' && ');
        }
      }
    }
  });

  grunt.registerTask('deploy:dev', 'shell:deploy:dev');
  grunt.registerTask('deploy:test', 'shell:deploy:test');
  grunt.registerTask('deploy:prod', 'shell:deploy:prod');
};
