var crypto = require('crypto');
var fs = require('fs');
var path = require('path');
var readline = require('readline');

var rootPath = process.cwd();
var filePath = path.join(rootPath, process.env.npm_package_config_userlist_path);
var dirPath = path.dirname(filePath);

var override = false;
var force = false;
process.argv.forEach(function(arg) {
  if (arg === '-o' || arg === '--override') {
    override = true;
  }
  if (arg === '-f' || arg === '--force') {
    force = true
  }
});


// Note: if the file already exists, do nothing
if (!override) {
  var userlist = [];
  try {
    userlist = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    ;
  }
  var root = userlist.find(function(user) {
    return (user.username === "root")
  });
  if (root) {
    console.log('Info : Local user database file already exists.');
    console.log('Info : If you want to re-create, use "-o" or "--override" option.');
    process.exit(0);
  }
}


// Note: forcely create a new file
if (force) {
  var writeData = JSON.stringify([{
    'username'  : 'root',
    'password'  : crypto.createHash('sha256').update('rootpassword', 'utf8').digest('hex'),
    'privilege' : 'root',
    'alias'     : 'root'
  }]);
  try {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true })
    }
    fs.writeFileSync(filePath, writeData);
    console.log('Info : User database file was forcely created successfully.');
    console.log('Info : Path = ' + filePath);
  } catch {
    console.log('Error: Failed in writing a user database file...');
  }
  process.exit(0);
}


// Note: get a password from stdin
var rl = readline.createInterface({
  input : process.stdin,
  output: process.stdout
});

rl.stdoutMuted = true;

console.log('Input root password (between 4 - 16 characters with [0-9a-zA-Z]):')
rl.question('', function(password) {
  console.log('\n');

  // Note: if invalid, do nothing
  if (!password.match(/^[0-9a-zA-Z]{4,16}$/)) {
    console.log('Error: Password is invalid...');
    rl.close();
    process.exit(0);
  }

  // Note: create a new file
  var writeData = JSON.stringify([{
    'username'  : 'root',
    'password'  : crypto.createHash('sha256').update('root' + password, 'utf8').digest('hex'),
    'privilege' : 'root',
    'alias'     : 'root'
  }]);
  try {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true })
    }
    fs.writeFileSync(filePath, writeData);
    console.log('Info : User database file was created successfully.');
    console.log('Info : Path = ' + filePath);
  } catch {
    console.log('Error: Failed in writing a user database file...');
  }
  rl.close();
  process.exit(0);
});

rl._writeToOutput = function(char) {
  if (char.match(/\n/)) {
    return;
  }
  rl.output.write('*');
};
