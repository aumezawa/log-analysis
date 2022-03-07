import * as express from "express"
import { Router, Request, Response, NextFunction } from "express"

import * as multer from "multer"
import * as os from "os"

import logger = require("../lib/logger")

import * as Project from "../lib/project"

const router: Router = express.Router()

/* -------------------------------------------------------------------------- */

router.param("domain", (req: Request, res: Response, next: NextFunction, domain: string) => {
  req.domain = decodeURIComponent(domain)

  if (req.token.usr === "anonymous" && req.domain !== "public") {
    // Forbidden
    return res.status(403).json({ msg: "Not be permitted to access." })
  }

  return Project.createDomainResource(req.token.usr, req.domain)
  .catch(() => {
    return
  })
  .then(() => {
    return Project.validateDomainResource(req.token.usr, req.domain)
  })
  .then(() => {
    return next()
  })
  .catch((err: any) => {
    return ((err instanceof Error) && (err.name === "External"))
      ? // Bad Request
        res.status(400).json({ msg: err.message })
      : // Internal Server Error
        res.status(500).json({ msg: "Contact an administrator." })
  })
})

router.param("projectName", (req: Request, res: Response, next: NextFunction, projectName: string) => {
  req.project = decodeURIComponent(projectName)

  return Project.validateProjectResource(req.token.usr, req.domain, req.project)
  .then(() => {
    return next()
  })
  .catch((err: any) => {
    return ((err instanceof Error) && (err.name === "External"))
      ? // Bad Request
        res.status(400).json({ msg: err.message })
      : // Internal Server Error
        res.status(500).json({ msg: "Contact an administrator." })
  })
})

router.param("bundleId", (req: Request, res: Response, next: NextFunction, bundleId: string) => {
  req.bundleId = decodeURIComponent(bundleId)

  return Project.validateBundleResource(req.token.usr, req.domain, req.project, req.bundleId)
  .then(() => {
    return Project.getBundleInfo(req.token.usr, req.domain, req.project, req.bundleId)
  })
  .then((bundleInfo: BundleInfo) => {
    req.bundleName = bundleInfo.name
    return next()
  })
  .catch((err: any) => {
    return ((err instanceof Error) && (err.name === "External"))
      ? // Bad Request
        res.status(400).json({ msg: err.message })
      : // Internal Server Error
        res.status(500).json({ msg: "Contact an administrator." })
  })
})

/* -------------------------------------------------------------------------- */

router.route("/:domain/projects/:projectName/bundles/:bundleId/report")
.get((req: Request, res: Response, next: NextFunction) => {
  return Project.getLogReport(req.token.usr, req.domain, req.project, req.bundleId)
  .then((doc: BasicDocument) => {
    // OK
    return res.status(200)
      .set({
        "Content-Disposition" : `attachment; filename="${ doc.name }"`,
        "Accept-Ranges"       : "bytes",
        "Cache-Control"       : "public, max-age=0",
        "Last-Modified"       : `${ doc.modified }`,
        "Content-Type"        : `application/pdf`
      })
      .send(doc.content)
  })
  .catch((err: any) => {
    return ((err instanceof Error) && (err.name === "External"))
      ? // Bad Request
        res.status(400).json({ msg: err.message })
      : // Internal Server Error
        res.status(500).json({ msg: "Contact an administrator." })
  })
})
.all((req: Request, res: Response, next: NextFunction) => {
  // Method Not Allowed
  return res.status(405).json({
    msg: "GET method is only supported."
  })
})

router.route("/:domain/projects/:projectName/bundles/:bundleId/vms/:vmName/logpath")
.get((req: Request, res: Response, next: NextFunction) => {
  return Project.getVmLogPath(req.token.usr, req.domain, req.project, req.bundleId, req.params.vmName)
  .then((vmLogPath: string) => {
    // OK
    return res.status(200).json({
      msg: "You get a virtual machine log path.",
      vmlog: vmLogPath
    })
  })
  .catch((err: any) => {
    return ((err instanceof Error) && (err.name === "External"))
      ? // Bad Request
        res.status(400).json({ msg: err.message })
      : // Internal Server Error
        res.status(500).json({ msg: "Contact an administrator." })
  })
})
.all((req: Request, res: Response, next: NextFunction) => {
  // Method Not Allowed
  return res.status(405).json({
    msg: "GET method is only supported."
  })
})


