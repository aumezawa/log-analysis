import * as express from "express"
import { Router, Request, Response, NextFunction } from "express"

import * as fs from "fs"
import * as multer from "multer"
import * as os from "os"
import * as path from "path"
import * as tar from "tar"

import logger = require("../lib/logger")

import FSTool from "../lib/fs-tool"
import TypeGurad from "../lib/type-guard"

const rootPath: string = process.cwd()

const router: Router = express.Router()

router.param("domain", (req: Request, res: Response, next: NextFunction, domain: string) => {
  if (!req.app.get("domains").split(",").includes(domain)) {
    // Bad Request
    return res.status(400).json({
      msg: `domain: ${ domain } does not exist.`
    })
  }

  let domainPath: string
  if (req.app.get("storage-path").slice(0, 1) === "/" || req.app.get("storage-path").slice(1, 3) === ":\\") {
    domainPath = req.app.get("storage-path")
  } else {
    domainPath = path.join(rootPath, req.app.get("storage-path"))
  }
  domainPath = path.join(domainPath, (domain === "private") ? req.token.usr : domain)

  try {
    fs.mkdirSync(domainPath)
  } catch (err) {
    if (err instanceof Error) {
      if (TypeGurad.isErrnoException(err) && (err as NodeJS.ErrnoException).code === "EEXIST") {
        // Nothing to do, continue
        ;
      } else {
        // Internal Server Error
        logger.error(`${ err.name }: ${ err.message }`)
        return res.status(500).json({
          msg: "Contact an administrator."
        })
      }
    } else {
      logger.error(`${ err }`)
      // Internal Server Error
      return res.status(500).json({
        msg: "Contact an administrator."
      })
    }
  }

  req.resPath = domainPath
  next()
})

router.param("projectName", (req: Request, res: Response, next: NextFunction, projectName: string) => {
  if (!req.resPath) {
    logger.error("req.resPath does not exit...")
    // Internal Server Error
    return res.status(500).json({
      msg: "Contact an administrator."
    })
  }

  const projectPath: string = path.join(req.resPath, projectName)
  const projectInfoPath: string = path.join(projectPath, "project.inf")

  try {
    fs.statSync(projectPath)
  } catch (err) {
    if (err instanceof Error) {
      logger.error(`${ err.name }: ${ err.message }`)
      if (TypeGurad.isErrnoException(err) && (err as NodeJS.ErrnoException).code === "ENOENT") {
        // Bad Request
        return res.status(400).json({
          msg: `project: ${ projectName } does not exist.`
        })
      }
    }
    // Internal Server Error
    return res.status(500).json({
      msg: "Contact an administrator."
    })
  }

  try {
    fs.statSync(projectInfoPath)
  } catch (err) {
    if (err instanceof Error) {
      logger.error(`${ err.name }: ${ err.message }`)
    }
    // Internal Server Error
    return res.status(500).json({
      msg: "Contact an administrator."
    })
  }

  req.resPath = projectPath
  req.projectInfoPath = projectInfoPath
  next()
})

router.param("bundleId", (req: Request, res: Response, next: NextFunction, bundleId: string) => {
  if (!req.resPath) {
    logger.error("req.resPath does not exist...")
    // Internal Server Error
    return res.status(500).json({
      msg: "Contact an administrator."
    })
  }

  if (!req.projectInfoPath) {
    logger.error("req.projectInfoPath does not exist...")
    // Internal Server Error
    return res.status(500).json({
      msg: "Contact an administrator."
    })
  }

  let bundleInfo: BundleInfo
  try {
    bundleInfo = JSON.parse(fs.readFileSync(req.projectInfoPath, "utf8")).bundles.find((bundle: BundleInfo) => (
      Number(bundleId) === bundle.id
    ))
  } catch (err) {
    if (err instanceof Error) {
      logger.error(`${ err.name }: ${ err.message }`)
    }
    // Internal Server Error
    return res.status(500).json({
      msg: "Contact an administrator."
    })
  }

  if (!bundleInfo) {
    // Bad Request
    return res.status(400).json({
      msg: `bundle: bundle ID=${ bundleId } does not exist.`
    })
  }

  if (!bundleInfo.available) {
    // Bad Request
    return res.status(400).json({
      msg: `bundle: bundle ID=${ bundleId } is not available.`
    })
  }

  const bundlePath: string = path.join(req.resPath, bundleInfo.name)

  try {
    fs.statSync(bundlePath)
  } catch (err) {
    if (err instanceof Error) {
      logger.error(`${ err.name }: ${ err.message }`)
    }
    // Internal Server Error
    return res.status(500).json({
      msg: "Contact an administrator."
    })
  }

  req.resPath = bundlePath
  next()
})

