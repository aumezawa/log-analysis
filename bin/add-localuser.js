var crypto = require('crypto');
var fs = require('fs');
var path = require('path');
var readline = require('readline');

var rootPath = process.cwd();
var filePath = path.join(rootPath, process.env.npm_package_config_userlist_path);
var dirPath = path.dirname(filePath);

var override = false;
process.argv.forEach(function(arg) {
  if (arg === '-o' || arg === '--override') {
    override = true;
  }
});


// Note: if the file does not exist, do nothing
var userlist = [];
try {
  userlist = JSON.parse(fs.readFileSync(filePath, 'utf8'));
} catch {
  console.log('Info : Local user database file does not exist or has been broken.');
  console.log('Info : If you want to add a user, initialize root account first.');
  process.exit(0);
}

// Note: get username and password from stdin
var rl = readline.createInterface({
  input : process.stdin,
  output: process.stdout
});

console.log('Input username (between 4 - 16 characters with [0-9a-zA-Z]):')
rl.question('', function(username) {
  // Note: if invalid, do nothing
  if (!username.match(/^[0-9a-zA-Z]{4,16}$/)) {
    console.log('Error: Username is invalid...');
    rl.close();
    process.exit(0);
  }
  console.log('')

  rl.stdoutMuted = true;
  rl._writeToOutput = function(char) {
    if (char.match(/\n/)) {
      return;
    }
    rl.output.write('*');
  };

  console.log('Input password (between 4 - 16 characters with [0-9a-zA-Z]):')
  rl.question('', function(password) {
    // Note: if invalid, do nothing
    if (!password.match(/^[0-9a-zA-Z]{4,16}$/)) {
      console.log('Error: Password is invalid...');
      rl.close();
      process.exit(0);
    }
    console.log('')

    // Note: if user is already registered on no override flag, do nothing
    var user = userlist.find(function(user) {
      return (user.username === username)
    });
    if (user) {
      if (override) {
        userlist = userlist.map(function(user) {
          if (user.username === username) {
            user.password = crypto.createHash('sha256').update(username + password, 'utf8').digest('hex')
          }
          return user
        });
      } else {
        console.log('Info : The user is already registered.');
        console.log('Info : If you want to update password, use "-o" or "--override" option.');
        process.exit(0);
      }
    } else {
      // Note: add a user
      userlist.push({
        'username'  : username,
        'password'  : crypto.createHash('sha256').update(username + password, 'utf8').digest('hex'),
        'privilege' : 'user',
        'alias'     : username
      });
    }

    var writeData = JSON.stringify(userlist);
    try {
      fs.writeFileSync(filePath, writeData);
      console.log('Info : User database file was updated successfully.');
      console.log('Info : Path = ' + filePath);
    } catch {
      console.log('Error: Failed in writing a user database file...');
    }
    rl.close();
    process.exit(0);
  });
});
