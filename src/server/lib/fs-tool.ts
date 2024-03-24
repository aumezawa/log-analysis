import * as fs from "fs"
import * as path from "path"
import * as tar from "tar"
import * as zip from "adm-zip"

import * as CacheTool from "../lib/cache-tool"

const dateFormat = process.env.npm_package_config_date_format || ""
const cacheDir = "cache"
const cacheFile = "fs.ls.cache"

export function isErrnoException(err: any, code: string): boolean {
  return (err instanceof Error) && ((err as NodeJS.ErrnoException).code === code)
}


function isSearchInFileSync(node: string, search?: string, date_from?:string, date_to?: string): boolean {
  if (fs.statSync(node).isDirectory()) {
    return false
  }

  const regex = new RegExp(`^${ dateFormat }(.*)$`)
  const from  = date_from && new Date(date_from)
  const to    = date_to   && new Date(date_to)
  try {
    for (let line of fs.readFileSync(node, "utf8").split(/\r\n|\n|\r/)) {
      if ((dateFormat !== "") && (date_from || date_to)) {
        if (search && !line.includes(search)) {
          continue
        }

        const match = line.match(regex)
        if (!match) {
          continue
        }

        const at = new Date(match[1] + (match[1].slice(-1) === "Z" ? "" : "Z"))
        if (date_from && from > at) {
          continue
        }
        if (date_to   && to   < at) {
          continue
        }
        return true
      }
      if (search && line.includes(search)) {
        return true
      }
    }
  } catch {
    ;
  }
  return false
}

export function lsRecursiveSync(node: string, search?: string, date_from?:string, date_to?: string): NodeType {
  if (fs.statSync(node).isDirectory()) {
    return ({
      name: path.basename(node),
      file: false,
      children: fs.readdirSync(node).map((name: string) => lsRecursiveSync(path.join(node, name), search, date_from, date_to)).filter((node: NodeType) => (!!node))
    })
  } else {
    return ((search || date_from || date_to) && !isSearchInFileSync(node, search, date_from, date_to))
    ? null
    : ({
      name: path.basename(node),
      file: true
    })
  }
}

export function lsRecursiveCacheSync(node: string, search?: string, date_from?:string, date_to?: string): NodeType {
  if (search || date_from || date_to) {
    return lsRecursiveSync(node, search, date_from, date_to)
  }

  const file = path.join(path.dirname(node), cacheDir, cacheFile)
  const key  = path.basename(node)

  const cache = CacheTool.readCache(file, key)
  if (cache) {
    try {
      return (cache as NodeType)
    } catch {
      ;
    }
  }

  const result = lsRecursiveSync(node)
  CacheTool.writeCache(file, key, (result as any))

  return result
}

export function lsRecursive(node: string, search: string, date_from: string, date_to: string, cache: boolean, callback: (err?: any, result?: NodeType) => void): void
export function lsRecursive(node: string, search?: string, date_from?: string, date_to?: string, cache?: boolean): Promise<NodeType>
export function lsRecursive(node: string, search?: string, date_from?: string, date_to?: string, cache?: boolean, callback?: (err?: any, result?: NodeType) => void): void | Promise<NodeType> {
  const promise = new Promise<NodeType>((resolve: (result?: NodeType) => void, reject: (err?: any) => void) => {
    return setImmediate(() => {
      try {
        return resolve(cache ? lsRecursiveCacheSync(node, search, date_from, date_to) : lsRecursiveSync(node, search, date_from, date_to))
      } catch (err) {
        return reject(err)
      }
    })
  })

  const resolve = (result?: NodeType): void => {
    callback(undefined, result)
  }

  return callback ? promise.then(resolve, callback) && undefined : promise
}


export function rmRecursiveSync(node: string): void {
  if (fs.statSync(node).isDirectory()) {
    fs.readdirSync(node).forEach((child) => rmRecursiveSync(path.join(node, child)))
    fs.rmdirSync(node)
  } else {
    fs.unlinkSync(node)
  }
}

export function rmRecursiveCacheSync(node: string): void {
  const file = path.join(path.dirname(node), cacheDir, cacheFile)
  const key  = path.basename(node)

  rmRecursiveSync(node)

  CacheTool.deleteCache(file, key)
}

export function rmRecursive(node: string, callback: (err?: any) => void): void
export function rmRecursive(node: string): Promise<void>
export function rmRecursive(node: string, callback?: (err?: any) => void): void | Promise<void> {
  const promise = new Promise<void>((resolve: () => void, reject: (err?: any) => void) => {
    return setImmediate(() => {
      try {
        rmRecursiveSync(node)
        return resolve()
      } catch (err) {
        return reject(err)
      }
    })
  })

  return callback ? promise.then(callback, callback) && undefined : promise
}


