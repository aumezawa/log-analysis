var fs = require('fs');
var path = require('path');

var rootPath = process.cwd();

// copy test files to dist
var srcPath = path.join(rootPath, 'src', 'test');
var destPath = path.join(rootPath, 'dist', 'test');

var dirList = ["script", "data"]

dirList.forEach(function(dirname){
  var srcDirPath = path.join(srcPath, dirname)
  if (!fs.existsSync(srcDirPath)) {
    console.log('Error: No source directory...');
    process.exit(-1);
  }
});


dirList.forEach(function(dirname){
  var destDirPath = path.join(destPath, dirname)
  if (!fs.existsSync(destDirPath)) {
    try {
      fs.mkdirSync(destDirPath, { recursive: true });
    } catch {
      console.log('Error: Failed in creating the destination directory...');
      process.exit(-1);
    }
  }
});

dirList.forEach(function(dirname){
  var srcDirPath = path.join(srcPath, dirname)
  var destDirPath = path.join(destPath, dirname)
  try {
    var fileList = fs.readdirSync(srcDirPath);
    fileList.forEach(function(filename) {
      var srcFile = path.join(srcDirPath, filename);
      var destFile = path.join(destDirPath, filename);
      var fsStat = fs.statSync(srcFile);
      if (fsStat.isFile()) {
        fs.copyFileSync(srcFile, destFile);
      }
    });
  } catch {
    console.log('Error: Failed in copying test files...');
    process.exit(-1);
  }
});

// done
process.exit(0);