router.route("/:domain/projects/:projectName/bundles/:bundleId/vms/:vmName")
.get((req: Request, res: Response, next: NextFunction) => {
  return Project.getVmInfo(req.token.usr, req.domain, req.project, req.bundleId, req.params.vmName)
  .then((vmInfo: VmInfo) => {
    // OK
    return res.status(200).json({
      msg: "You get a virtual machine information.",
      vm: vmInfo
    })
  })
  .catch((err: any) => {
    return ((err instanceof Error) && (err.name === "External"))
      ? // Bad Request
        res.status(400).json({ msg: err.message })
      : // Internal Server Error
        res.status(500).json({ msg: "Contact an administrator." })
  })
})
.all((req: Request, res: Response, next: NextFunction) => {
  // Method Not Allowed
  return res.status(405).json({
    msg: "GET method is only supported."
  })
})


router.route("/:domain/projects/:projectName/bundles/:bundleId/vms")
.get((req: Request, res: Response, next: NextFunction) => {
  return Project.getVmList(req.token.usr, req.domain, req.project, req.bundleId)
  .then((list: Array<string>) => {
    // OK
    return res.status(200).json({
      msg: "You get a virtual machine list.",
      vms: list
    })
  })
  .catch((err: any) => {
    return ((err instanceof Error) && (err.name === "External"))
      ? // Bad Request
        res.status(400).json({ msg: err.message })
      : // Internal Server Error
        res.status(500).json({ msg: "Contact an administrator." })
  })
})
.all((req: Request, res: Response, next: NextFunction) => {
  // Method Not Allowed
  return res.status(405).json({
    msg: "GET method is only supported."
  })
})


router.route("/:domain/projects/:projectName/bundles/:bundleId/zdumps/:dumpName")
.get((req: Request, res: Response, next: NextFunction) => {
  const gzip = (typeof(req.query.gzip) === "string") ? (req.query.gzip === "true" ? true : false) : false
  return Project.getZdumpInfo(req.token.usr, req.domain, req.project, req.bundleId, req.params.dumpName, gzip)
  .then((zdumpInfo: ZdumpInfo | Buffer) => {
    // OK
    return res.status(200).json({
      msg: "You get a virtual machine information.",
      zdump: zdumpInfo,
      compression: `${ gzip ? "gzip" : "none" }`
    })
  })
  .catch((err: any) => {
    return ((err instanceof Error) && (err.name === "External"))
      ? // Bad Request
        res.status(400).json({ msg: err.message })
      : // Internal Server Error
        res.status(500).json({ msg: "Contact an administrator." })
  })
})
.all((req: Request, res: Response, next: NextFunction) => {
  // Method Not Allowed
  return res.status(405).json({
    msg: "GET method is only supported."
  })
})


router.route("/:domain/projects/:projectName/bundles/:bundleId/zdumps")
.get((req: Request, res: Response, next: NextFunction) => {
  return Project.getZdumpList(req.token.usr, req.domain, req.project, req.bundleId)
  .then((list: Array<string>) => {
    // OK
    return res.status(200).json({
      msg: "You get a zdump list.",
      zdumps: list
    })
  })
  .catch((err: any) => {
    return ((err instanceof Error) && (err.name === "External"))
      ? // Bad Request
        res.status(400).json({ msg: err.message })
      : // Internal Server Error
        res.status(500).json({ msg: "Contact an administrator." })
  })
})
.all((req: Request, res: Response, next: NextFunction) => {
  // Method Not Allowed
  return res.status(405).json({
    msg: "GET method is only supported."
  })
})


router.route("/:domain/projects/:projectName/bundles/:bundleId/vcs/:vcName")
.get((req: Request, res: Response, next: NextFunction) => {
  return Project.getVCenterInfo(req.token.usr, req.domain, req.project, req.bundleId, req.params.vcName)
  .then((vcInfo: VCenterInfo) => {
    // OK
    return res.status(200).json({
      msg: "You get a vcenter server information.",
      vc: vcInfo
    })
  })
  .catch((err: any) => {
    return ((err instanceof Error) && (err.name === "External"))
      ? // Bad Request
        res.status(400).json({ msg: err.message })
      : // Internal Server Error
        res.status(500).json({ msg: "Contact an administrator." })
  })
})
.all((req: Request, res: Response, next: NextFunction) => {
  // Method Not Allowed
  return res.status(405).json({
    msg: "GET method is only supported."
  })
})


