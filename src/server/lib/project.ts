import * as fs from "fs"
import * as path from "path"
import * as zlib from "zlib"

import logger = require("../lib/logger")

import * as Atomic from "../lib/atomic"
import * as FSTool from "../lib/fs-tool"
import * as LocalDate from "../lib/local-date"
import * as StatsTool from "./stats-tool"

const rootPath: string = process.cwd()

function getStoragePathSync(): string {
  const configPath = process.env.STORAGE_PATH ? path.join(process.env.STORAGE_PATH, "data") : (process.env.npm_package_config_storage_path || "")
  return configPath && ((configPath.slice(0, 1) === "/" || configPath.slice(1, 3) === ":\\") ? configPath : path.join(rootPath, configPath))
}

const storagePath: string = getStoragePathSync()

const dateFormat = process.env.npm_package_config_date_format || ""

//--- File System Function

function joinResourcePathSync(parent: string, child: string): string {
  try {
    return path.join(parent, child)
  } catch (err) {
    (err instanceof Error) && logger.error(`${ err.name }: ${ err.message }`)
    return null
  }
}

function joinResourcePath(parent: string, child: string): Promise<string> {
  return new Promise<string>((resolve: (path: string) => void, reject: (err? :any) => void) => {
    return setImmediate(() => {
      let err = new Error(`Resource: ${ parent } or ${ child } is invalid.`)
      err.name = "Internal"
      const path = joinResourcePathSync(parent, child)
      return (path !== null) ? resolve(path) : reject(err)
    })
  })
}

function existsResourcePathSync(path: string): boolean {
  return fs.existsSync(path)
}

function createResourceSync(path: string): boolean {
  try {
    fs.mkdirSync(path)
    return true
  } catch (err) {
    (err instanceof Error) && logger.error(`${ err.name }: ${ err.message }`)
    return false
  }
}

function createResource(path: string): Promise<void> {
  return new Promise<void>((resolve: () => void, reject: (err? :any) => void) => {
    return setImmediate(() => {
      let err = new Error(`Resource: ${ path } couldn't be created.`)
      err.name = "Internal"
      return createResourceSync(path) ? resolve() : reject(err)
    })
  })
}

function deleteResourceSync(path: string): boolean {
  try {
    FSTool.rmRecursiveCacheSync(path)
    return true
  } catch (err) {
    (err instanceof Error) && logger.error(`${ err.name }: ${ err.message }`)
    return false
  }
}

function deleteResource(path: string): Promise<void> {
  return new Promise<void>((resolve: () => void, reject: (err? :any) => void) => {
    return setImmediate(() => {
      let err = new Error(`Resource: ${ path } couldn't be deleted.`)
      err.name = "Internal"
      return deleteResourceSync(path) ? resolve() : reject(err)
    })
  })
}

function getChildResourceListSync(path: string): Array<string> {
  try {
    return fs.readdirSync(path)
  } catch (err) {
    (err instanceof Error) && logger.error(`${ err.name }: ${ err.message }`)
    return null
  }
}

function getChildResourceList(path: string): Promise<Array<string>> {
  return new Promise<Array<string>>((resolve: (list: Array<string>) => void, reject: (err? :any) => void) => {
    return setImmediate(() => {
      let err = new Error(`Resource: ${ path } is invalid.`)
      err.name = "Internal"
      const list = getChildResourceListSync(path)
      return (list !== null) ? resolve(list) : reject(err)
    })
  })
}

function getResourceNodeSync(path: string, search?: string, date_from?: string, date_to?: string): NodeType {
  try {
    return FSTool.lsRecursiveCacheSync(path, search, date_from, date_to)
  } catch (err) {
    (err instanceof Error) && logger.error(`${ err.name }: ${ err.message }`)
    return null
  }
}

function getResourceNode(path: string, search?: string): Promise<NodeType> {
  return new Promise<NodeType>((resolve: (node: NodeType) => void, reject: (err? :any) => void) => {
    return setImmediate(() => {
      let err = new Error(`Resource: ${ path } is invalid.`)
      err.name = "Internal"
      const node = getResourceNodeSync(path, search)
      return (node !== null) ? resolve(node) : reject(err)
    })
  })
}

function readObjectDataSync(path: string): Object {
  try {
    return JSON.parse(fs.readFileSync(path, "utf8"))
  } catch (err) {
    (err instanceof Error) && logger.error(`${ err.name }: ${ err.message }`)
    return null
  }
}

function readObjectData(path: string): Promise<Object> {
  return new Promise<Object>((resolve: (data: Object) => void, reject: (err? :any) => void) => {
    return setImmediate(() => {
      let err = new Error(`Resource: ${ path } couldn't be read.`)
      err.name = "Internal"
      const data = readObjectDataSync(path)
      return (data !== null) ? resolve(data) : reject(err)
    })
  })
}

function writeObjectDataSync(path: string, data: Object): boolean {
  if (!data) {
    return false
  }

  try {
    fs.writeFileSync(path, JSON.stringify(data))
    return true
  } catch (err) {
    (err instanceof Error) && logger.error(`${ err.name }: ${ err.message }`)
    return false
  }
}

function writeObjectData(path: string, data: Object): Promise<void> {
  return new Promise<void>((resolve: () => void, reject: (err? :any) => void) => {
    return setImmediate(() => {
      let err = new Error(`Resource: ${ path } couldn't be written.`)
      err.name = "Internal"
      return writeObjectDataSync(path, data) ? resolve() : reject(err)
    })
  })
}

function extractBundleInfoSync(file: string): FileInfo {
  try {
    if (path.extname(file) === ".tgz") {
      return FSTool.extractRootTgzSync(path.basename(file), path.dirname(file))
    } else if (path.extname(file) === ".zip") {
      return FSTool.extractRootZipSync(path.basename(file), path.dirname(file))
    } else {
      return null
    }
  } catch (err) {
    (err instanceof Error) && logger.error(`${ err.name }: ${ err.message }`)
    return null
  }
}

