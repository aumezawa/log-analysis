import * as log4js from "log4js"
import * as path from "path"

const cluster = require("cluster")

const rootPath: string = process.cwd()
const filename: string = process.env.npm_package_name + ".log"

const config_master: log4js.Configuration = {
  appenders: {
    console: {
      type: "console",
      layout: {
        type: "pattern",
        pattern: "[%d] [%p] - [%z]: %m"
      },
    },
    file: {
      type: "file",
      filename: process.env.STORAGE_PATH ? path.join(process.env.STORAGE_PATH, "log", filename) : path.join(rootPath, process.env.npm_package_config_log_path!, filename),
      maxLogSize: 1 * 1024 * 1024 * 1024,
      backups: 100,
      layout: {
        type: "pattern",
        pattern: "[%d] [%p] - %c[%z]: %m"
      },
      compress: false,
      keepFileExt: true,
      encoding: "utf-8"
    },
    master: {
      type: "multiprocess",
      mode: "master",
      appender: "file",
      loggerPort: 5000,
      loggerHost: "localhost"
    }
  },
  categories: {
    default: {
      appenders: ["console"],
      level: process.env.LOGLEVEL || "info",
      enableCallStack: false
    },
    master: {
      appenders: ["file"],
      level: process.env.LOGLEVEL || "info",
      enableCallStack: false
    },
    worker: {
      appenders: ["file"],
      level: process.env.LOGLEVEL || "info",
      enableCallStack: false
    }
  }
}

const config_worker: log4js.Configuration = {
  appenders: {
    console: {
      type: "console",
      layout: {
        type: "pattern",
        pattern: "[%d] [%p] - [%z]: %m"
      },
    },
    worker: {
      type: "multiprocess",
      mode: "worker",
      loggerPort: 5000,
      loggerHost: "localhost"
    }
  },
  categories: {
    default: {
      appenders: ["console"],
      level: process.env.LOGLEVEL || "info",
      enableCallStack: false
    },
    worker: {
      appenders: ["worker"],
      level: process.env.LOGLEVEL || "info",
      enableCallStack: false
    }
  }
}


let category: string

if (cluster.isMaster) {
  category = "master"
  log4js.configure(config_master)
} else {
  category = "worker"
  log4js.configure(config_worker)
}

if (process.env.LOGOUT) {
  category = "default"
}

export = log4js.getLogger(category)