router.route("/:domain/projects/:projectName/bundles/:bundleId/vcs")
.get((req: Request, res: Response, next: NextFunction) => {
  return Project.getVCenterList(req.token.usr, req.domain, req.project, req.bundleId)
  .then((list: Array<string>) => {
    // OK
    return res.status(200).json({
      msg: "You get a vcenter server list.",
      vcs: list
    })
  })
  .catch((err: any) => {
    return ((err instanceof Error) && (err.name === "External"))
      ? // Bad Request
        res.status(400).json({ msg: err.message })
      : // Internal Server Error
        res.status(500).json({ msg: "Contact an administrator." })
  })
})
.all((req: Request, res: Response, next: NextFunction) => {
  // Method Not Allowed
  return res.status(405).json({
    msg: "GET method is only supported."
  })
})


router.route("/:domain/projects/:projectName/bundles/:bundleId/hosts/:hostName")
.get((req: Request, res: Response, next: NextFunction) => {
  return Project.getHostInfo(req.token.usr, req.domain, req.project, req.bundleId, req.params.hostName)
  .then((hostInfo: HostInfo) => {
    // OK
    return res.status(200).json({
      msg: "You get a host information.",
      host: hostInfo
    })
  })
  .catch((err: any) => {
    return ((err instanceof Error) && (err.name === "External"))
      ? // Bad Request
        res.status(400).json({ msg: err.message })
      : // Internal Server Error
        res.status(500).json({ msg: "Contact an administrator." })
  })
})
.all((req: Request, res: Response, next: NextFunction) => {
  // Method Not Allowed
  return res.status(405).json({
    msg: "GET method is only supported."
  })
})


router.route("/:domain/projects/:projectName/bundles/:bundleId/hosts")
.get((req: Request, res: Response, next: NextFunction) => {
  return Project.getHostList(req.token.usr, req.domain, req.project, req.bundleId)
  .then((list: Array<string>) => {
    // OK
    return res.status(200).json({
      msg: "You get a host list.",
      hosts: list
    })
  })
  .catch((err: any) => {
    return ((err instanceof Error) && (err.name === "External"))
      ? // Bad Request
        res.status(400).json({ msg: err.message })
      : // Internal Server Error
        res.status(500).json({ msg: "Contact an administrator." })
  })
})
.all((req: Request, res: Response, next: NextFunction) => {
  // Method Not Allowed
  return res.status(405).json({
    msg: "GET method is only supported."
  })
})


router.route("/:domain/projects/:projectName/vms")
.get((req: Request, res: Response, next: NextFunction) => {
  return Project.getProjectVmList(req.token.usr, req.domain, req.project)
  .then((list: Array<VmlogBaseInfo>) => {
    // OK
    return res.status(200).json({
      msg: "You get a vm list.",
      vms: list
    })
  })
  .catch((err: any) => {
    return ((err instanceof Error) && (err.name === "External"))
      ? // Bad Request
        res.status(400).json({ msg: err.message })
      : // Internal Server Error
        res.status(500).json({ msg: "Contact an administrator." })
  })
})
.all((req: Request, res: Response, next: NextFunction) => {
  // Method Not Allowed
  return res.status(405).json({
    msg: "GET method is only supported."
  })
})


router.route("/:domain/projects/:projectName/hosts")
.get((req: Request, res: Response, next: NextFunction) => {
  return Project.getProjectHostList(req.token.usr, req.domain, req.project)
  .then((list: Array<VmlogBaseInfo>) => {
    // OK
    return res.status(200).json({
      msg: "You get a host list.",
      hosts: list
    })
  })
  .catch((err: any) => {
    return ((err instanceof Error) && (err.name === "External"))
      ? // Bad Request
        res.status(400).json({ msg: err.message })
      : // Internal Server Error
        res.status(500).json({ msg: "Contact an administrator." })
  })
})
.all((req: Request, res: Response, next: NextFunction) => {
  // Method Not Allowed
  return res.status(405).json({
    msg: "GET method is only supported."
  })
})


