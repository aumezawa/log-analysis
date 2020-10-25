import * as fs from "fs"
import * as path from "path"
import * as tar from "tar"

const rmRecursiveSync: (node: string) => void = (node) => {
  if (fs.statSync(node).isDirectory()) {
    fs.readdirSync(node).forEach((child) => rmRecursiveSync(path.join(node, child)))
    fs.rmdirSync(node)
  } else {
    fs.unlinkSync(node)
  }
}

const rmRecursive: (node: string, callback: (err: Error) => void) => void = (node, callback) => {
  setImmediate(() => {
    try {
      rmRecursiveSync(node)
      callback(undefined)
    } catch (err) {
      if (err instanceof Error) {
        callback(err)
      } else {
        callback(new Error("Failed to remove the file or directory."))
      }
    }
  })
}

const compressTgz: (name: string,  cwd: string, callback: (err: Error) => void) => void = (name, cwd, callback) => {
  tar.create({
    file: path.join(cwd, name + ".tgz"),
    cwd : cwd,
    gzip: true
  }, [name], (err: Error) => {
    if (err) {
      callback(err)
      return
    }
    try {
      fs.statSync(path.join(cwd, name + ".tgz"))
      rmRecursiveSync(path.join(cwd, name))
      callback(undefined)
    } catch (err) {
      if (err instanceof Error) {
        callback(err)
      } else {
        callback(new Error("Failed to compress the file."))
      }
    }
  })
}

const decompressTgz: (name: string,  cwd: string, callback: (err: Error) => void) => void = (name, cwd, callback) => {
  tar.extract({
    file: path.join(cwd, name + ".tgz"),
    cwd : cwd
  }, undefined, (err: Error) => {
    if (err) {
      callback(err)
      return
    }
    try {
      fs.statSync(path.join(cwd, name))
      rmRecursiveSync(path.join(cwd, name + ".tgz"))
      callback(undefined)
    } catch (err) {
      if (err instanceof Error) {
        callback(err)
      } else {
        callback(new Error("Failed to decompress the directory."))
      }
    }
  })
}

export default {
  rmRecursiveSync : rmRecursiveSync,
  rmRecursive     : rmRecursive,
  compressTgz     : compressTgz,
  decompressTgz   : decompressTgz
}
