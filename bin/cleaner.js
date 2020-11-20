var path = require('path');
var fs = require('fs');
var log4js = require('log4js');

var rootPath = process.cwd();
var configPath = process.env.npm_package_config_storage_path;
var storagePath = (configPath.slice(0, 1) === '/' || configPath.slice(1, 3) === ':\\') ? configPath : path.join(rootPath, configPath);

if (!fs.existsSync(storagePath)) {
  console.log('could not find storage path: ' + storagePath);
  process.exit(0);
}

var interval = 8 * 60 * 60 * 1000;
process.argv.forEach(function(arg) {
  var match = arg.match(/^([0-9]+)h?$/);
  if (match) {
    interval = Number(match[1]) * 60 * 60 * 1000;;
  }
});

var preserve = 14;
process.argv.forEach(function(arg) {
  var match = arg.match(/^([0-9]+)d$/);
  if (match) {
    preserve = Number(match[1]);
  }
});

var logger = log4js.getLogger();
log4js.configure({
  appenders: {
    file: {
      type: "file",
      filename: path.join(rootPath, process.env.npm_package_config_log_path, "cleaner.log"),
      maxLogSize: 1 * 1024 * 1024 * 1024,
      backups: 100,
      layout: {
        type: "pattern",
        pattern: "[%d] [%p] - %c[%z]: %m"
      },
      compress: false,
      keepFileExt: true,
      encoding: "utf-8"
    }
  },
  categories: {
    default: {
      appenders: ["file"],
      level: process.env.LOGLEVEL || "info",
      enableCallStack: false
    }
  }
})

function rmRecursiveSync(node) {
  if (fs.statSync(node).isDirectory()) {
    fs.readdirSync(node).forEach(function(child) {
      rmRecursiveSync(path.join(node, child));
    });
    fs.rmdirSync(node);
  } else {
    fs.unlinkSync(node);
  }
}

function cleanStorage(storagePath, days) {
  logger.info('get started cleaning...');
  fs.readdirSync(storagePath).forEach(function(domain) {
    var domainPath = path.join(storagePath, domain);

    if (!fs.statSync(domainPath).isDirectory()) {
      try {
        fs.unlinkSync(domainPath);
        logger.info('deleted an unknown type file: ' + domainPath);
      } catch (err) {
        logger.error('could not deleted due to an error: ' + projectPath);
        logger.error(err.message);
      }
      return;
    }

    fs.readdirSync(domainPath).forEach(function(project) {
      var projectPath = path.join(domainPath, project);
      var projectInfoPath = path.join(projectPath, "project.inf");

      if (!fs.statSync(projectPath).isDirectory()) {
        try {
          fs.unlinkSync(projectPath);
          logger.info('deleted an unknown type file: ' + projectPath);
        } catch (err) {
          logger.error('could not deleted due to an error: ' + projectPath);
          logger.error(err.message);
        }
        return;
      }

      if (!fs.existsSync(projectInfoPath)) {
        try {
          rmRecursiveSync(projectPath);
          logger.info('deleted a not project directory: ' + projectPath);
        } catch (err) {
          logger.error('could not deleted due to an error: ' + projectPath);
          logger.error(err.message);
        }
        return;
      }

      var projectInfo;
      try {
        projectInfo = JSON.parse(fs.readFileSync(projectInfoPath, "utf8"))
      } catch {
        logger.error('found an currupted project: ' + projectPath);
        return;
      }

      if (projectInfo.status === "close") {
        if (!process.env.npm_package_config_domains.split(',').includes(domain)) {
          try {
            rmRecursiveSync(projectPath);
            logger.info('deleted a closed project in private: ' + projectPath);
          } catch (err) {
            logger.error('could not deleted due to an error: ' + projectPath);
            logger.error(err.message);
          }
          return;
        }

        var deadline = new Date();
        deadline.setDate(deadline.getDate() - days);
        var closed = new Date(projectInfo.closed);
        if (closed.toString() !== 'Invalid Date' && deadline > closed) {
          try {
            rmRecursiveSync(projectPath);
            logger.info('deleted an expired closed project: ' + projectPath);
          } catch (err) {
            logger.error('could not deleted due to an error: ' + projectPath);
            logger.error(err.message);
          }
          return;
        }
      }

      return;
    });
  });
}

// main routine
cleanStorage(storagePath, preserve);
if (interval > 0) {
  setInterval(cleanStorage, interval, storagePath, preserve);
}