router.route("/:domain/projects/:projectName/bundles/:bundleId/files/*")
.get((req: Request, res: Response, next: NextFunction) => {
  const file = req.params[0]

  return Project.validateFileResource(req.token.usr, req.domain, req.project, req.bundleId, file)
  .then(() => {
    return Project.getFileResourceInfo(req.token.usr, req.domain, req.project, req.bundleId, file)
  })
  .then((fileInfo: FileInfo) => {
    if (fileInfo.isDirectory) {
      // OK
      return res.status(200).json({
        msg: `You get a file list of path /${ file } of project ${ req.project } bundle ID = ${ req.bundleId }.`,
        files: fileInfo.children
      })
    } else {
      if (req.query.mode && req.query.mode === "plain") {
        // OK
        return res.status(200).sendFile(fileInfo.path)
      } else if (req.query.mode && req.query.mode === "download") {
        const filter    = (typeof(req.query.filter)    === "string") ? decodeURIComponent(req.query.filter)              : null
        const sensitive = (typeof(req.query.sensitive) === "string") ? (req.query.sensitive === "false" ? false : true ) : true
        const date_from = (typeof(req.query.date_from) === "string") ? decodeURIComponent(req.query.date_from)           : null
        const date_to   = (typeof(req.query.date_to)   === "string") ? decodeURIComponent(req.query.date_to)             : null
        const gzip      = (typeof(req.query.gzip)      === "string") ? (req.query.gzip === "true" ? true : false)        : false
        // OK
        const filename  = gzip ? fileInfo.name + ".gz" : fileInfo.name
        return res.status(200)
          .set({
            "Content-Disposition" : `attachment; filename="${ filename }"`,
            "Accept-Ranges"       : "bytes",
            "Cache-Control"       : "public, max-age=0",
            "Last-Modified"       : `${ fileInfo.mtime }`,
            "Content-Type"        : "application/octet-stream"
          })
          .send(Project.getFileResourceAsBytesSync(req.token.usr, req.domain, req.project, req.bundleId, file, filter, sensitive, date_from, date_to, gzip))
      } else if (req.query.mode && req.query.mode === "json") {
        if (fileInfo.size >= (req.app.get("max-view-size") * 1024 * 1024)) {
          // Service Unavailable
          return res.status(503).json({
            msg: "This file's size is too large. Please use legacy view."
          })
        } else {
          // OK
          const format = (typeof(req.query.format) === "string") ? decodeURIComponent(req.query.format)       : "auto"
          const gzip   = (typeof(req.query.gzip)   === "string") ? (req.query.gzip === "true" ? true : false) : false
          return res.status(200).json({
            msg: `You get a file content of path /${ file } of project ${ req.project } bundle ID = ${ req.bundleId }.`,
            content: Project.getFileResourceAsJsonSync(req.token.usr, req.domain, req.project, req.bundleId, file, format, gzip),
            size: fileInfo.size,
            mtime: fileInfo.mtime,
            compression: `${ gzip ? "gzip" : "none" }`
          })
        }
      } else if (req.query.mode && req.query.mode === "term") {
        const cmd = os.platform() === "win32"              ? `more ${ fileInfo.path }` :
                    req.app.get("console-user") === "root" ? `less ${ fileInfo.path }` : `sudo -u ${ req.app.get("console-user") } less ${ fileInfo.path }`
        // OK
        return res.status(200).json({
          msg: `You get a terminal command to open the file of path /${ file } of project ${ req.project } bundle ID = ${ req.bundleId }.`,
          cmd: cmd
        })
      } else {
        // OK
        res.status(200).json({
          msg: `You get a file info of path /${ file } of project ${ req.project } bundle ID = ${ req.bundleId }.`,
          content: Project.getFileResourceSync(req.token.usr, req.domain, req.project, req.bundleId, file),
          size: fileInfo.size,
          mtime: fileInfo.mtime
        })
      }
    }
  })
  .catch((err: any) => {
    return ((err instanceof Error) && (err.name === "External"))
      ? // Bad Request
        res.status(400).json({ msg: err.message })
      : // Internal Server Error
        res.status(500).json({ msg: "Contact an administrator." })
  })
})
.all((req: Request, res: Response, next: NextFunction) => {
  // Method Not Allowed
  return res.status(405).json({
    msg: "GET method is only supported."
  })
})


