import * as child_process from "child_process"
import * as path from "path"

import logger = require("../lib/logger")

const rootPath: string = process.cwd()

function execVmtoolsSync(node: string, mode: string, type?: string, target?: string): any {
  const options: Array<string> = []
  options[0]  = (mode === "get")    ? "-g"
              : (mode === "decomp") ? "-d"
              : null
  options[1]  = (mode === "get")    ? "-b"
              : (mode === "decomp") ? "-f"
              : null
  options[2]  = (mode === "get")    ? node
              : (mode === "decomp") ? node
              : null
  if (mode === "get") {
    options[3]  = (type === "esx")    ? "-e"
                : (type === "vm")     ? "-v"
                : (type === "vmlog")  ? "-vl"
                : (type === "zdump")  ? "-z"
                : null
    options[4]  = (target === "LIST") ? "LIST"
                : target
    options[5]  = "-c"
  }

  if (options.includes(null)) {
    return null
  }

  const result = child_process.spawnSync("python", [
    "main.py",
    "-l", path.join(rootPath, "local", "log"),
  ].concat(options), {
    cwd: path.join("src", "server", "exts", "vmtools"),
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

export function decompressBundleSync(file: string): boolean {
  const result = execVmtoolsSync(file, "decomp")
  return (result !== null) ? true : false
}

export function getHostListSync(directory: string): Array<string> {
  return execVmtoolsSync(directory, "get", "esx", "LIST") as Array<string>
}

export function getHostInfoSync(directory: string, host: string): HostInfo {
  return execVmtoolsSync(directory, "get", "esx", host) as HostInfo
}

export function getVmListSync(directory: string): Array<string> {
  return execVmtoolsSync(directory, "get", "vm", "LIST") as Array<string>
}

export function getVmInfoSync(directory: string, vm: string): VmInfo {
  return execVmtoolsSync(directory, "get", "vm", vm) as VmInfo
}

export function getVmLogPathSync(directory: string, vm: string): string {
  return execVmtoolsSync(directory, "get", "vmlog", vm) as string
}

export function getZdumpListSync(directory: string): Array<string> {
  return execVmtoolsSync(directory, "get", "zdump", "LIST") as Array<string>
}

export function getZdumpInfoSync(directory: string, zdump: string): ZdumpInfo {
  return execVmtoolsSync(directory, "get", "zdump", zdump) as ZdumpInfo
}
