import * as cluster from "cluster"
import * as log4js from "log4js"
import * as path from "path"

const rootpath: string = process.cwd()
const filename: string = process.env.npm_package_name + ".log"

const config_master: log4js.Configuration = {
  appenders: {
    file: {
      type: "file",
      filename: path.join(rootpath, "local", "log", filename),
      maxLogSize: 1 * 1024 * 1024 * 1024,
      backups: 100,
      layout: { type: 'basic' },
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
      appenders: ["file"],
      level: process.env.LOGLEVEL || "info",
      enableCallStack: false
    }
  }
}

const config_worker: log4js.Configuration = {
  appenders: {
    worker: {
      type: "multiprocess",
      mode: "worker",
      loggerPort: 5000,
      loggerHost: "localhost"
    }
  },
  categories: {
    default: {
      appenders: ["worker"],
      level: process.env.LOGLEVEL || "info",
      enableCallStack: false
    }
  }
}


if (cluster.isMaster) {
  log4js.configure(config_master)
} else {
  log4js.configure(config_worker)
}

export = log4js.getLogger("default")