router.route("/:domain/projects/:projectName/bundles/:bundleId/files")
.get((req: Request, res: Response, next: NextFunction) => {
  const search    = (typeof(req.query.search)    === "string") ? decodeURIComponent(req.query.search)    : null
  const date_from = (typeof(req.query.date_from) === "string") ? decodeURIComponent(req.query.date_from) : null
  const date_to   = (typeof(req.query.date_to)   === "string") ? decodeURIComponent(req.query.date_to)   : null
  return Project.getFileResourceList(req.token.usr, req.domain, req.project, req.bundleId, search, date_from, date_to)
  .then((node: NodeType) => {
    // OK
    return res.status(200).json({
      msg: `You get a file list of project ${ req.project } bundle ID = ${ req.bundleId }.`,
      files: node
    })
  })
  .catch((err: any) => {
    return ((err instanceof Error) && (err.name === "External"))
      ? // Bad Request
        res.status(400).json({ msg: err.message })
      : // Internal Server Error
        res.status(500).json({ msg: "Contact an administrator." })
  })
})
.all((req: Request, res: Response, next: NextFunction) => {
  // Method Not Allowed
  return res.status(405).json({
    msg: "GET method is only supported."
  })
})


router.route("/:domain/projects/:projectName/bundles/:bundleId")
.get((req: Request, res: Response, next: NextFunction) => {
  if (req.query.mode && req.query.mode === "download") {
    return Project.getOriginalBundleInfo(req.token.usr, req.domain, req.project, req.bundleId)
    .then((fileInfo: FileInfo) => {
      // OK
      return res.status(200)
        .set({
          "Content-Disposition" : `attachment; filename="${ fileInfo.name }"`,
          "Accept-Ranges"       : "bytes",
          "Cache-Control"       : "public, max-age=0",
          "Last-Modified"       : `${ fileInfo.mtime }`,
          "Content-Type"        : "application/octet-stream"
        })
        .send(Project.getOriginalBundleContentSync(req.token.usr, req.domain, req.project, fileInfo.name))
    })
    .catch((err: any) => {
      return ((err instanceof Error) && (err.name === "External"))
        ? // Bad Request
          res.status(400).json({ msg: err.message })
        : // Internal Server Error
          res.status(500).json({ msg: "Contact an administrator." })
    })
  } if (req.query.mode && req.query.mode === "term") {
    const dirpath = Project.getBundleResourcePathSync(req.token.usr, req.domain, req.project, req.bundleId)
    const cmd = os.platform() === "win32"              ? `cmd /k cd ${ dirpath }` :
                req.app.get("console-user") === "root" ? `cd ${ dirpath }; bash`  : `cd ${ dirpath }; sudo -u ${ req.app.get("console-user") } bash`
    // OK
    return res.status(200).json({
      msg: `You get a terminal command to open the console of project ${ req.project } bundle ID = ${ req.bundleId }.`,
      cmd: cmd
    })
  } else {
    return Project.getBundleInfo(req.token.usr, req.domain, req.project, req.bundleId)
    .then((bundleInfo: BundleInfo) => {
      // OK
      return res.status(200).json({
        msg: `You get a bundle name and description of bundle ID = ${ req.bundleId }.`,
        name: bundleInfo.name,
        description: bundleInfo.description,
        type: bundleInfo.type,
        date: bundleInfo.date,
        preserved: bundleInfo.preserved
      })
    })
    .catch((err: any) => {
      return ((err instanceof Error) && (err.name === "External"))
        ? // Bad Request
          res.status(400).json({ msg: err.message })
        : // Internal Server Error
          res.status(500).json({ msg: "Contact an administrator." })
    })
  }
})
.put((req: Request, res: Response, next: NextFunction) => {
  const bundelDescription = req.body.description

  if (!bundelDescription) {
    // Bad Request
    return res.status(400).json({
      msg: "Bundle description is required. (param name: description)"
    })
  }

  return Project.updateBundleDescription(req.token.usr, req.domain, req.project, req.bundleId, bundelDescription)
  .then(() => {
    // OK
    return res.status(200).json({
      msg: `bundle: bundle ID=${ req.bundleId } description was updated successfully.`
    })
  })
  .catch((err: any) => {
    return ((err instanceof Error) && (err.name === "External"))
      ? // Bad Request
        res.status(400).json({ msg: err.message })
      : // Internal Server Error
        res.status(500).json({ msg: "Contact an administrator." })
  })
})
.delete((req: Request, res: Response, next: NextFunction) => {
  if (!["public", "private"].includes(req.domain) && req.token.prv !== "root") {
    // Bad Request
    return res.status(403).json({
      msg: `bundle: ${ req.bundleName } is only deleted by an administrator.`
    })
  }

  return Project.deleteBundleResource(req.token.usr, req.domain, req.project, req.bundleId)
  .then(() => {
    // OK
    return res.status(200).json({
      msg: `bundle: bundle ID = ${ req.bundleId } was deleted successfully.`
    })
  })
  .catch((err: any) => {
    return ((err instanceof Error) && (err.name === "External"))
      ? // Bad Request
        res.status(400).json({ msg: err.message })
      : // Internal Server Error
        res.status(500).json({ msg: "Contact an administrator." })
  })
})
.all((req: Request, res: Response, next: NextFunction) => {
  // Method Not Allowed
  return res.status(405).json({
    msg: "GET/PUT/DELETE method are only supported."
  })
})