function extractBundleInfo(file: string): Promise<FileInfo> {
  return new Promise<FileInfo>((resolve: (fileInfo: FileInfo) => void, reject: (err? :any) => void) => {
    return setImmediate(() => {
      let err = new Error(`Resource: ${ file } is invalid bundle.`)
      err.name = "Internal"
      const fileInfo = extractBundleInfoSync(file)
      return (fileInfo !== null) ? resolve(fileInfo) : reject(err)
    })
  })
}

function compressBundleSync(directory: string, preserved: boolean): Array<FileInfo> {
  try {
    const fileInfo = FSTool.compressTgzSync(path.basename(directory), path.dirname(directory), preserved)
    logger.info(`${ directory } was compressed successfully.`)
    return [fileInfo]
  } catch (err) {
    (err instanceof Error) && logger.error(`${ err.name }: ${ err.message }`)
    return null
  }
}

function compressBundle(directory: string, preserved: boolean): Promise<Array<FileInfo>> {
  return new Promise<Array<FileInfo>>((resolve: (filesInfo: Array<FileInfo>) => void, reject: (err? :any) => void) => {
    return setImmediate(() => {
      let err = new Error(`Resource: ${ directory } cloudn't be compressed.`)
      err.name = "Internal"
      const filesInfo = compressBundleSync(directory, preserved)
      return filesInfo ? resolve(filesInfo) : reject(err)
    })
  })
}

function decompressBundleSync(file: string, preserve: boolean = false): Array<FileInfo> {
  try {
    let fileInfo: FileInfo
    if (path.extname(file) === ".tgz") {
      fileInfo = FSTool.decompressTgzSync(path.basename(file), path.dirname(file), preserve)
    } else if (path.extname(file) === ".zip") {
      fileInfo = FSTool.decompressZipSync(path.basename(file), path.dirname(file), preserve)
    } else {
      logger.error(`${ file } was unsupported file type.`)
      return null
    }
    logger.info(`${ file } was decompressed successfully.`)
    return [fileInfo]
  } catch (err) {
    (err instanceof Error) && logger.error(`${ err.name }: ${ err.message }`)
    return null
  }
}

function decompressBundle(file: string, preserve: boolean = false): Promise<Array<FileInfo>> {
  return new Promise<Array<FileInfo>>((resolve: (filesInfo: Array<FileInfo>) => void, reject: (err? :any) => void) => {
    return setImmediate(() => {
      let err = new Error(`Resource: ${ file } cloudn't be decompressed.`)
      err.name = "Internal"
      const filesInfo = decompressBundleSync(file, preserve)
      return filesInfo ? resolve(filesInfo) : reject(err)
    })
  })
}

function getFileStatSync(file: string): FileInfo {
  try {
    const fstat = fs.statSync(file)
    return ({
      name        : path.basename(file),
      directory   : path.dirname(file),
      path        : file,
      isDirectory : fstat.isDirectory(),
      children    : fstat.isDirectory() ? getChildResourceListSync(file) : null,
      type        : path.extname(file),
      size        : fstat.size,
      mtime       : fstat.mtime.toISOString()
    })
  } catch (err) {
    (err instanceof Error) && logger.error(`${ err.name }: ${ err.message }`)
    return null
  }
}

function getFileStat(file: string): Promise<FileInfo> {
  return new Promise<FileInfo>((resolve: (fileInfo: FileInfo) => void, reject: (err? :any) => void) => {
    return setImmediate(() => {
      let err = new Error(`Resource: ${ file } is invalid.`)
      err.name = "Internal"
      const fileInfo = getFileStatSync(file)
      return (fileInfo !== null) ? resolve(fileInfo) : reject(err)
    })
  })
}

function getFileContentSync(file: string): string {
  try {
    return fs.readFileSync(file, "utf8")
  } catch (err) {
    (err instanceof Error) && logger.error(`${ err.name }: ${ err.message }`)
    return null
  }
}

function getFileContent(file: string): Promise<string> {
  return new Promise<string>((resolve: (content: string) => void, reject: (err? :any) => void) => {
    return setImmediate(() => {
      let err = new Error(`Resource: ${ file } is invalid.`)
      err.name = "Internal"
      const content = getFileContentSync(file)
      return (content !== null) ? resolve(content) : reject(err)
    })
  })
}

function getBinaryFileContentSync(file: string): Buffer {
  try {
    return fs.readFileSync(file, null)
  } catch (err) {
    (err instanceof Error) && logger.error(`${ err.name }: ${ err.message }`)
    return null
  }
}

function getFileContentHeadSync(file: string): string {
  try {
    const fd = fs.openSync(file, "r")
    const buffer = Buffer.alloc(30)
    fs.readSync(fd, buffer, 0, 30, 0)
    fs.closeSync(fd)
    return buffer.toString("utf8")
  } catch (err) {
    (err instanceof Error) && logger.error(`${ err.name }: ${ err.message }`)
    return null
  }
}

function getMergedFileContentSync(file1: string, file2: string): string {
  try {
    return FSTool.readMergedFileSync(file1, file2)
  } catch (err) {
    (err instanceof Error) && logger.error(`${ err.name }: ${ err.message }`)
    return null
  }
}

//--- Statistics Function

function extractStatsNameSync(file: string): string {
  try {
    const basename = StatsTool.extractStatsNameSync(file)
    return basename
  } catch (err) {
    (err instanceof Error) && logger.error(`${ err.name }: ${ err.message }`)
    return null
  }
}

function extractStatsName(file: string): Promise<string> {
  return new Promise<string>((resolve: (basename: string) => void, reject: (err? :any) => void) => {
    return setImmediate(() => {
      let err = new Error(`Resource: ${ file } is invalid stats.`)
      err.name = "Internal"
      const basename = extractStatsNameSync(file)
      return basename ? resolve(basename) : reject(err)
    })
  })
}

function convertStatsSync(file: string): string {
  try {
    const basename = StatsTool.convertStatsSync(file)
    logger.info(`${ file } was converted successfully.`)
    return basename
  } catch (err) {
    (err instanceof Error) && logger.error(`${ err.name }: ${ err.message }`)
    return null
  }
}