/* -------------------------------------------------------------------------- */

router.route("/:domain([0-9a-z]+)/projects/:projectName([0-9a-zA-Z_.#]+)/bundles/:bundleId([0-9]+)/files/*")
.get((req: Request, res: Response, next: NextFunction) => {
  const nodePath: string = path.join(req.resPath, req.params[0])

  let fileStat: fs.Stats
  try {
    fileStat = fs.statSync(nodePath)
  } catch (err) {
    if (err instanceof Error) {
      logger.error(`${ err.name }: ${ err.message }`)
      if (TypeGurad.isErrnoException(err) && (err as NodeJS.ErrnoException).code === "ENOENT") {
        // Bad Request
        return res.status(400).json({
          msg: `file: /${ req.params[0] } does not exist in project ${ req.params.projectName } bundle ID=${ req.params.bundleId }.`
        })
      }
    }
    // Internal Server Error
    return res.status(500).json({
      msg: "Contact an administrator."
    })
  }

  try {
    if (fileStat.isDirectory()) {
      // OK
      return res.status(200).json({
        msg: `You get a file list of path /${ req.params[0] } of project ${ req.params.projectName } bundle ID=${ req.params.bundleId }.`,
        files: fs.readdirSync(nodePath)
      })
    } else {
      if (req.query.mode && req.query.mode === "plain") {
        // OK
        return res.status(200).sendFile(nodePath)
      }
      if (req.query.mode && req.query.mode === "download") {
        // OK
        return res.status(200).download(nodePath, path.basename(nodePath))
      }
      if (req.query.mode && req.query.mode === "json") {
        if (fileStat.size >= 104857600) {
          // Service Unavailable
          return res.status(503).json({
            msg: "This file's size is too large. Please use legacy view."
          })
        }

        let content: any = null
        if (req.app.get("date-format") !== "") {
          const regex = new RegExp(`^(${ req.app.get("date-format") }) (.*)$`)
          const fd = fs.openSync(nodePath, "r")
          const buffer = Buffer.alloc(80)
          fs.readSync(fd, buffer, 0, 80, 0)
          fs.closeSync(fd)

          if (!!buffer.toString("utf8").match(regex)) {
            content = {
              format: {
                title     : path.basename(nodePath),
                label     : { Date: "date", Content: "text" },
                hasHeader : true,
                hasIndex  : true,
                contentKey: "Content"
              },
              data: fs.readFileSync(nodePath, "utf8").split(/\r\n|\n|\r/).map((line: string) => {
                const match = line.match(regex)
                if (!!match) {
                  return { Date: match[1], Content: match[2] }
                }
                return { Date: "", Content: line }
              })
            }
          }
        }

        if (!content) {
          content = {
            format: {
              title     : path.basename(nodePath),
              label     : { Content: "text" },
              hasHeader : true,
              hasIndex  : true,
              contentKey: "Content"
            },
            data: fs.readFileSync(nodePath, "utf8").split(/\r\n|\n|\r/).map((line: string) => ({ Content: line }))
          }
        }

        // OK
        return res.status(200).json({
          msg: `You get a file content of path /${ req.params[0] } of project ${ req.params.projectName } bundle ID=${ req.params.bundleId }.`,
          content: content,
          size: fileStat.size,
          modifiedAt: fileStat.mtime
        })
      }
      if (req.query.mode && req.query.mode === "term") {
        // OK
        return res.status(200).json({
          msg: `You get a terminal command to open the file of path /${ req.params[0] } of project ${ req.params.projectName } bundle ID=${ req.params.bundleId }.`,
          cmd: `${ os.platform() === "win32" ? "more" : "less" } ${ nodePath }`
        })
      }
      // OK
      return res.status(200).json({
        msg: `You get a file content of path /${ req.params[0] } of project ${ req.params.projectName } bundle ID=${ req.params.bundleId }.`,
        content: fs.readFileSync(nodePath, "utf8"),
        size: fileStat.size,
        modifiedAt: fileStat.mtime
      })
    }
  } catch (err) {
    if (err instanceof Error) {
      logger.error(`${ err.name }: ${ err.message }`)
    }
    // Internal Server Error
    return res.status(500).json({
      msg: "Contact an administrator."
    })
  }
})
.all((req: Request, res: Response, next: NextFunction) => {
  // Method Not Allowed
  return res.status(405).json({
    msg: "GET method is only supported."
  })
})