router.route("/:domain/projects/:projectName/bundles")
.get((req: Request, res: Response, next: NextFunction) => {
  return Project.getBundleResourceList(req.token.usr, req.domain, req.project)
  .then((list: Array<BundleInfo>) => {
    // OK
    return res.status(200).json({
      msg: `You get a bundle list of project ${ req.project }.`,
      bundles: list
    })
  })
  .catch((err: any) => {
    return ((err instanceof Error) && (err.name === "External"))
      ? // Bad Request
        res.status(400).json({ msg: err.message })
      : // Internal Server Error
        res.status(500).json({ msg: "Contact an administrator." })
  })
})
.post((req: Request, res: Response, next: NextFunction) => {
  return multer({
    storage: multer.diskStorage({
      destination : (req, file, cb) => cb(null, Project.getProjectResourcePathSync(req.token.usr, req.domain, req.project)),
      filename    : (req, file, cb) => cb(null, file.originalname)
    })
  }).single("bundle")(req, res, (err: any) => {
    if (err) {
      (err instanceof Error) && logger.error(`${ err.name }: ${ err.message }`)
      // Bad Request
      return res.status(500).json({
        msg: "Contact an administrator."
      })
    }

    if (!req.file) {
      // Bad Request
      return res.status(400).json({
        msg: "log bundle is required. (param name: bundle)"
      })
    }

    return Project.registerBundleResource(req.token.usr, req.domain, req.project, req.file.originalname, req.body.description || "", req.body.preserve === "true")
    .then((bundleInfo: BundleInfo) => {
      // Created
      return res.status(201).location(`${ req.protocol }://${ req.headers.host }${ req.path }/`).json({
        msg : `bundle: ${ req.file.originalname } was uploaded and was decompressed successfully.`,
        id  : bundleInfo.id,
        name: bundleInfo.name,
        type: bundleInfo.type
      })
    })
    .catch((err: any) => {
      return ((err instanceof Error) && (err.name === "External"))
        ? // Bad Request
          res.status(400).json({ msg: err.message })
        : // Internal Server Error
          res.status(500).json({ msg: "Contact an administrator." })
    })
  })
})
.all((req: Request, res: Response, next: NextFunction) => {
  // Method Not Allowed
  return res.status(405).json({
    msg: "GET/POST method are only supported."
  })
})


