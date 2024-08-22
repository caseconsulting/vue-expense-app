const _each = require('lodash/each');
const _compact = require('lodash/compact');
const fs = require('fs');
const exec = require('child_process').exec;

// Colors for console logging
const COLORS = {
  RED: '\x1b[31m',
  GREEN: '\x1b[32m',
  BLUE: '\x1b[34m',
  CYAN: '\x1b[36m',
  YELLOW: '\x1b[33m',
  BOLD: '\x1b[1m',
  NC: '\x1b[0m' // clear
};

// Entry function
function main() {
  console.log('\n');
  let args = process.argv;
  if (args.length !== 3) {
    console.log(`${COLORS.RED}Error: expected one command line argument${COLORS.NC}`);
    return;
  }
  const STAGE = args[2]?.slice(1, args[2].length);
  if (STAGE !== 'dev' && STAGE !== 'test' && STAGE !== 'prod') {
    console.log(`${COLORS.RED}Error: expected flag of -dev -test or -prod${COLORS.NC}`);
    return;
  }
  console.log(`${COLORS.CYAN}Uploading files to S3...${COLORS.NC}`);
  deploy(STAGE);
}

// Deploys the distribution folder to the S3 stages' deployment bucket
function deploy(stage) {
  // Get S3 bucket name
  const bucket = _getBucketName(stage);
  // Define source and destination paths
  let paths = {
    'appleTouchIcon.png': 'appleTouchIcon.png',
    assets: 'assets',
    'favicon.ico': 'favicon.ico',
    'index.html': 'index.html',
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
  _each(paths, (source, destination) => {
    commands.push(
      _compact([
        `aws s3 cp dist/${source} s3://${bucket}/${destination}`,
        _isFile(source) ? '' : recursive,
        security,
        metadata
      ]).join(' ')
    );
  });

  // Return one really long command
  let command = commands.join(' && ');
  executeCommand(command);
}

// Runs the exec function to execute the terminal deployment command
function executeCommand(command) {
  exec(command, (error, stdout, stderr) => {
    if (error) console.log(`${COLORS.RED}exec error: ${error}${COLORS.NC}`);
    else {
      console.log(stdout);
      stderr ? console.log('stderr: ' + stderr) : '';
    }
  });
}

// Execute entry function
main();

/////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////
///////////////////////////// HELPERS ///////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////

// Returns bucket name for specified stage
function _getBucketName(stage) {
  return stage === 'prod' ? `case-consulting-expense-app-${stage}` : `case-expense-app-${stage}`;
}

// Returns true if path references a file
function _isFile(path) {
  return fs.statSync(`dist/${path}`).isFile();
}
