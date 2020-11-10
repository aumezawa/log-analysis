var fs = require('fs');
var path = require('path');

var rootPath = process.cwd();

// copy css files to public
var srcPath = path.join(rootPath, 'src', 'server', 'css');
var destPath = path.join(rootPath, 'public', 'css');

if (!fs.existsSync(srcPath)) {
  console.log('Error: No CSS source directory...');
  process.exit(-1);
}

if (!fs.existsSync(destPath)) {
  try {
    fs.mkdirSync(destPath, { recursive: true });
  } catch {
    console.log('Error: Failed in creating the CSS destination directory...');
    process.exit(-1);
  }
}

try {
  var fileList = fs.readdirSync(srcPath);
  fileList.forEach(function(filename) {
    var srcFile = path.join(srcPath, filename);
    var destFile = path.join(destPath, filename);
    fs.copyFileSync(srcFile, destFile);
  });
} catch {
  console.log('Error: Failed in copying CSS files...');
  process.exit(-1);
}

// done
process.exit(0);