export function extractRootTgzSync(file: string, cwd: string): FileInfo {
  let fileInfo: FileInfo = {
    name        : null,
    directory   : cwd,
    path        : null,
    isDirectory : true,
    children    : null,
    type        : ".tgz",
    size        : null,
    mtime       : null
  }
  let first: boolean = true
  tar.list({
    file: path.join(cwd, file),
    sync: true,
    filter: (path: string, entry: tar.FileStat) => (first && !(first = false)),
    onentry: (entry: tar.FileStat) => {
      const match = entry.header.path.match(/^([^/]+)[/].*$/)
      fileInfo.name         = (match ? match[1] : null)
      fileInfo.path         = fileInfo.name ? path.join(cwd, fileInfo.name) : null
      fileInfo.mtime        = new Date(entry.mtime).toISOString()
    }
  })
  return fileInfo
}

export function extractRootTgz(file: string, cwd: string, callback: (err?: any, fileInfo?: FileInfo) => void): void
export function extractRootTgz(file: string, cwd: string): Promise<FileInfo>
export function extractRootTgz(file: string, cwd: string, callback?: (err?: any, fileInfo?: FileInfo) => void): void | Promise<FileInfo> {
  const promise = new Promise<FileInfo>((resolve: (fileInfo?: FileInfo) => void, reject: (err?: any) => void) => {
    return setImmediate(() => {
      try {
        return resolve(extractRootTgzSync(file, cwd))
      } catch (err) {
        return reject(err)
      }
    })
  })

  const resolve = (fileInfo?: FileInfo): void => {
    callback(undefined, fileInfo)
  }

  return callback ? promise.then(resolve, callback) && undefined : promise
}


export function compressTgzSync(directory: string, cwd: string, preserved?: boolean): FileInfo {
  let fileInfo: FileInfo = {
    name        : directory + ".tgz",
    directory   : cwd,
    path        : path.join(cwd, directory + ".tgz"),
    isDirectory : false,
    children    : null,
    type        : ".tgz",
    size        : null,
    mtime       : new Date().toISOString()
  }

  if (!preserved) {
    tar.create({
      file: path.join(cwd, directory + ".tgz"),
      cwd : cwd,
      sync: true,
      gzip: true
    }, [directory])
  }

  rmRecursiveSync(path.join(cwd, directory))

  return fileInfo
}

export function compressTgz(directory: string, cwd: string, preserved: boolean, callback: (err?: any) => void): FileInfo
export function compressTgz(directory: string, cwd: string, preserved: boolean): Promise<FileInfo>
export function compressTgz(directory: string, cwd: string, preserved: boolean, callback?: (err?: any) => void): FileInfo | Promise<FileInfo> {
  const promise = new Promise<FileInfo>((resolve: (fileInfo: FileInfo) => void, reject: (err?: any) => void) => {
    return setImmediate(() => {
      try {
        const fileInfo = compressTgzSync(directory, cwd, preserved)
        return resolve(fileInfo)
      } catch (err) {
        return reject(err)
      }
    })
  })

  return callback ? promise.then(callback, callback) && undefined : promise
}


export function decompressTgzSync(file: string, cwd: string, preserve?: boolean): FileInfo {
  const fileInfo = extractRootTgzSync(file, cwd)

  tar.extract({
    file: path.join(cwd, file),
    cwd : cwd,
    sync: true
  }, undefined)

  if (preserve) {
    fs.renameSync(path.join(cwd, file), path.join(cwd, fileInfo.name + ".tgz"))
  } else {
    rmRecursiveSync(path.join(cwd, file))
  }

  return fileInfo
}

export function decompressTgz(file: string, cwd: string, preserve: boolean, callback: (err?: any) => void): FileInfo
export function decompressTgz(file: string, cwd: string, preserve: boolean): Promise<FileInfo>
export function decompressTgz(file: string, cwd: string, preserve: boolean, callback?: (err?: any) => void): FileInfo | Promise<FileInfo> {
  const promise = new Promise<FileInfo>((resolve: (fileInfo: FileInfo) => void, reject: (err?: any) => void) => {
    return setImmediate(() => {
      try {
        const fileInfo = decompressTgzSync(file, cwd, preserve)
        return resolve(fileInfo)
      } catch (err) {
        return reject(err)
      }
    })
  })

  return callback ? promise.then(callback, callback) && undefined : promise
}