router.route("/:domain([0-9a-z]+)/projects/:projectName([0-9a-zA-Z_.#]+)/bundles/:bundleId([0-9]+)/files")
.get((req: Request, res: Response, next: NextFunction) => {
  let allFiles: NodeType
  try {
    const lsRecursive: (node: string) => NodeType = (node) => {
      if (fs.statSync(node).isDirectory()) {
        return ({
          name: path.basename(node),
          file: false,
          children: fs.readdirSync(node).map((name: string) => lsRecursive(path.join(node, name))).filter((node: NodeType) => (!!node))
        })
      } else {
        if (req.query.search && typeof(req.query.search) === "string" && !fs.readFileSync(node, "utf8").includes(decodeURI(req.query.search))) {
          return null
        }
        return ({
          name: path.basename(node),
          file: true
        })
      }
    }
    allFiles = lsRecursive(req.resPath)
  } catch (err) {
    if (err instanceof Error) {
      logger.error(`${ err.name }: ${ err.message }`)
    }
    // Internal Server Error
    return res.status(500).json({
      msg: "Contact an administrator."
    })
  }

  // OK
  return res.status(200).json({
    msg: `You get a file list of project ${ req.params.projectName } bundle ID=${ req.params.bundleId }.`,
    files: allFiles
  })
})
.all((req: Request, res: Response, next: NextFunction) => {
  // Method Not Allowed
  return res.status(405).json({
    msg: "GET method is only supported."
  })
})


