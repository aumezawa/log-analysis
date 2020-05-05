import * as express from "express"
import { Router, Request, Response, NextFunction } from "express"

import * as fs from "fs"
import * as multer from "multer"
import * as path from "path"

import logger = require("../lib/logger")

const router: Router = express.Router()

const rootpath: string = process.cwd()
const storagePath: string = path.join(rootpath, "..", "data")

router.param("domain", (req: Request, res: Response, next: NextFunction, domain: string) => {
  const domainPath: string = path.join(storagePath, (domain === "private") ? req.token.usr : "public")

  let domainExists: boolean
  try {
    domainExists = fs.existsSync(domainPath)
  } catch (err) {
    if (err instanceof Error) {
      logger.error(`${ err.name }: ${ err.message }`)
    }
    // Internal Server Error
    return res.status(500).json({
      msg: "Contact an administrator."
    })
  }

  if (!domainExists) {
    try {
      fs.mkdirSync(domainPath)
    } catch (err) {
      if (err instanceof Error) {
        logger.error(`${ err.name }: ${ err.message }`)
      }
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

  let projectExists: boolean
  try {
    projectExists = fs.existsSync(projectPath)
  } catch (err) {
    if (err instanceof Error) {
      logger.error(`${ err.name }: ${ err.message }`)
    }
    // Internal Server Error
    return res.status(500).json({
      msg: "Contact an administrator."
    })
  }

  if (!projectExists) {
    // Bad Request
    return res.status(400).json({
      msg: `project: ${ projectName } does not exist.`
    })
  }

  let projectInfoExists: boolean
  try {
    projectInfoExists = fs.existsSync(projectInfoPath)
  } catch (err) {
    if (err instanceof Error) {
      logger.error(`${ err.name }: ${ err.message }`)
    }
    // Internal Server Error
    return res.status(500).json({
      msg: "Contact an administrator."
    })
  }

  if (!projectInfoExists) {
    logger.error(`${ projectInfoPath } does not exist...`)
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

  const bundlePath: string = path.join(req.resPath, bundleInfo.name)

  let bundleExists: boolean
  try {
    bundleExists = fs.existsSync(bundlePath)
  } catch (err) {
    if (err instanceof Error) {
      logger.error(`${ err.name }: ${ err.message }`)
    }
    // Internal Server Error
    return res.status(500).json({
      msg: "Contact an administrator."
    })
  }

  if (!bundleExists) {
    // Bad Request
    return res.status(400).json({
      msg: `bundle: ${ bundlePath } does not exist.`
    })
  }

  req.resPath = bundlePath
  next()
})

/* -------------------------------------------------------------------------- */

router.route("/:domain(private|public)/projects/:projectName([0-9a-zA-Z_.#]+)/bundles/:bundleId([0-9]+)/files/*")
.get((req: Request, res: Response, next: NextFunction) => {
  const nodePath: string = path.join(req.resPath, req.params[0])

  let nodeExists: boolean
  try {
    nodeExists = fs.existsSync(nodePath)
  } catch (err) {
    if (err instanceof Error) {
      logger.error(`${ err.name }: ${ err.message }`)
    }
    // Internal Server Error
    return res.status(500).json({
      msg: "Contact an administrator."
    })
  }

  if (!nodeExists) {
    // Bad Request
    return res.status(400).json({
      msg: `file: /${ req.params[0] } does not exist in project ${ req.params.projectName } bundle ID=${ req.params.bundleId }.`
    })
  }

  try {
    if (fs.statSync(nodePath).isDirectory()) {
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
      // OK
      return res.status(200).json({
        msg: `You get a file content of path /${ req.params[0] } of project ${ req.params.projectName } bundle ID=${ req.params.bundleId }.`,
        content: fs.readFileSync(nodePath, "utf8"),
        size: fs.statSync(nodePath).size,
        modifiedAt: fs.statSync(nodePath).mtime
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

router.route("/:domain(private|public)/projects/:projectName([0-9a-zA-Z_.#]+)/bundles/:bundleId([0-9]+)/files")
.get((req: Request, res: Response, next: NextFunction) => {
  let allFiles: NodeType
  try {
    const lsRecursive: (node: string) => NodeType = (node) => {
      if (fs.statSync(node).isDirectory()) {
        return ({
          name: path.basename(node),
          file: false,
          children: fs.readdirSync(node).map((name: string) => lsRecursive(path.join(node, name)))
        })
      } else {
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


router.route("/:domain(private|public)/projects/:projectName([0-9a-zA-Z_.#]+)/bundles/:bundleId([0-9]+)")
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
    msg: `You get a bundle description of project ${ req.params.projectName }.`,
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
  if (req.params.domain === "private" && req.token.prv !== "root") {
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
    const rmRecursive: (node: string) => void = (node) => {
      if (fs.statSync(node).isDirectory()) {
        fs.readdirSync(node).forEach((child) => rmRecursive(path.join(node, child)))
        fs.rmdirSync(node)
      } else {
        fs.unlinkSync(node)
      }
    }
    rmRecursive(req.resPath)
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

router.route("/:domain(private|public)/projects/:projectName([0-9a-zA-Z_.#]+)/bundles")
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
  // OK
  return res.status(200).json({
    msg: "Out of service.",
  })

  /*if (!req.body.bundle) {
    // Bad Request
    return res.status(400).json({
      msg: "log bundle is required. (param name: bundle)"
    })
  }

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
      // Internal Server Error
      return res.status(500).json({
        msg: "Contact an administrator."
      })
    }

    // Created
    return res.status(201).json({
      msg: `bundle: ${ req.file.originalname } was created successfully.`
    })
  })*/
})
.all((req: Request, res: Response, next: NextFunction) => {
  // Method Not Allowed
  return res.status(405).json({
    msg: "GET/POST method are only supported."
  })
})

router.route("/:domain(private|public)/projects/:projectName([0-9a-zA-Z_.#]+)")
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
    msg: "You get a project description.",
    description: projectInfo.description
  })
})
.put((req: Request, res: Response, next: NextFunction) => {
  if (!req.body.description) {
    // Bad Request
    return res.status(400).json({
      msg: "Project description is required. (param name: description)"
    })
  }

  let projectInfo: ProjectInfo
  try {
    projectInfo = JSON.parse(fs.readFileSync(req.projectInfoPath, "utf8"))
    projectInfo.description = req.body.description
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
    msg: `project: ${ req.params.projectName } description was updated successfully.`
  })
})
.delete((req: Request, res: Response, next: NextFunction) => {
  if (req.params.domain === "private" && req.token.prv !== "root") {
    // Bad Request
    return res.status(400).json({
      msg: `project: ${ req.params.projectName } is only deleted by an administrator.`
    })
  }

  try {
    const rmRecursive: (node: string) => void = (node) => {
      if (fs.statSync(node).isDirectory()) {
        fs.readdirSync(node).forEach((child) => rmRecursive(path.join(node, child)))
        fs.rmdirSync(node)
      } else {
        fs.unlinkSync(node)
      }
    }
    rmRecursive(req.resPath)
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

router.route("/:domain(private|public)/projects")
.get((req: Request, res: Response, next: NextFunction) => {
  let list: Array<string>
  try {
    list = fs.readdirSync(req.resPath)
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
    msg: "You get a project list.",
    projects: list
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

  let projectExists: boolean
  try {
    projectExists = fs.existsSync(projectPath)
  } catch (err) {
    if (err instanceof Error) {
      logger.error(`${ err.name }: ${ err.message }`)
    }
    // Internal Server Error
    return res.status(500).json({
      msg: "Contact an administrator."
    })
  }

  if (projectExists) {
    // Conflict
    return res.status(409).json({
      msg: `project: ${ req.body.name } already exists.`
    })
  }

  try {
    fs.mkdirSync(projectPath)
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
    fs.writeFileSync(path.join(projectPath, "project.inf"), JSON.stringify({
      name: req.body.name,
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

export default router