function convertStats(file: string): Promise<string> {
  return new Promise<string>((resolve: (basename: string) => void, reject: (err? :any) => void) => {
    return setImmediate(() => {
      let err = new Error(`Resource: ${ file } cloudn't be converted.`)
      err.name = "Internal"
      const basename = convertStatsSync(file)
      return basename ? resolve(basename) : reject(err)
    })
  })
}

function getStatsCountersSync(file: string, option?: string): any {
  try {
    let counters: any
    switch (option) {
      case "nonzero":
        counters = StatsTool.getNonZeroCountersSync(file)
        break

      case "vitality":
        counters = StatsTool.getVitalityCountersSync(file)
        break

      case "all":
      default:
        counters = StatsTool.getAllCountersSync(file)
        break
    }
    return counters
  } catch (err) {
    (err instanceof Error) && logger.error(`${ err.name }: ${ err.message }`)
    return null
  }
}

function getStatsCounters(file: string, option?: string): Promise<any> {
  return new Promise<any>((resolve: (counters: any) => void, reject: (err? :any) => void) => {
    return setImmediate(() => {
      let err = new Error(`Resource: ${ file } cloudn't be converted.`)
      err.name = "Internal"
      const counters = getStatsCountersSync(file, option)
      return counters ? resolve(counters) : reject(err)
    })
  })
}

function getStatsSpecificDataSync(file: string, counter: string): any {
  try {
    const data = StatsTool.getSpecificDataSync(file, counter)
    return data
  } catch (err) {
    (err instanceof Error) && logger.error(`${ err.name }: ${ err.message }`)
    return null
  }
}

function getStatsSpecificData(file: string, counter: string): Promise<any> {
  return new Promise<any>((resolve: (data: any) => void, reject: (err? :any) => void) => {
    return setImmediate(() => {
      let err = new Error(`Resource: ${ file } cloudn't be converted.`)
      err.name = "Internal"
      const data = getStatsSpecificDataSync(file, counter)
      return data ? resolve(data) : reject(err)
    })
  })
}

//--- Domain Functions

function getDomainResourceListSync(): Array<string> {
  return (process.env.npm_package_config_domains || "").split(",")
}

function validateDomainNameSync(domain: string): boolean {
  return getDomainResourceListSync().includes(domain)
}

export function validateDomainName(domain: string): Promise<void> {
  return new Promise<void>((resolve: () => void, reject: (err?: any) => void) => {
    return setImmediate(() => {
      let err = new Error(`domain: ${ domain } is invalid name.`)
      err.name = "External"
      return validateDomainNameSync(domain) ? resolve() : reject(err)
    })
  })
}

function getDomainResourcePathSync(user: string, domain: string): string {
  return joinResourcePathSync(storagePath, (domain === "private") ? user : domain)
}

function validateDomainResourceSync(user: string, domain: string): boolean {
  return existsResourcePathSync(getDomainResourcePathSync(user, domain))
}

export function validateDomainResource(user: string, domain: string): Promise<void> {
  return new Promise<void>((resolve: () => void, reject: (err?: any) => void) => {
    return setImmediate(() => {
      let err = new Error(`domain: ${ domain } is invalid resource.`)
      err.name = "External"
      return validateDomainResourceSync(user, domain) ? resolve() : reject(err)
    })
  })
}

export function createDomainResource(user: string, domain: string): Promise<void> {
  return new Promise<void>((resolve: () => void, reject: (err?: any) => void) => {
    return setImmediate(() => {
      return validateDomainResource(user, domain)
      .then(() => {
        let err = new Error(`domain: ${ domain } has already existed.`)
        err.name = "External"
        reject(err)
      })
      .catch(() => {
        return validateDomainName(domain)
        .then(() => {
          return createResource(getDomainResourcePathSync(user, domain))
        })
        .then(() => {
          return resolve()
        })
        .catch((err: any) => {
          return reject(err)
        })
      })
    })
  })
}

//--- Project Functions