router.route("/:domain/projects/:projectName")
.get((req: Request, res: Response, next: NextFunction) => {
  return Project.getProjectInfo(req.token.usr, req.domain, req.project)
  .then((projectInfo: ProjectInfo) => {
    // OK
    return res.status(200).json({
      msg: "You get a project status and description.",
      status: projectInfo.status,
      description: projectInfo.description
    })
  })
  .catch((err: any) => {
    return ((err instanceof Error) && (err.name === "External"))
      ? // Bad Request
        res.status(400).json({ msg: err.message })
      : // Internal Server Error
        res.status(500).json({ msg: "Contact an administrator." })
  })
})
.put((req: Request, res: Response, next: NextFunction) => {
  const projectDescription = req.body.description
  const projectStatus = req.body.status

  if (req.token.usr === "anonymous") {
    // Forbidden
    return res.status(403).json({ msg: "Not be permitted to access." })
  }

  if (projectStatus) {
    return Project.updateProjectStatus(req.token.usr, req.domain, req.project, projectStatus)
    .then(() => {
      // OK
      return res.status(200).json({
        msg: `project: ${ req.project } status was updated successfully.`
      })
    })
    .catch((err: any) => {
      return ((err instanceof Error) && (err.name === "External"))
        ? // Bad Request
          res.status(400).json({ msg: err.message })
        : // Internal Server Error
          res.status(500).json({ msg: "Contact an administrator." })
    })
  } else if (projectDescription) {
    return Project.updateProjectDescription(req.token.usr, req.domain, req.project, projectDescription)
    .then(() => {
      // OK
      return res.status(200).json({
        msg: `project: ${ req.project } description was updated successfully.`
      })
    })
    .catch((err: any) => {
      return ((err instanceof Error) && (err.name === "External"))
        ? // Bad Request
          res.status(400).json({ msg: err.message })
        : // Internal Server Error
          res.status(500).json({ msg: "Contact an administrator." })
    })
  } else {
    // Bad Request
    return res.status(400).json({
      msg: "Project status or description is required. (param name: status, description)"
    })
  }
})
.delete((req: Request, res: Response, next: NextFunction) => {
  if (!["public", "private"].includes(req.domain) && req.token.prv !== "root") {
    // Bad Request
    return res.status(403).json({
      msg: `project: ${ req.project } is only deleted by an administrator.`
    })
  }

  return Project.deleteProjectResource(req.token.usr, req.domain, req.project)
  .then(() => {
    // OK
    return res.status(200).json({
      msg: `project: ${ req.project } was deleted successfully.`
    })
  })
  .catch((err: any) => {
    return ((err instanceof Error) && (err.name === "External"))
      ? // Bad Request
        res.status(400).json({ msg: err.message })
      : // Internal Server Error
        res.status(500).json({ msg: "Contact an administrator." })
  })
})
.all((req: Request, res: Response, next: NextFunction) => {
  // Method Not Allowed
  return res.status(405).json({
    msg: "GET/PUT/DELETE method are only supported."
  })
})


router.route("/:domain/projects")
.get((req: Request, res: Response, next: NextFunction) => {
  if (req.token.usr === "anonymous") {
    // Forbidden
    return res.status(403).json({ msg: "Not be permitted to access." })
  }

  return Project.getProjectResourceList(req.token.usr, req.domain)
  .then((list: Array<ProjectInfo>) => {
    // OK
    return res.status(200).json({
      msg: "You get a project list.",
      projects: list
    })
  })
  .catch((err: any) => {
    return ((err instanceof Error) && (err.name === "External"))
      ? // Bad Request
        res.status(400).json({ msg: err.message })
      : // Internal Server Error
        res.status(500).json({ msg: "Contact an administrator." })
  })
})
.post((req: Request, res: Response, next: NextFunction) => {
  const projectName = req.body.name
  const projectDesc = req.body.description || ""

  if (!projectName) {
    // Bad Request
    return res.status(400).json({
      msg: "Project name is required. (param name: name)"
    })
  }

  if (req.token.usr === "anonymous") {
    // Forbidden
    return res.status(403).json({ msg: "Not be permitted to access." })
  }

  return Project.createProjectResource(req.token.usr, req.domain, projectName, projectDesc)
  .then(() => {
    // Created
    return res.status(201).location(`${ req.protocol }://${ req.headers.host }${ req.path }/${ projectName }`).json({
      msg: `project: ${ projectName } was created successfully.`
    })
  })
  .catch((err: any) => {
    return ((err instanceof Error) && (err.name === "External"))
      ? // Bad Request
        res.status(400).json({ msg: err.message })
      : // Internal Server Error
        res.status(500).json({ msg: "Contact an administrator." })
  })
})
.all((req: Request, res: Response, next: NextFunction) => {
  // Method Not Allowed
  return res.status(405).json({
    msg: "GET/POST method are only supported."
  })
})


router.route("/:domain")
.get((req: Request, res: Response, next: NextFunction) => {
  // OK
  return res.status(200).json({
    msg: `domain: ${ req.domain } is available.`
  })
})
.all((req: Request, res: Response, next: NextFunction) => {
  // Method Not Allowed
  return res.status(405).json({
    msg: "GET method are only supported."
  })
})


export default router