router.route("/:domain([0-9a-z]+)/projects/:projectName([0-9a-zA-Z_.#]+)/bundles/:bundleId([0-9]+)")
.get((req: Request, res: Response, next: NextFunction) => {
  let bundleInfo: BundleInfo
  try {
    bundleInfo = JSON.parse(fs.readFileSync(req.projectInfoPath, "utf8")).bundles.find((bundle: BundleInfo) => (
      (Number(req.params.bundleId) === bundle.id)
    ))
  } catch (err) {
    if (err instanceof Error) {
      logger.error(`${ err.name }: ${ err.message }`)
    }
    // Internal Server Error
    return res.status(500).json({
      msg: "Contact an administrator."
    })
  }

  // OK
  return res.status(200).json({
    msg: `You get a bundle name and description of project ${ req.params.projectName }.`,
    name: bundleInfo.name,
    description: bundleInfo.description
  })
})
.put((req: Request, res: Response, next: NextFunction) => {
  if (!req.body.description) {
    // Bad Request
    return res.status(400).json({
      msg: "Bundle description is required. (param name: description)"
    })
  }

  let projectInfo: ProjectInfo
  try {
    projectInfo = JSON.parse(fs.readFileSync(req.projectInfoPath, "utf8"))
    projectInfo.bundles = projectInfo.bundles.map((bundle: BundleInfo) => {
      if (Number(req.params.bundleId) === bundle.id) {
        bundle.description = req.body.description
      }
      return bundle
    })
    fs.writeFileSync(req.projectInfoPath, JSON.stringify(projectInfo))
  } catch (err) {
    if (err instanceof Error) {
      logger.error(`${ err.name }: ${ err.message }`)
    }
    // Internal Server Error
    return res.status(500).json({
      msg: "Contact an administrator."
    })
  }

  // OK
  return res.status(200).json({
    msg: `bundle: bundle ID=${ req.params.bundleId } description was updated successfully.`
  })
})
.delete((req: Request, res: Response, next: NextFunction) => {
  if (!["public", "private"].includes(req.params.domain) && req.token.prv !== "root") {
    // Bad Request
    return res.status(400).json({
      msg: `bundle: ${ path.basename(req.resPath) } is only deleted by an administrator.`
    })
  }

  let projectInfo: ProjectInfo
  try {
    projectInfo = JSON.parse(fs.readFileSync(req.projectInfoPath, "utf8"))
    projectInfo.bundles = projectInfo.bundles.filter((bundle: BundleInfo) => (
      (Number(req.params.bundleId) !== bundle.id)
    ))
    fs.writeFileSync(req.projectInfoPath, JSON.stringify(projectInfo))
  } catch (err) {
    if (err instanceof Error) {
      logger.error(`${ err.name }: ${ err.message }`)
    }
    // Internal Server Error
    return res.status(500).json({
      msg: "Contact an administrator."
    })
  }

  try {
    FSTool.rmRecursiveSync(req.resPath)
  } catch (err) {
    if (err instanceof Error) {
      logger.error(`${ err.name }: ${ err.message }`)
    }
    // Internal Server Error
    return res.status(500).json({
      msg: "Contact an administrator."
    })
  }

  // OK
  return res.status(200).json({
    msg: `bundle: bundle ID=${ req.params.bundleId } was deleted successfully.`
  })
})
.all((req: Request, res: Response, next: NextFunction) => {
  // Method Not Allowed
  return res.status(405).json({
    msg: "GET/PUT/DELETE method are only supported."
  })
})

