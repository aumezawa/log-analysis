import * as fs from "fs"
import * as path from "path"
import * as tar from "tar"

export function isErrnoException(err: any, code: string): boolean {
  return (err instanceof Error) && ((err as NodeJS.ErrnoException).code === code)
}


export function lsRecursiveSync(node: string): NodeType {
  if (fs.statSync(node).isDirectory()) {
    return ({
      name: path.basename(node),
      file: false,
      children: fs.readdirSync(node).map((name: string) => lsRecursiveSync(path.join(node, name)))
    })
  } else {
    return ({
      name: path.basename(node),
      file: true
    })
  }
}

export function lsRecursive(node: string, callback: (err?: any) => void): void
export function lsRecursive(node: string): Promise<void>
export function lsRecursive(node: string, callback?: (err?: any) => void): void | Promise<void> {
  const promise = new Promise<void>((resolve: () => void, reject: (err?: any) => void) => {
    return setImmediate(() => {
      try {
        lsRecursiveSync(node)
        return resolve()
      } catch (err) {
        return reject(err)
      }
    })
  })

  return callback ? promise.then(callback, callback) && undefined : promise
}


export function rmRecursiveSync(node: string): void {
  if (fs.statSync(node).isDirectory()) {
    fs.readdirSync(node).forEach((child) => rmRecursiveSync(path.join(node, child)))
    fs.rmdirSync(node)
  } else {
    fs.unlinkSync(node)
  }
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


export function extractRootTgzSync(name: string, cwd: string): string {
  let root: string = null
  let first: boolean = true
  tar.list({
    file: path.join(cwd, name),
    sync: true,
    filter: (path: string, entry: tar.FileStat) => (first && !(first = false)),
    onentry: (entry: tar.FileStat) => {
      const match = entry.header.path.match(/^([^/]+)[/].*$/)
      root = (match ? match[1] : null)
    }
  })
  return root
}

export function extractRootTgz(name: string, cwd: string, callback: (err?: any, root?: string) => void): void
export function extractRootTgz(name: string, cwd: string): Promise<string>
export function extractRootTgz(name: string, cwd: string, callback?: (err?: any, root?: string) => void): void | Promise<string> {
  const promise = new Promise<string>((resolve: (root?: string) => void, reject: (err?: any) => void) => {
    return setImmediate(() => {
      try {
        return resolve(extractRootTgzSync(name, cwd))
      } catch (err) {
        return reject(err)
      }
    })
  })

  const resolve = (root?: string):void => {
    callback(undefined, root)
  }

  return callback ? promise.then(resolve, callback) && undefined : promise
}


export function compressTgzSync(directory: string, cwd: string, preserve?: boolean):void {
  tar.create({
    file: path.join(cwd, directory + ".tgz"),
    cwd : cwd,
    sync: true,
    gzip: true
  }, [directory])

  if (!preserve) {
    rmRecursiveSync(path.join(cwd, directory))
  }
}

export function compressTgz(directory: string, cwd: string, preserve: boolean, callback: (err?: any) => void): void
export function compressTgz(directory: string, cwd: string, preserve: boolean): Promise<void>
export function compressTgz(directory: string, cwd: string, preserve: boolean, callback?: (err?: any) => void): void | Promise<void> {
  const promise = new Promise<void>((resolve: () => void, reject: (err?: any) => void) => {
    return setImmediate(() => {
      try {
        compressTgzSync(directory, cwd, preserve)
        return resolve()
      } catch (err) {
        return reject(err)
      }
    })
  })

  return callback ? promise.then(callback, callback) && undefined : promise
}


export function decompressTgzSync(file: string, cwd: string, preserve?: boolean): void {
  tar.extract({
    file: path.join(cwd, file),
    cwd : cwd,
    sync: true
  }, undefined)

  if (!preserve) {
    rmRecursiveSync(path.join(cwd, file))
  }
}

export function decompressTgz(file: string, cwd: string, preserve: boolean, callback: (err?: any) => void): void
export function decompressTgz(file: string, cwd: string, preserve: boolean): Promise<void>
export function decompressTgz(file: string, cwd: string, preserve: boolean, callback?: (err?: any) => void): void | Promise<void> {
  const promise = new Promise<void>((resolve: () => void, reject: (err?: any) => void) => {
    return setImmediate(() => {
      try {
        decompressTgzSync(file, cwd, preserve)
        return resolve()
      } catch (err) {
        return reject(err)
      }
    })
  })

  return callback ? promise.then(callback, callback) && undefined : promise
}