export function extractRootZipSync(file: string, cwd: string): FileInfo {
  const fileInfo: FileInfo = {
    name        : path.basename(file, ".zip"),
    directory   : cwd,
    path        : path.join(cwd, path.basename(file, ".zip")),
    isDirectory : true,
    children    : null,
    type        : ".zip",
    size        : null,
    mtime       : new zip(path.join(cwd, file)).getEntries()[0].header.time.toISOString()
  }
  return fileInfo
}

export function extractRootZip(file: string, cwd: string, callback: (err?: any, fileInfo?: FileInfo) => void): void
export function extractRootZip(file: string, cwd: string): Promise<FileInfo>
export function extractRootZip(file: string, cwd: string, callback?: (err?: any, fileInfo?: FileInfo) => void): void | Promise<FileInfo> {
  const promise = new Promise<FileInfo>((resolve: (fileInfo?: FileInfo) => void, reject: (err?: any) => void) => {
    return setImmediate(() => {
      try {
        return resolve(extractRootZipSync(file, cwd))
      } catch (err) {
        return reject(err)
      }
    })
  })

  const resolve = (fileInfo?: FileInfo): void => {
    callback(undefined, fileInfo)
  }

  return callback ? promise.then(resolve, callback) && undefined : promise
}


export function decompressZipSync(file: string, cwd: string, preserve?: boolean): FileInfo {
  const fileInfo = extractRootZipSync(file, cwd)
  fs.mkdirSync(fileInfo.path)
  new zip(path.join(cwd, file)).extractAllTo(fileInfo.path, true)
  if (!preserve) {
    rmRecursiveSync(path.join(cwd, file))
  }
  return fileInfo
}

export function decompressZip(file: string, cwd: string, preserve: boolean, callback: (err?: any) => void): FileInfo
export function decompressZip(file: string, cwd: string, preserve: boolean): Promise<FileInfo>
export function decompressZip(file: string, cwd: string, preserve: boolean, callback?: (err?: any) => void): FileInfo | Promise<FileInfo> {
  const promise = new Promise<FileInfo>((resolve: (fileInfo: FileInfo) => void, reject: (err?: any) => void) => {
    return setImmediate(() => {
      try {
        const fileInfo = decompressZipSync(file, cwd, preserve)
        return resolve(fileInfo)
      } catch (err) {
        return reject(err)
      }
    })
  })

  return callback ? promise.then(callback, callback) && undefined : promise
}


export function readMergedFileSync(file1: string, file2: string, filename: boolean = true, line: boolean = true): string {
  const output: Array<string> = []
  const regex = new RegExp(`^${ dateFormat }(.*)$`)

  const addOptions = (str: string, file: string, idx: number) => {
    return `${ filename ? path.basename(file) + ":" : "" }${ line ? idx + ":" : "" }${ str }`
  }

  const fc1 = fs.readFileSync(file1, "utf8").split(/\r\n|\n|\r/)
  const fc2 = fs.readFileSync(file2, "utf8").split(/\r\n|\n|\r/)

  let idx1: number = 0, idx2: number = 0
  let line1: string | null = null, line2: string | null = null
  let date1: Date | null = null, date2: Date | null = null

  while (idx1 < fc1.length || idx2 < fc2.length) {

    while (line1 === null && idx1 < fc1.length) {
      line1 = fc1[idx1++]
      if (line1 === "") {
        line1 = null
        continue
      }

      const match = line1.match(regex)
      if (match) {
        date1 = new Date(match[1] + (match[1].slice(-1) === "Z" ? "" : "Z"))
        break
      } else {
        output.push(addOptions(line1, file1, idx1))
        line1 = null
        continue
      }
    }

    while (line2 === null && idx2 < fc2.length) {
      line2 = fc2[idx2++]
      if (line2 === "") {
        line2 = null
        continue
      }

      const match = line2.match(regex)
      if (match) {
        date2 = new Date(match[1] + (match[1].slice(-1) === "Z" ? "" : "Z"))
        break
      } else {
        output.push(addOptions(line2, file2, idx2))
        line2 = null
        continue
      }
    }

    if (date1 === null) {
      line2 && output.push(addOptions(line2, file2, idx2))
      line2 = null
      date2 = null
      continue
    }

    if (date2 === null) {
      line1 && output.push(addOptions(line1, file1, idx1))
      line1 = null
      date1 = null
      continue
    }

    if (date1 < date2) {
      line1 && output.push(addOptions(line1, file1, idx1))
      line1 = null
      date1 = null
      continue
    } else {
      line2 && output.push(addOptions(line2, file2, idx2))
      line2 = null
      date2 = null
      continue
    }

  }

  return output.join("\n")
}