router.route("/:domain([0-9a-z]+)/projects/:projectName([0-9a-zA-Z_.#]+)/bundles")
.get((req: Request, res: Response, next: NextFunction) => {
  let projectInfo: ProjectInfo
  try {
    projectInfo = JSON.parse(fs.readFileSync(req.projectInfoPath, "utf8"))
  } catch (err) {
    if (err instanceof Error) {
      logger.error(`${ err.name }: ${ err.message }`)
    }
    // Internal Server Error
    return res.status(500).json({
      msg: "Contact an administrator."
    })
  }

  // OK
  return res.status(200).json({
    msg: `You get a bundle list of project ${ req.params.projectName }.`,
    bundles: projectInfo.bundles
  })
})
.post((req: Request, res: Response, next: NextFunction) => {
  return multer({
    storage: multer.diskStorage({
      destination : (req, file, cb) => cb(null, req.resPath),
      filename    : (req, file, cb) => cb(null, file.originalname)
    })
  }).single("bundle")(req, res, (err: Error) => {
    if (err) {
      if (err instanceof Error) {
        logger.error(`${ err.name }: ${ err.message }`)
      }
      // Bad Request
      return res.status(400).json({
        msg: "log bundle is required. (param name: bundle)"
      })
    }

    if (!req.file) {
      // Bad Request
      return res.status(400).json({
        msg: "log bundle is required. (param name: bundle)"
      })
    }

    const uploadFilePath: string = path.join(req.resPath, req.file.originalname)
    let bundleName: string = null
    try {
      // NOTE: Get only the first entry.
      let first: boolean = true
      tar.list({
        file: uploadFilePath,
        sync: true,
        filter: (path: string, entry: tar.FileStat) => (first && !(first = false)),
        onentry: (entry: tar.FileStat) => {
          const match = entry.header.path.match(/([^/]+)[/]/)
          bundleName = (match ? match[1] : null)
        }
      })
    } catch {
      if (err instanceof Error) {
        logger.error(`${ err.name }: ${ err.message }`)
      }
      // Internal Server Error
      return res.status(500).json({
        msg: "Contact an administrator."
      })
    }

    if (!bundleName) {
      logger.error(`bundleName was not extracted from ${ uploadFilePath }.`)
      // Bad Request
      return res.status(400).json({
        msg: `bundle: Is ${ req.file.originalname } valid tgz file?`
      })
    }

    let projectInfo: ProjectInfo
    try {
      projectInfo = JSON.parse(fs.readFileSync(req.projectInfoPath, "utf8"))
    } catch (err) {
      if (err instanceof Error) {
        logger.error(`${ err.name }: ${ err.message }`)
      }
      // Internal Server Error
      return res.status(500).json({
        msg: "Contact an administrator."
      })
    }

    if (!!projectInfo.bundles.find((bundle: BundleInfo) => (bundle.name === bundleName))) {
      // Bad Request
      return res.status(400).json({
        msg: `bundle: ${ req.file.originalname } is already exists.`
      })
    }

    const bundleId: number = projectInfo.index
    const bundleDesc: string = req.body.description || ""
    projectInfo.bundles.push({
      id          : bundleId,
      name        : bundleName,
      description : bundleDesc,
      available   : false
    })
    projectInfo.index++

    try {
      fs.writeFileSync(req.projectInfoPath, JSON.stringify(projectInfo))
    } catch (err) {
      if (err instanceof Error) {
        logger.error(`${ err.name }: ${ err.message }`)
      }
      // Internal Server Error
      return res.status(500).json({
        msg: "Contact an administrator."
      })
    }

    // TODO: temporary code, want to kick other scripts
    FSTool.decompressTgz(path.basename(uploadFilePath, ".tgz"), req.resPath, (err: Error) => {
      if (err) {
        logger.error(`${ err.name }: ${ err.message }`)
        return
      }
      try {
        const projectInfo = JSON.parse(fs.readFileSync(req.projectInfoPath, "utf8"))
        projectInfo.bundles = projectInfo.bundles.map((bundle: BundleInfo) => {
          if (bundle.id === bundleId) {
            bundle.available = true
          }
          return bundle
        })
        fs.writeFileSync(req.projectInfoPath, JSON.stringify(projectInfo))
      } catch (err) {
        if (err instanceof Error) {
          logger.error(`${ err.name }: ${ err.message }`)
        }
      }
      logger.info(`${ uploadFilePath } was decompressed successfully.`)
    })

    // Created
    return res.status(201).location(`${ req.protocol }://${ req.headers.host }${ req.path }/`).json({
      msg: `bundle: ${ req.file.originalname } was uploaded successfully.`
    })
  })
})
.all((req: Request, res: Response, next: NextFunction) => {
  // Method Not Allowed
  return res.status(405).json({
    msg: "GET/POST method are only supported."
  })
})

