import * as child_process from "child_process"
import * as fs from "fs"
import * as path from "path"

import logger = require("./logger")

const rootPath: string = process.cwd()

function execStatsSync(file: string, mode: string, type?: string, target?: string): any {
  const options: Array<string> = []
  options[0]  = (mode === "name")     ? "-n"
              : (mode === "convert")  ? "-v"
              : (mode === "get")      ? "-g"
              : null
  options[1]  = (mode === "name")     ? "-f"
              : (mode === "convert")  ? "-f"
              : (mode === "get")      ? "-db"
              : null
  options[2]  = (mode === "name")     ? file
              : (mode === "convert")  ? file
              : (mode === "get")      ? file
              : null
  if (mode === "get") {
    options[3]  = (type === "all-counters")       ? "-ac"
                : (type === "nonzero-counters")   ? "-nc"
                : (type === "vitality-counters")  ? "-vc"
                : (type === "data")               ? "-sd"
                : null
  }
  if (type === "data") {
    options[4]  = "-c"
    options[5]  = target
  }

  if (options.includes(null)) {
    return null
  }

  const result = child_process.spawnSync("python", [
    "main.py",
    "-l", path.join(rootPath, "local", "log"),
  ].concat(options), {
    cwd: path.join("src", "server", "exts", "stats"),
    encoding: "utf-8"
  })

  if (result.status !== 0) {
    logger.error(`child_process: pid=${ result.pid }, status=${ result.status | 0 }, error=${ result.error }`)  // unsigned to signed
    return null
  }

  try {
    return JSON.parse(result.stdout)
  } catch (err) {
    (err instanceof Error) && logger.error(`${ err.name }: ${ err.message }`)
    return null
  }
}

export function extractStatsNameSync(file: string): string {
  const result = execStatsSync(file, "name")
  return (result !== null) ? result.basename : null
}

export function convertStatsSync(file: string): string {
  const result = execStatsSync(file, "convert")
  if (result === null) {
    fs.unlinkSync(file)
  }
  return (result !== null) ? result.basename : null
}

export function getAllCountersSync(file: string): any {
  const result = execStatsSync(file, "get", "all-counters")
  return (result !== null) ? result.counters : null
}

export function getNonZeroCountersSync(file: string): any {
  const result = execStatsSync(file, "get", "nonzero-counters")
  return (result !== null) ? result.counters : null
}

export function getVitalityCountersSync(file: string): any {
  const result = execStatsSync(file, "get", "vitality-counters")
  return (result !== null) ? result.counters : null
}

export function getSpecificDataSync(file: string, counters: string): any {
  const result = execStatsSync(file, "get", "data", counters)
  return (result !== null) ? result.data : null
}