const projectNameAcception: RegExp = /^[0-9a-zA-Z#@_+-]+$/

function validateProjectNameSync(project: string): boolean {
  return !!project.match(projectNameAcception)
}

export function validateProjectName(project: string): Promise<void> {
  return new Promise<void>((resolve: () => void, reject: (err?: any) => void) => {
    return setImmediate(() => {
      let err = new Error(`project: ${ project } is invalid name. (should match ${ String(projectNameAcception) })`)
      err.name = "External"
      return validateProjectNameSync(project) ? resolve() : reject(err)
    })
  })
}

export function getProjectResourcePathSync(user: string, domain: string, project: string): string {
  return joinResourcePathSync(getDomainResourcePathSync(user, domain), project)
}

function getProjectInfoPathSync(user: string, domain: string, project: string): string {
  return joinResourcePathSync(getProjectResourcePathSync(user, domain, project), "project.inf")
}

function validateProjectResourceSync(user: string, domain: string, project: string): boolean {
  return existsResourcePathSync(getProjectInfoPathSync(user, domain, project))
}

export function validateProjectResource(user: string, domain: string, project: string): Promise<void> {
  return new Promise<void>((resolve: () => void, reject: (err?: any) => void) => {
    return setImmediate(() => {
      let err = new Error(`project: ${ project } is invalid resource.`)
      err.name = "External"
      return validateProjectResourceSync(user, domain, project) ? resolve() : reject(err)
    })
  })
}

function getProjectInfoSync(user: string, domain: string, project: string): ProjectInfo {
  try {
    const projectInfo = readObjectDataSync(getProjectInfoPathSync(user, domain, project)) as ProjectInfo
    if (projectInfo.status === undefined) {
      projectInfo.status = "open"
    }
    if (projectInfo.stats === undefined) {
      projectInfo.stats = []
    }
    projectInfo.bundles = projectInfo.bundles.map((bundleInfo: BundleInfo) => {
      if (bundleInfo.type === undefined) {
        bundleInfo.type = ".tgz"
      }
      if (bundleInfo.date === undefined) {
        bundleInfo.date = new Date().toISOString()
      }
      if (bundleInfo.preserved === undefined) {
        bundleInfo.preserved = false
      }
      return bundleInfo
    })
    return projectInfo
  } catch {
    return null
  }
}

export function getProjectInfo(user: string, domain: string, project: string): Promise<ProjectInfo> {
  return new Promise<ProjectInfo>((resolve: (projectInfo: ProjectInfo) => void, reject: (err?: any) => void) => {
    return setImmediate(() => {
      let err = new Error(`project: ${ project } is invalid resource.`)
      err.name = "External"
      const projectInfo = getProjectInfoSync(user, domain, project)
      return (projectInfo !== null) ? resolve(projectInfo) : reject(err)
    })
  })
}

function getProjectResourceListSync(user: string, domain: string): Array<ProjectInfo> {
  return validateDomainResource(user, domain)
    ? getChildResourceListSync(getDomainResourcePathSync(user, domain))
      .filter((project: string) => validateProjectResourceSync(user, domain, project))
      .map((project: string) => getProjectInfoSync(user, domain, project))
    : null
}

export function getProjectResourceList(user: string, domain: string): Promise<Array<ProjectInfo>> {
  return new Promise<Array<ProjectInfo>>((resolve: (projectList: Array<ProjectInfo>) => void, reject: (err?: any) => void) => {
    return setImmediate(() => {
      let err = new Error(`project: project list couldn't be read in ${ domain } domain.`)
      err.name = "External"
      const projectList = getProjectResourceListSync(user, domain)
      return (projectList !== null) ? resolve(projectList) : reject(err)
    })
  })
}

function updateProjectInfoSync(user: string, domain: string, project: string, projectInfo: ProjectInfo): boolean {
  return writeObjectDataSync(getProjectInfoPathSync(user, domain, project), projectInfo)
}

function updateProjectInfo(user: string, domain: string, project: string, projectInfo: ProjectInfo): Promise<void> {
  return new Promise<void>((resolve: () => void, reject: (err?: any) => void) => {
    return setImmediate(() => {
      let err = new Error(`project: ${ project } information couldn't be updated.`)
      err.name = "External"
      return updateProjectInfoSync(user, domain, project, projectInfo) ? resolve() : reject(err)
    })
  })
}

function createNewProjectInfoSync(user: string, domain: string, project: string, description?: string): boolean {
  return updateProjectInfoSync(user, domain, project, {
    name        : project,
    status      : "open",
    opened      : LocalDate.now(true),
    closed      : null,
    description : description || "",
    index       : 0,
    bundles     : []
  })
}

function createNewProjectInfo(user: string, domain: string, project: string, description?: string): Promise<void> {
  return new Promise<void>((resolve: () => void, reject: (err?: any) => void) => {
    return setImmediate(() => {
      let err = new Error(`project: ${ project } information couldn't be created.`)
      err.name = "External"
      return createNewProjectInfoSync(user, domain, project, description) ? resolve() : reject(err)
    })
  })
}

export function createProjectResource(user: string, domain: string, project: string, description?: string): Promise<void> {
  return new Promise<void>((resolve: () => void, reject: (err?: any) => void) => {
    return setImmediate(() => {
      return validateProjectResource(user, domain, project)
      .then(() => {
        let err = new Error(`project: ${ project } has already existed.`)
        err.name = "External"
        return reject(err)
      })
      .catch(() => {
        return createResource(getProjectResourcePathSync(user, domain, project))
        .then(() => {
          return createNewProjectInfo(user, domain, project, description)
        })
        .then(() => {
          return resolve()
        })
        .catch((err: any) => {
          return reject(err)
        })
      })
    })
  })
}

export function updateProjectDescription(user: string, domain: string, project: string, description: string): Promise<void> {
  return new Promise<void>((resolve: () => void, reject: (err?: any) => void) => {
    return setImmediate(() => {
      return Atomic.lock(getProjectInfoPathSync(user, domain, project))
      .then(() => {
        return getProjectInfo(user, domain, project)
      })
      .then((projectInfo: ProjectInfo) => {
        projectInfo.description = description
        return updateProjectInfo(user, domain, project, projectInfo)
      })
      .then(() => {
        return Atomic.unlock(getProjectInfoPathSync(user, domain, project))
      })
      .then(() => {
        return resolve()
      })
      .catch((err: any) => {
        return Atomic.unlock(getProjectInfoPathSync(user, domain, project))
        .then(() => {
          return reject(err)
        })
      })
    })
  })
}

export function updateProjectStatus(user: string, domain: string, project: string, status: string): Promise<void> {
  return new Promise<void>((resolve: () => void, reject: (err?: any) => void) => {
    return setImmediate(() => {
      let err = new Error(`project: ${ status } is not a state.`)
      err.name = "External"
      if (!["open", "close"].includes(status)) {
        return reject(err)
      }

      let bundles: Array<BundleInfo>
      return Atomic.lock(getProjectInfoPathSync(user, domain, project))
      .then(() => {
        return getProjectInfo(user, domain, project)
      })
      .then((projectInfo: ProjectInfo) => {
        bundles = projectInfo.bundles
        projectInfo.status = status
        projectInfo.closed = (status === "close") ? LocalDate.now(true) : null
        return updateProjectInfo(user, domain, project, projectInfo)
      })
      .then(() => {
        return Atomic.unlock(getProjectInfoPathSync(user, domain, project))
      })
      .then(() => {
        setImmediate(() => {
          return Promise.all(bundles.map((bundleInfo: BundleInfo) => {
            const bundle = joinResourcePathSync(getProjectResourcePathSync(user, domain, project), bundleInfo.name)
            return (status === "close")                                 ? compressBundle(bundle, bundleInfo.preserved)            :
                   (bundleInfo.type === ".zip" && bundleInfo.preserved) ? decompressBundle(bundle + ".zip", bundleInfo.preserved) :
                                                                          decompressBundle(bundle + ".tgz", bundleInfo.preserved)
          }))
          .then(() => {
            return Atomic.lock(getProjectInfoPathSync(user, domain, project))
          })
          .then(() => {
            return getProjectInfo(user, domain, project)
          })
          .then((projectInfo: ProjectInfo) => {
            projectInfo.bundles = projectInfo.bundles.map((bundleInfo: BundleInfo) => {
              bundleInfo.available = (status === "open")
              return bundleInfo
            })
            return updateProjectInfo(user, domain, project, projectInfo)
          })
          .then(() => {
            return Atomic.unlock(getProjectInfoPathSync(user, domain, project))
          })
          .then(() => {
            return
          })
          .catch(() => {
            return Atomic.unlock(getProjectInfoPathSync(user, domain, project))
          })
        })
        return
      })
      .then(() => {
        return resolve()
      })
      .catch((err: any) => {
        return Atomic.unlock(getProjectInfoPathSync(user, domain, project))
        .then(() => {
          return reject(err)
        })
      })
    })
  })
}

export function deleteProjectResource(user: string, domain: string, project: string): Promise<void> {
  return new Promise<void>((resolve: () => void, reject: (err?: any) => void) => {
    return setImmediate(() => {
      return validateProjectResource(user, domain, project)
      .then(() => {
        return deleteResource(getProjectResourcePathSync(user, domain, project))
      })
      .then(() => {
        return resolve()
      })
      .catch((err: any) => {
        return reject(err)
      })
    })
  })
}

//--- Bundle Functions

function getBundleResourceListSync(user: string, domain: string, project: string): Array<BundleInfo> {
  const projectInfo = getProjectInfoSync(user, domain, project)
  return projectInfo ? projectInfo.bundles : []
}

export function getBundleResourceList(user: string, domain: string, project: string): Promise<Array<BundleInfo>> {
  return new Promise((resolve: (list: Array<BundleInfo>) => void, reject: (err?: any) => void) => {
    return setImmediate(() => {
      return resolve(getBundleResourceListSync(user, domain, project))
    })
  })
}

function getBundleInfoSync(user: string, domain: string, project: string, bundleId: string): BundleInfo {
  return getBundleResourceListSync(user, domain, project).find((bundle: BundleInfo) => (bundle.id === Number(bundleId))) || null
}

export function getBundleInfo(user: string, domain: string, project: string, bundleId: string): Promise<BundleInfo> {
  return new Promise<BundleInfo>((resolve: (bundleInfo: BundleInfo) => void, reject: (err?: any) => void) => {
    return setImmediate(() => {
      let err = new Error(`bundle: bundle ID = ${ bundleId } is invalid resource.`)
      err.name = "External"
      const bundleInfo = getBundleInfoSync(user, domain, project, bundleId)
      return bundleInfo ? resolve(bundleInfo) : reject(err)
    })
  })
}

export function getBundleResourcePathSync(user: string, domain: string, project: string, bundleId: string): string {
  const bundleInfo = getBundleInfoSync(user, domain, project, bundleId)
  return bundleInfo && joinResourcePathSync(getProjectResourcePathSync(user, domain, project), bundleInfo.name)
}

function validateBundleResourceSync(user: string, domain: string, project: string, bundleId: string): boolean {
  return existsResourcePathSync(getBundleResourcePathSync(user, domain, project, bundleId))
}

export function validateBundleResource(user: string, domain: string, project: string, bundleId: string): Promise<void> {
  return new Promise<void>((resolve: () => void, reject: (err?: any) => void) => {
    return setImmediate(() => {
      let err = new Error(`bundle: bundle ID = ${ bundleId } is invalid bundle resource.`)
      err.name = "External"
      return validateBundleResourceSync(user, domain, project, bundleId) ? resolve() : reject(err)
    })
  })
}

function existsBundleNameSync(user: string, domain: string, project: string, bundleName: string): boolean {
  return !!getBundleResourceListSync(user, domain, project).find((bundleInfo: BundleInfo) => (bundleInfo.name === bundleName))
}

export function existsBundleName(user: string, domain: string, project: string, bundleName: string): Promise<void> {
  return new Promise<void>((resolve: () => void, reject: (err?: any) => void) => {
    return setImmediate(() => {
      let err = new Error(`bundle: ${ bundleName } has already existed.`)
      err.name = "External"
      return existsBundleNameSync(user, domain, project, bundleName) ? reject(err) : resolve()
    })
  })
}

export function registerBundleResource(user: string, domain: string, project: string, bundleTgz: string, description: string = "", preserve: boolean = false): Promise<BundleInfo> {
  return new Promise<BundleInfo>((resolve: (bundle: BundleInfo) => void, reject: (err?: any) => void) => {
    return setImmediate(() => {
      const bundlePath: string = joinResourcePathSync(getProjectResourcePathSync(user, domain, project), bundleTgz)
      let bundleId: string
      let bundleInfo: BundleInfo
      let decompInfo: Array<FileInfo>

      return extractBundleInfo(bundlePath)
      .then((fileInfo: FileInfo) => {
        return existsBundleName(user, domain, project, fileInfo.name)
      })
      .then(() => {
        return decompressBundle(bundlePath, preserve)
      })
      .then((filesInfo: Array<FileInfo>) => {
        decompInfo = filesInfo
        return Atomic.lock(getProjectInfoPathSync(user, domain, project))
      })
      .then(() => {
        return getProjectInfo(user, domain, project)
      })
      .then((projectInfo: ProjectInfo) => {
        decompInfo.forEach((fileInfo: FileInfo) => {
          bundleId = String(projectInfo.index++)
          bundleInfo = {
            id          : Number(bundleId),
            name        : fileInfo.name,
            description : description,
            type        : fileInfo.type,
            date        : fileInfo.mtime,
            available   : true,
            preserved   : preserve
          }
          projectInfo.bundles.push(bundleInfo)
        })
        return updateProjectInfo(user, domain, project, projectInfo)
      })
      .then(() => {
        return Atomic.unlock(getProjectInfoPathSync(user, domain, project))
      })
      .then(() => {
        return resolve(bundleInfo)
      })
      .catch((err: any) => {
        return Atomic.unlock(getProjectInfoPathSync(user, domain, project))
        .then(() => {
          return reject(err)
        })
      })
    })
  })
}

export function updateBundleDescription(user: string, domain: string, project: string, bundleId: string, description?: string): Promise<void> {
  return new Promise<void>((resolve: () => void, reject: (err?: any) => void) => {
    return setImmediate(() => {
      return Atomic.lock(getProjectInfoPathSync(user, domain, project))
      .then(() => {
        return getProjectInfo(user, domain, project)
      })
      .then((projectInfo: ProjectInfo) => {
        projectInfo.bundles = projectInfo.bundles.map((bundleInfo: BundleInfo) => {
          if (bundleInfo.id === Number(bundleId)) {
            bundleInfo.description = description || ""
          }
          return bundleInfo
        })
        return updateProjectInfo(user, domain, project, projectInfo)
      })
      .then(() => {
        return Atomic.unlock(getProjectInfoPathSync(user, domain, project))
      })
      .then(() => {
        return resolve()
      })
      .catch((err: any) => {
        return Atomic.unlock(getProjectInfoPathSync(user, domain, project))
        .then(() => {
          return reject(err)
        })
      })
    })
  })
}

export function deleteBundleResource(user: string, domain: string, project: string, bundleId: string): Promise<void> {
  return new Promise<void>((resolve: () => void, reject: (err?: any) => void) => {
    return setImmediate(() => {
      return deleteResource(getBundleResourcePathSync(user, domain, project, bundleId))
      .then(() => {
        return Atomic.lock(getProjectInfoPathSync(user, domain, project))
      })
      .then(() => {
        return getProjectInfo(user, domain, project)
      })
      .then((projectInfo: ProjectInfo) => {
        projectInfo.bundles = projectInfo.bundles.filter((bundleInfo: BundleInfo) => (bundleInfo.id !== Number(bundleId)))
        return updateProjectInfo(user, domain, project, projectInfo)
      })
      .then(() => {
        return Atomic.unlock(getProjectInfoPathSync(user, domain, project))
      })
      .then(() => {
        return resolve()
      })
      .catch((err: any) => {
        return Atomic.unlock(getProjectInfoPathSync(user, domain, project))
        .then(() => {
          return reject(err)
        })
      })
    })
  })
}

export function getOriginalBundleInfo(user: string, domain: string, project: string, bundleId: string): Promise<FileInfo> {
  return new Promise<FileInfo>((resolve: (fileInfo: FileInfo) => void, reject: (err?: any) => void) => {
    return setImmediate(() => {
      return getBundleInfo(user, domain, project, bundleId)
      .then((bundleInfo: BundleInfo) => {
        if (bundleInfo.preserved) {
          let err = new Error(`bundle: The original bundle of ${ bundleInfo.name } is not existed.`)
          err.name = "External"
          const fileInfo = getFileStatSync(joinResourcePathSync(getProjectResourcePathSync(user, domain, project), bundleInfo.name + ".tgz"))
          return (fileInfo !== null) ? resolve(fileInfo) : reject(err)
        } else {
          let err = new Error(`bundle: The original bundle of ${ bundleInfo.name } is not preserved.`)
          err.name = "External"
          return reject(err)
        }
      })
      .catch((err: any) => {
        return reject(err)
      })
    })
  })
}

export function getOriginalBundleContentSync(user: string, domain: string, project: string, bundleName: string): Buffer {
  return getBinaryFileContentSync(joinResourcePathSync(getProjectResourcePathSync(user, domain, project), bundleName))
}

//--- File Functions

function getFileResourceListSync(user: string, domain: string, project: string, bundleId: string, search?: string, date_from?: string, date_to?: string): NodeType {
  return getResourceNodeSync(getBundleResourcePathSync(user, domain, project, bundleId), search, date_from, date_to)
}

export function getFileResourceList(user: string, domain: string, project: string, bundleId: string, search?: string, date_from?: string, date_to?: string): Promise<NodeType> {
  return new Promise<NodeType>((resolve: (node: NodeType) => void, reject: (err?: any) => void) => {
    return setImmediate(() => {
      let err = new Error(`file: bundle ID = ${ bundleId } is invalid resource.`)
      err.name = "External"
      const node = getFileResourceListSync(user, domain, project, bundleId, search, date_from, date_to)
      return node ? resolve(node) : reject(err)
    })
  })
}

export function getFilePathSync(user: string, domain: string, project: string, bundleId: string, file: string): string {
  return joinResourcePathSync(getBundleResourcePathSync(user, domain, project, bundleId), file)
}

function validateFileResourceSync(user: string, domain: string, project: string, bundleId: string, file: string): boolean {
  return existsResourcePathSync(getFilePathSync(user, domain, project, bundleId, file))
}

export function validateFileResource(user: string, domain: string, project: string, bundleId: string, file: string): Promise<void> {
  return new Promise<void>((resolve: () => void, reject: (err?: any) => void) => {
    return setImmediate(() => {
      let err = new Error(`file: ${ file } is invalid resource.`)
      err.name = "External"
      return validateFileResourceSync(user, domain, project, bundleId, file) ? resolve() : reject(err)
    })
  })
}

export function getFileResourceInfo(user: string, domain: string, project: string, bundleId: string, file: string): Promise<FileInfo> {
  return new Promise<FileInfo>((resolve: (fileInfo: FileInfo) => void, reject: (err?: any) => void) => {
    return setImmediate(() => {
      let err = new Error(`file: ${ file } is invalid resource.`)
      err.name = "External"
      const fileInfo = getFileStatSync(getFilePathSync(user, domain, project, bundleId, file))
      return fileInfo ? resolve(fileInfo) : reject(err)
    })
  })
}

export function getFileResourceSync(user: string, domain: string, project: string, bundleId: string, file: string): string {
  return getFileContentSync(getFilePathSync(user, domain, project, bundleId, file))
}

export function getFileResourceAsBytesSync(user: string, domain: string, project: string, bundleId: string, file: string, filter?: string, sensitive: boolean = true, date_from?: string, date_to?: string, merge?: string, gzip: boolean = false): Buffer {
  const filePath = getFilePathSync(user, domain, project, bundleId, file)

  const regex = new RegExp(`^${ dateFormat }(.*)$`)

  const hasDate = (dateFormat !== "") && !!getFileContentHeadSync(filePath).match(regex)

  let content: string
  if (merge) {
    const mergeFilePath = getFilePathSync(user, domain, project, bundleId, merge)
    content = getMergedFileContentSync(filePath, mergeFilePath)
  } else {
    content = getFileContentSync(filePath)
  }

  if (filter) {
    content = content.split(/\r\n|\n|\r/)
      .filter((line: string) => sensitive ? line.includes(filter) : line.toUpperCase().includes(filter.toUpperCase()))
      .join("\n")
  }

  if (hasDate && (date_from || date_to)) {
    content = content.split(/\r\n|\n|\r/)
      .filter((line: string) => {
        const match = merge ? line.split(":").slice(2).join(":").match(regex) : line.match(regex)
        if (!match) {
          return false
        }

        const at = new Date(match[1] + (match[1].slice(-1) === "Z" ? "" : "Z"))
        if (date_from && new Date(date_from) > at) {
          return false
        }
        if (date_to   && new Date(date_to)   < at) {
          return false
        }
        return true
      })
      .join("\n")
  }

  let buffer = Buffer.from(content, "utf8")

  if (gzip) {
    buffer = zlib.gzipSync(buffer)
  }

  return buffer
}

export function getFileResourceAsJsonSync(user: string, domain: string, project: string, bundleId: string, file: string, format: string = "auto", gzip: boolean = false): TableContent | Buffer {
  const filePath = getFilePathSync(user, domain, project, bundleId, file)

  const regex = new RegExp(`^${ dateFormat }(.*)$`)

  const hasDate = (format === "date") || ((format === "auto") && (dateFormat !== "") && !!getFileContentHeadSync(filePath).match(regex))

  const withDate    = (line: string) => {
    const match = line.match(regex)
    return (!!match) ? { Date: match[1] + (match[1].slice(-1) === "Z" ? "" : "Z"), Content: match[2] } : { Date: "", Content: line }
  }

  const withoutDate = (line: string) => {
    return { Content: line }
  }

  const content = {
    format: {
      title     : path.basename(file),
      label     : hasDate ? { Date: "date", Content: "text" } : { Content: "text" },
      hasHeader : true,
      hasIndex  : true,
      contentKey: "Content",
      files     : [path.basename(file)]
    },
    data: getFileContentSync(filePath).split(/\r\n|\n|\r/).map(hasDate ? withDate : withoutDate)
  }

  if (gzip) {
    return zlib.gzipSync(Buffer.from(JSON.stringify(content), "utf8"))
  }

  return content
}

export function getMergedFileResourceAsJsonSync(user: string, domain: string, project: string, bundleId: string, file1: string, file2: string, gzip: boolean = false): TableContent | Buffer {
  const filePath1 = getFilePathSync(user, domain, project, bundleId, file1)
  const filePath2 = getFilePathSync(user, domain, project, bundleId, file2)

  const regex = new RegExp(`^${ dateFormat }(.*)$`)

  const splitLine = (line: string) => {
    const parts = line.split(":")
    const filename = parts[0]
    const linenum = parts[1]
    const content = parts.slice(2).join(":")

    const match = content.match(regex)
    if (match) {
      return { File: filename, Line: linenum, Date: match[1] + (match[1].slice(-1) === "Z" ? "" : "Z"), Content: match[2] }
    } else {
      return { File: filename, Line: linenum, Content: content }
    }
  }

  const content = {
    format: {
      title     : `${ path.basename(file1) } + ${ path.basename(file2) }`,
      label     : { File: "meta", Line: "meta", Date: "date", Content: "text" },
      hasHeader : true,
      hasIndex  : true,
      contentKey: "Content",
      files     : [path.basename(file1), path.basename(file2)]
    },
    data: getMergedFileContentSync(filePath1, filePath2).split(/\r\n|\n|\r/).map(splitLine)
  }

  if (gzip) {
    return zlib.gzipSync(Buffer.from(JSON.stringify(content), "utf8"))
  }

  return content
}

//--- Stats Functions

function getStatsResourceListSync(user: string, domain: string, project: string): Array<StatsInfo> {
  const projectInfo = getProjectInfoSync(user, domain, project)
  return projectInfo ? projectInfo.stats : []
}

export function getStatsResourceList(user: string, domain: string, project: string): Promise<Array<StatsInfo>> {
  return new Promise((resolve: (list: Array<StatsInfo>) => void, reject: (err?: any) => void) => {
    return setImmediate(() => {
      return resolve(getStatsResourceListSync(user, domain, project))
    })
  })
}

function getStatsInfoSync(user: string, domain: string, project: string, statsId: string): StatsInfo {
  return getStatsResourceListSync(user, domain, project).find((stats: StatsInfo) => (stats.id === Number(statsId))) || null
}

export function getStatsInfo(user: string, domain: string, project: string, statsId: string): Promise<StatsInfo> {
  return new Promise<StatsInfo>((resolve: (statsInfo: StatsInfo) => void, reject: (err?: any) => void) => {
    return setImmediate(() => {
      let err = new Error(`stats: stats ID = ${ statsId } is invalid resource.`)
      err.name = "External"
      const statsInfo = getStatsInfoSync(user, domain, project, statsId)
      return statsInfo ? resolve(statsInfo) : reject(err)
    })
  })
}

export function getStatsResourcePathSync(user: string, domain: string, project: string, statsId: string): string {
  const statsInfo = getStatsInfoSync(user, domain, project, statsId)
  return statsInfo && joinResourcePathSync(getProjectResourcePathSync(user, domain, project), statsInfo.name)
}

function validateStatsResourceSync(user: string, domain: string, project: string, statsId: string): boolean {
  return existsResourcePathSync(getStatsResourcePathSync(user, domain, project, statsId) + ".db") && existsResourcePathSync(getStatsResourcePathSync(user, domain, project, statsId) + ".inf")
}

export function validateStatsResource(user: string, domain: string, project: string, statsId: string): Promise<void> {
  return new Promise<void>((resolve: () => void, reject: (err?: any) => void) => {
    return setImmediate(() => {
      let err = new Error(`stats: stats ID = ${ statsId } is invalid stats resource.`)
      err.name = "External"
      return validateStatsResourceSync(user, domain, project, statsId) ? resolve() : reject(err)
    })
  })
}

function existsStatsNameSync(user: string, domain: string, project: string, statsName: string): boolean {
  return !!getStatsResourceListSync(user, domain, project).find((statsInfo: StatsInfo) => (statsInfo.name === statsName))
}

export function existsStatsName(user: string, domain: string, project: string, statsName: string): Promise<void> {
  return new Promise<void>((resolve: () => void, reject: (err?: any) => void) => {
    return setImmediate(() => {
      let err = new Error(`stats: ${ statsName } has already existed.`)
      err.name = "External"
      return existsStatsNameSync(user, domain, project, statsName) ? reject(err) : resolve()
    })
  })
}

export function registerStatsResource(user: string, domain: string, project: string, statsCsv: string, description: string = ""): Promise<StatsInfo> {
  return new Promise<StatsInfo>((resolve: (statsInfo: StatsInfo) => void, reject: (err?: any) => void) => {
    return setImmediate(() => {
      const statsPath: string = joinResourcePathSync(getProjectResourcePathSync(user, domain, project), statsCsv)
      let statsId: string
      let statsInfo: StatsInfo
      let statsName: string

      return extractStatsName(statsPath)
      .then((basename: string) => {
        return existsStatsName(user, domain, project, basename)
      })
      .then(() => {
        return convertStats(statsPath)
      })
      .then((basename: string) => {
        statsName = basename
        return Atomic.lock(getProjectInfoPathSync(user, domain, project))
      })
      .then(() => {
        return getProjectInfo(user, domain, project)
      })
      .then((projectInfo: ProjectInfo) => {
        statsId = String(projectInfo.index++)
        statsInfo = {
          id          : Number(statsId),
          name        : statsName,
          description : description,
          type        : "perfmon",
          available   : true,
        }
        projectInfo.stats.push(statsInfo)
        return updateProjectInfo(user, domain, project, projectInfo)
      })
      .then(() => {
        return Atomic.unlock(getProjectInfoPathSync(user, domain, project))
      })
      .then(() => {
        return resolve(statsInfo)
      })
      .catch((err: any) => {
        return Atomic.unlock(getProjectInfoPathSync(user, domain, project))
        .then(() => {
          return reject(err)
        })
      })
    })
  })
}

export function updateStatsDescription(user: string, domain: string, project: string, statsId: string, description?: string): Promise<void> {
  return new Promise<void>((resolve: () => void, reject: (err?: any) => void) => {
    return setImmediate(() => {
      return Atomic.lock(getProjectInfoPathSync(user, domain, project))
      .then(() => {
        return getProjectInfo(user, domain, project)
      })
      .then((projectInfo: ProjectInfo) => {
        projectInfo.stats = projectInfo.stats.map((statsInfo: StatsInfo) => {
          if (statsInfo.id === Number(statsId)) {
            statsInfo.description = description || ""
          }
          return statsInfo
        })
        return updateProjectInfo(user, domain, project, projectInfo)
      })
      .then(() => {
        return Atomic.unlock(getProjectInfoPathSync(user, domain, project))
      })
      .then(() => {
        return resolve()
      })
      .catch((err: any) => {
        return Atomic.unlock(getProjectInfoPathSync(user, domain, project))
        .then(() => {
          return reject(err)
        })
      })
    })
  })
}

export function deleteStatsResource(user: string, domain: string, project: string, statsId: string): Promise<void> {
  return new Promise<void>((resolve: () => void, reject: (err?: any) => void) => {
    return setImmediate(() => {
      return deleteResource(getStatsResourcePathSync(user, domain, project, statsId) + ".db")
      .then(() => {
        return deleteResource(getStatsResourcePathSync(user, domain, project, statsId) + ".inf")
      })
      .then(() => {
        return Atomic.lock(getProjectInfoPathSync(user, domain, project))
      })
      .then(() => {
        return getProjectInfo(user, domain, project)
      })
      .then((projectInfo: ProjectInfo) => {
        projectInfo.stats = projectInfo.stats.filter((statsInfo: StatsInfo) => (statsInfo.id !== Number(statsId)))
        return updateProjectInfo(user, domain, project, projectInfo)
      })
      .then(() => {
        return Atomic.unlock(getProjectInfoPathSync(user, domain, project))
      })
      .then(() => {
        return resolve()
      })
      .catch((err: any) => {
        return Atomic.unlock(getProjectInfoPathSync(user, domain, project))
        .then(() => {
          return reject(err)
        })
      })
    })
  })
}

export function getStatsCounterList(user: string, domain: string, project: string, statsId: string, option?: string): Promise<any> {
  return new Promise<any>((resolve: (counters: any) => void, reject: (err?: any) => void) => {
    return setImmediate(() => {
      return getStatsCounters(getStatsResourcePathSync(user, domain, project, statsId) + ".db", option)
      .then((counters: any) => {
        return resolve(counters)
      })
      .catch((err: any) => {
        return reject(err)
      })
    })
  })
}

export function getStatsCounterData(user: string, domain: string, project: string, statsId: string, counter: string): Promise<any> {
  return new Promise<any>((resolve: (counters: any) => void, reject: (err?: any) => void) => {
    return setImmediate(() => {
      return getStatsSpecificData(getStatsResourcePathSync(user, domain, project, statsId) + ".db", counter)
      .then((data: any) => {
        return resolve(data)
      })
      .catch((err: any) => {
        return reject(err)
      })
    })
  })
}

//---