router.route("/:domain([0-9a-z]+)/projects/:projectName([0-9a-zA-Z_.#]+)")
.get((req: Request, res: Response, next: NextFunction) => {
  let projectInfo: ProjectInfo
  try {
    projectInfo = JSON.parse(fs.readFileSync(req.projectInfoPath, "utf8"))
    if (projectInfo.status === undefined) {
      projectInfo.status = "open"
    }
  } catch (err) {
    if (err instanceof Error) {
      logger.error(`${ err.name }: ${ err.message }`)
    }
    // Internal Server Error
    return res.status(500).json({
      msg: "Contact an administrator."
    })
  }

  // OK
  return res.status(200).json({
    msg: "You get a project status and description.",
    status: projectInfo.status,
    description: projectInfo.description
  })
})
.put((req: Request, res: Response, next: NextFunction) => {
  if (!req.body.description && !req.body.status) {
    // Bad Request
    return res.status(400).json({
      msg: "Project status or description is required. (param name: status, description)"
    })
  }

  let projectInfo: ProjectInfo
  try {
    projectInfo = JSON.parse(fs.readFileSync(req.projectInfoPath, "utf8"))

    if (projectInfo.status === undefined) {
      projectInfo.status = "open"
    }
    if (req.body.status && (req.body.status === "open" || req.body.status === "close")) {
      projectInfo.status = req.body.status
    }

    if (req.body.description) {
      projectInfo.description = req.body.description
    }
    fs.writeFileSync(req.projectInfoPath, JSON.stringify(projectInfo))
  } catch (err) {
    if (err instanceof Error) {
      logger.error(`${ err.name }: ${ err.message }`)
    }
    // Internal Server Error
    return res.status(500).json({
      msg: "Contact an administrator."
    })
  }

  projectInfo.bundles.forEach((bundleInfo: BundleInfo) => {
    let bundleDirPath = path.join(req.resPath, bundleInfo.name)
    let bundleZipPath = bundleDirPath + ".tgz"

    if (fs.existsSync(bundleDirPath) && fs.existsSync(bundleZipPath)) {
      let rmNode = (projectInfo.status === "open") ? bundleZipPath : bundleDirPath
      FSTool.rmRecursive(rmNode, (err: Error) => {
        if (err) {
          logger.error(`${ err.name }: ${ err.message }`)
        }
      })
    } else if (!fs.existsSync(bundleDirPath) && fs.existsSync(bundleZipPath)) {
      if (projectInfo.status === "open") {
        FSTool.decompressTgz(bundleInfo.name, req.resPath, (err: Error) => {
          if (err) {
            logger.error(`${ err.name }: ${ err.message }`)
            return
          }
          try {
            const projectInfo = JSON.parse(fs.readFileSync(req.projectInfoPath, "utf8"))
            projectInfo.bundles = projectInfo.bundles.map((bundle: BundleInfo) => {
              if (bundle.id === bundleInfo.id) {
                bundle.available = true
              }
              return bundle
            })
            fs.writeFileSync(req.projectInfoPath, JSON.stringify(projectInfo))
          } catch (err) {
            if (err instanceof Error) {
              logger.error(`${ err.name }: ${ err.message }`)
            }
          }
          logger.info(`${ bundleInfo.name } was decompressed successfully.`)
        })
      }
    } else if (fs.existsSync(bundleDirPath) && !fs.existsSync(bundleZipPath)) {
      if (projectInfo.status === "close") {
        FSTool.compressTgz(bundleInfo.name, req.resPath, (err: Error) => {
          if (err) {
            logger.error(`${ err.name }: ${ err.message }`)
            return
          }
          try {
            const projectInfo = JSON.parse(fs.readFileSync(req.projectInfoPath, "utf8"))
            projectInfo.bundles = projectInfo.bundles.map((bundle: BundleInfo) => {
              if (bundle.id === bundleInfo.id) {
                bundle.available = false
              }
              return bundle
            })
            fs.writeFileSync(req.projectInfoPath, JSON.stringify(projectInfo))
          } catch (err) {
            if (err instanceof Error) {
              logger.error(`${ err.name }: ${ err.message }`)
            }
          }
          logger.info(`${ bundleInfo.name } was compressed successfully.`)
        })
      }
    }
  })

  // OK
  return res.status(200).json({
    msg: `project: ${ req.params.projectName } was updated successfully.`
  })
})
.delete((req: Request, res: Response, next: NextFunction) => {
  if (!["public", "private"].includes(req.params.domain) && req.token.prv !== "root") {
    // Bad Request
    return res.status(400).json({
      msg: `project: ${ req.params.projectName } is only deleted by an administrator.`
    })
  }

  try {
    FSTool.rmRecursiveSync(req.resPath)
  } catch (err) {
    if (err instanceof Error) {
      logger.error(`${ err.name }: ${ err.message }`)
    }
    // Internal Server Error
    return res.status(500).json({
      msg: "Contact an administrator."
    })
  }

  // OK
  return res.status(200).json({
    msg: `project: ${ req.params.projectName } was deleted successfully.`
  })
})
.all((req: Request, res: Response, next: NextFunction) => {
  // Method Not Allowed
  return res.status(405).json({
    msg: "GET/DELETE method are only supported."
  })
})

router.route("/:domain([0-9a-z]+)/projects")
.get((req: Request, res: Response, next: NextFunction) => {
  let dirList: Array<string> = []
  try {
    dirList = fs.readdirSync(req.resPath)
  } catch (err) {
    if (err instanceof Error) {
      logger.error(`${ err.name }: ${ err.message }`)
    }
    // Internal Server Error
    return res.status(500).json({
      msg: "Contact an administrator."
    })
  }

  const projectList: Array<ProjectSummary> = dirList.map((project: string) => {
    try {
      const projectInfo: ProjectInfo = JSON.parse(fs.readFileSync(path.join(req.resPath, project, "project.inf"), "utf8"))
      if (projectInfo.status === undefined) {
        projectInfo.status = "open"
      }
      return ({
        name        : projectInfo.name,
        status      : projectInfo.status,
        description : projectInfo.description
      })
    } catch (err) {
      if (err instanceof Error) {
        logger.error(`${ err.name }: ${ err.message }`)
      }
      return null
    }
  }).filter((project: ProjectSummary) => (!!project))

  // OK
  return res.status(200).json({
    msg: "You get a project list.",
    projects: projectList
  })
})
.post((req: Request, res: Response, next: NextFunction) => {
  if (!req.body.name) {
    // Bad Request
    return res.status(400).json({
      msg: "Project name is required. (param name: name)"
    })
  }

  if (!req.body.name.match(/^[0-9a-zA-Z_.#]+$/)) {
    // Bad Request
    return res.status(400).json({
      msg: "Project name must match the RegExp. (RegExp: /^[0-9a-zA-Z_.#]+$/)"
    })
  }

  const projectPath = path.join(req.resPath, req.body.name)

  try {
    fs.mkdirSync(projectPath)
  } catch (err) {
    if (err instanceof Error) {
      logger.error(`${ err.name }: ${ err.message }`)
      if (TypeGurad.isErrnoException(err) && (err as NodeJS.ErrnoException).code === "EEXIST") {
        return res.status(409).json({
          msg: `project: ${ req.body.name } already exists.`
        })
      }
    }
    // Internal Server Error
    return res.status(500).json({
      msg: "Contact an administrator."
    })
  }

  try {
    fs.writeFileSync(path.join(projectPath, "project.inf"), JSON.stringify({
      name: req.body.name,
      status: "open",
      description: req.body.description || "",
      index: 0,
      bundles: []
    }))
  } catch (err) {
    if (err instanceof Error) {
      logger.error(`${ err.name }: ${ err.message }`)
    }
    // Internal Server Error
    return res.status(500).json({
      msg: "Contact an administrator."
    })
  }

  // Created
  return res.status(201).location(`${ req.protocol }://${ req.headers.host }${ req.path }/${ req.body.name }`).json({
    msg: `project: ${ req.body.name } was created successfully.`
  })
})
.all((req: Request, res: Response, next: NextFunction) => {
  // Method Not Allowed
  return res.status(405).json({
    msg: "GET/POST method are only supported."
  })
})


router.route("/:domain([0-9a-z]+)")
.get((req: Request, res: Response, next: NextFunction) => {
  // OK
  return res.status(200).json({
    msg: `domain: ${ req.params.domain } is available.`
  })
})
.all((req: Request, res: Response, next: NextFunction) => {
  // Method Not Allowed
  return res.status(405).json({
    msg: "GET method are only supported."
  })
})


export default router
